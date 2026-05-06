-- Privacy/security hardening for public pet profiles.
-- Apply before deploying frontend code that reads public_lat/public_lng.

create extension if not exists "pgcrypto";

alter table public.pets
  add column if not exists public_lat numeric,
  add column if not exists public_lng numeric,
  add column if not exists public_location text,
  add column if not exists contact_consent_acknowledged_at timestamptz;

alter table public.pets
  alter column caretaker_phone drop not null;

create or replace function public.jitter_pet_coordinate(
  exact_lat double precision,
  exact_lng double precision
) returns table(public_lat numeric, public_lng numeric)
language plpgsql
as $$
declare
  meters double precision;
  angle double precision;
  earth_m_per_degree double precision := 111320.0;
  lat_offset double precision;
  lng_offset double precision;
begin
  if exact_lat is null or exact_lng is null then
    public_lat := null;
    public_lng := null;
    return next;
    return;
  end if;

  meters := 300 + random() * 400;
  angle := random() * 2 * pi();
  lat_offset := (meters * cos(angle)) / earth_m_per_degree;
  lng_offset := (meters * sin(angle)) / (earth_m_per_degree * greatest(cos(radians(exact_lat)), 0.0001));

  public_lat := round((exact_lat + lat_offset)::numeric, 6);
  public_lng := round((exact_lng + lng_offset)::numeric, 6);
  return next;
end;
$$;

create or replace function public.set_public_pet_location()
returns trigger
language plpgsql
as $$
declare
  jittered record;
begin
  if new.lat is null or new.lng is null then
    new.public_lat := null;
    new.public_lng := null;
  else
    if tg_op = 'INSERT' or new.public_lat is null or new.public_lng is null then
      select * into jittered from public.jitter_pet_coordinate(new.lat, new.lng);
      new.public_lat := jittered.public_lat;
      new.public_lng := jittered.public_lng;
    elsif tg_op = 'UPDATE' and (new.lat is distinct from old.lat or new.lng is distinct from old.lng) then
      select * into jittered from public.jitter_pet_coordinate(new.lat, new.lng);
      new.public_lat := jittered.public_lat;
      new.public_lng := jittered.public_lng;
    end if;
  end if;

  if tg_op = 'INSERT' or new.public_location is null then
    new.public_location := public.coarse_pet_location_label(new.location);
  elsif tg_op = 'UPDATE' and new.location is distinct from old.location then
    new.public_location := public.coarse_pet_location_label(new.location);
  end if;

  return new;
end;
$$;

create or replace function public.coarse_pet_location_label(raw_location text)
returns text
language plpgsql
immutable
as $$
declare
  parts text[];
  n int;
  first_part text;
  last_part text;
begin
  if raw_location is null or btrim(raw_location) = '' then
    return null;
  end if;

  parts := regexp_split_to_array(raw_location, '\s*,\s*');
  n := array_length(parts, 1);

  if n is null or n = 0 then
    return regexp_replace(btrim(raw_location), '[[:space:]]+[0-9]+[[:alnum:]\/-]*', '', 'g');
  end if;

  first_part := btrim(parts[1]);
  last_part := btrim(parts[n]);

  if n >= 2 then
    if first_part ~ '[0-9]' then
      return last_part;
    end if;
    return first_part || case when lower(first_part) = lower(last_part) then '' else ', ' || last_part end;
  end if;

  return regexp_replace(first_part, '[[:space:]]+[0-9]+[[:alnum:]\/-]*', '', 'g');
end;
$$;

drop trigger if exists pets_set_public_location on public.pets;
create trigger pets_set_public_location
  before insert or update of lat, lng, location on public.pets
  for each row execute function public.set_public_pet_location();

with jittered as (
  select p.id, j.public_lat, j.public_lng
  from public.pets p
  cross join lateral public.jitter_pet_coordinate(p.lat, p.lng) j
  where p.lat is not null
    and p.lng is not null
    and (p.public_lat is null or p.public_lng is null)
)
update public.pets p
set public_lat = j.public_lat,
    public_lng = j.public_lng
from jittered j
where p.id = j.id;

update public.pets
set public_location = public.coarse_pet_location_label(location)
where public_location is null
  and location is not null;

create table if not exists public.pet_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade,
  requester_contact text,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'completed', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists pet_deletion_requests_pet_id_idx
  on public.pet_deletion_requests(pet_id);

create index if not exists pet_deletion_requests_status_created_at_idx
  on public.pet_deletion_requests(status, created_at desc);

alter table public.pets enable row level security;
alter table public.pet_deletion_requests enable row level security;

drop policy if exists "pets_public_read" on public.pets;
drop policy if exists "pets_auth_insert" on public.pets;
drop policy if exists "pets_owner_update" on public.pets;
drop policy if exists "pets_authed_update" on public.pets;
drop policy if exists "pets_owner_delete" on public.pets;
drop policy if exists "pets_authed_delete" on public.pets;
drop policy if exists "Public can view available pets" on public.pets;
drop policy if exists "Authenticated can insert own pets" on public.pets;
drop policy if exists "Authenticated can update own pets" on public.pets;
drop policy if exists "Authenticated can delete pets" on public.pets;
drop policy if exists "Authenticated can update pets" on public.pets;

create policy "Public can view available pets"
on public.pets
for select
using (status = 'available');

create policy "Authenticated can insert own pets"
on public.pets
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Authenticated can update own pets"
on public.pets
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Intentionally no client-side DELETE policy. Admin hides pets through the
-- service-role Vercel API by setting status='hidden'.

drop policy if exists "Anyone can request pet deletion" on public.pet_deletion_requests;
drop policy if exists "No public read of deletion requests" on public.pet_deletion_requests;

create policy "Anyone can request pet deletion"
on public.pet_deletion_requests
for insert
to anon, authenticated
with check (true);

revoke select on public.pets from anon, authenticated;
grant select (
  id,
  species,
  name,
  age,
  breed,
  gender,
  personality,
  health,
  public_location,
  public_lat,
  public_lng,
  photo_url,
  caretaker_name,
  caretaker_phone,
  description,
  status,
  created_by,
  created_at,
  updated_at
) on public.pets to anon, authenticated;

grant insert (
  species,
  name,
  age,
  breed,
  gender,
  personality,
  health,
  location,
  lat,
  lng,
  photo_url,
  caretaker_name,
  caretaker_phone,
  description,
  created_by,
  contact_consent_acknowledged_at
) on public.pets to authenticated;

grant update (
  species,
  name,
  age,
  breed,
  gender,
  personality,
  health,
  location,
  lat,
  lng,
  photo_url,
  caretaker_name,
  caretaker_phone,
  description,
  contact_consent_acknowledged_at
) on public.pets to authenticated;

revoke all on public.pet_deletion_requests from anon, authenticated;
grant insert (pet_id, requester_contact, reason)
  on public.pet_deletion_requests to anon, authenticated;
