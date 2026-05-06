-- Track when a pet is hidden so the listing can be permanently removed after
-- the retention window.

alter table public.pets
  add column if not exists hidden_at timestamptz;

create index if not exists pets_hidden_at_idx
  on public.pets(hidden_at)
  where status = 'hidden' and hidden_at is not null;

create or replace function public.set_pet_hidden_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'hidden' then
    new.hidden_at := coalesce(new.hidden_at, now());
  elsif old.status = 'hidden' and new.status is distinct from old.status then
    new.hidden_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists pets_set_hidden_at on public.pets;

create trigger pets_set_hidden_at
before update of status, hidden_at on public.pets
for each row
execute function public.set_pet_hidden_at();

update public.pets
set hidden_at = coalesce(hidden_at, now())
where status = 'hidden'
  and hidden_at is null;
