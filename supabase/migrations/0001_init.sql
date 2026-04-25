-- Pet Rescue Georgia — initial schema
-- Run via: supabase db push  (or apply through the Supabase Dashboard SQL editor)

create extension if not exists "uuid-ossp";

-- Pets up for adoption (dogs & cats)
create table if not exists public.pets (
  id              uuid primary key default uuid_generate_v4(),
  species         text not null check (species in ('dog', 'cat')) default 'dog',
  name            text not null,
  age             text,
  breed           text,
  gender          text check (gender in ('მამრობითი', 'მდედრობითი')),
  personality     text,
  health          text,
  location        text,
  lat             double precision,
  lng             double precision,
  photo_url       text not null,
  caretaker_name  text,
  caretaker_phone text not null,
  description     text,
  status          text not null default 'available' check (status in ('available', 'pending', 'adopted', 'hidden')),
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists pets_status_idx on public.pets(status);
create index if not exists pets_species_idx on public.pets(species);
create index if not exists pets_created_at_idx on public.pets(created_at desc);

-- Per-user swipe history (likes / dislikes)
create table if not exists public.swipes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  pet_id      uuid not null references public.pets(id) on delete cascade,
  decision    text not null check (decision in ('like', 'dislike')),
  created_at  timestamptz not null default now(),
  unique (user_id, pet_id)
);

create index if not exists swipes_user_idx on public.swipes(user_id);
create index if not exists swipes_pet_idx on public.swipes(pet_id);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.pets   enable row level security;
alter table public.swipes enable row level security;

-- Pets: anyone can read available pets; authenticated users can insert; owners (or admins) can update/delete their own.
drop policy if exists "pets_public_read" on public.pets;
create policy "pets_public_read" on public.pets
  for select using (status = 'available' or auth.uid() = created_by);

drop policy if exists "pets_auth_insert" on public.pets;
create policy "pets_auth_insert" on public.pets
  for insert with check (auth.uid() = created_by);

-- Update / delete: any authenticated user (the "admin" gate is enforced
-- client-side via the hidden 10-tap unlock — see src/contexts/AdminMode.tsx).
drop policy if exists "pets_owner_update" on public.pets;
drop policy if exists "pets_authed_update" on public.pets;
create policy "pets_authed_update" on public.pets
  for update using (auth.role() = 'authenticated');

drop policy if exists "pets_owner_delete" on public.pets;
drop policy if exists "pets_authed_delete" on public.pets;
create policy "pets_authed_delete" on public.pets
  for delete using (auth.role() = 'authenticated');

-- Swipes: each user only sees & manages their own.
drop policy if exists "swipes_self_read" on public.swipes;
create policy "swipes_self_read" on public.swipes
  for select using (auth.uid() = user_id);

drop policy if exists "swipes_self_write" on public.swipes;
create policy "swipes_self_write" on public.swipes
  for insert with check (auth.uid() = user_id);

drop policy if exists "swipes_self_update" on public.swipes;
create policy "swipes_self_update" on public.swipes
  for update using (auth.uid() = user_id);

drop policy if exists "swipes_self_delete" on public.swipes;
create policy "swipes_self_delete" on public.swipes
  for delete using (auth.uid() = user_id);

-- Storage bucket for pet photos (run only the first time)
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- Anyone can read public photos; authed users can upload to their own folder.
drop policy if exists "pet_photos_public_read" on storage.objects;
create policy "pet_photos_public_read" on storage.objects
  for select using (bucket_id = 'pet-photos');

drop policy if exists "pet_photos_auth_upload" on storage.objects;
create policy "pet_photos_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'pet-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
