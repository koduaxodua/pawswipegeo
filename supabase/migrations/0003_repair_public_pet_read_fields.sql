-- Repair migration for production projects that received the privacy UI deploy
-- before the public pet read fields/grants were fully applied.

create extension if not exists "pgcrypto";

alter table public.pets
  add column if not exists public_lat numeric,
  add column if not exists public_lng numeric,
  add column if not exists public_location text,
  add column if not exists contact_consent_acknowledged_at timestamptz;

alter table public.pets
  alter column caretaker_phone drop not null;

create or replace function public.coarse_pet_location_label(raw_location text)
returns text
language plpgsql
immutable
as $$
declare
  parts text[];
  part_count integer;
begin
  if raw_location is null or btrim(raw_location) = '' then
    return null;
  end if;

  parts := regexp_split_to_array(raw_location, '[[:space:]]*,[[:space:]]*');
  part_count := array_length(parts, 1);

  if part_count is null or part_count = 0 then
    return null;
  end if;

  if part_count = 1 then
    return btrim(parts[1]);
  end if;

  if parts[1] ~ '[0-9]' then
    return btrim(parts[part_count]);
  end if;

  return concat_ws(', ', nullif(btrim(parts[1]), ''), nullif(btrim(parts[part_count]), ''));
end;
$$;

create or replace function public.jitter_pet_coordinate(
  source_lat numeric,
  source_lng numeric
)
returns table(public_lat numeric, public_lng numeric)
language plpgsql
volatile
as $$
declare
  radius_meters double precision;
  bearing double precision;
  lat_offset double precision;
  lng_offset double precision;
  meters_per_degree_lng double precision;
begin
  if source_lat is null or source_lng is null then
    public_lat := null;
    public_lng := null;
    return next;
  end if;

  radius_meters := 300 + random() * 400;
  bearing := random() * 2 * pi();
  lat_offset := (radius_meters * cos(bearing)) / 111320;
  meters_per_degree_lng := greatest(111320 * cos(radians(source_lat::double precision)), 1);
  lng_offset := (radius_meters * sin(bearing)) / meters_per_degree_lng;

  public_lat := round((source_lat::double precision + lat_offset)::numeric, 6);
  public_lng := round((source_lng::double precision + lng_offset)::numeric, 6);
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
  if tg_op = 'INSERT'
    or new.lat is distinct from old.lat
    or new.lng is distinct from old.lng
    or new.public_lat is null
    or new.public_lng is null then
    select * into jittered from public.jitter_pet_coordinate(new.lat, new.lng);
    new.public_lat := jittered.public_lat;
    new.public_lng := jittered.public_lng;
  end if;

  if tg_op = 'INSERT'
    or new.location is distinct from old.location
    or new.public_location is null then
    new.public_location := public.coarse_pet_location_label(new.location);
  end if;

  return new;
end;
$$;

drop trigger if exists pets_set_public_location on public.pets;

create trigger pets_set_public_location
before insert or update of lat, lng, location on public.pets
for each row
execute function public.set_public_pet_location();

with jittered as (
  select p.id, j.public_lat, j.public_lng
  from public.pets p
  cross join lateral public.jitter_pet_coordinate(p.lat, p.lng) as j
  where p.lat is not null
    and p.lng is not null
    and (p.public_lat is null or p.public_lng is null)
)
update public.pets as p
set
  public_lat = jittered.public_lat,
  public_lng = jittered.public_lng
from jittered
where p.id = jittered.id;

update public.pets
set public_location = public.coarse_pet_location_label(location)
where public_location is null
  and location is not null;

create table if not exists public.pet_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade,
  requester_contact text null,
  reason text null,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'completed', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null
);

alter table public.pets enable row level security;
alter table public.pet_deletion_requests enable row level security;

drop policy if exists "Public can view available pets" on public.pets;
drop policy if exists "Authenticated can insert own pets" on public.pets;
drop policy if exists "Authenticated can update own pets" on public.pets;
drop policy if exists "Authenticated can delete pets" on public.pets;
drop policy if exists "Authenticated can update pets" on public.pets;
drop policy if exists "Allow anonymous insert" on public.pets;
drop policy if exists "Allow public insert" on public.pets;
drop policy if exists "Allow public update" on public.pets;
drop policy if exists "Allow public delete" on public.pets;

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

drop policy if exists "Anyone can create deletion requests" on public.pet_deletion_requests;
drop policy if exists "No public read of deletion requests" on public.pet_deletion_requests;

create policy "Anyone can create deletion requests"
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
  status,
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
on public.pet_deletion_requests
to anon, authenticated;
