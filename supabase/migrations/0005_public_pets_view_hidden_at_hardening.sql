-- Public read hardening: public clients read the safe view, not the base table.
-- The view excludes hidden_at plus exact lat/lng, created_by, and internal review fields.

create or replace view public.pets_public as
select
  id,
  species,
  name,
  age,
  breed,
  gender,
  personality,
  health,
  public_location as location,
  public_lat,
  public_lng,
  photo_url,
  caretaker_name,
  caretaker_phone,
  description,
  created_at
from public.pets
where status = 'available';

revoke all on public.pets_public from public;
revoke all on public.pets_public from anon, authenticated;
grant select on public.pets_public to anon, authenticated;

-- Public app reads should go through pets_public. Authenticated users still need
-- base-table access for their own inserts/updates under existing RLS policies.
revoke select on public.pets from anon;
