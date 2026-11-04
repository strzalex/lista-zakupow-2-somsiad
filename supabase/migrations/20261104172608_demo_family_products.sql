grant select on public.family_members to authenticated;

create policy "Read own family memberships"
  on public.family_members for select to authenticated
  using (user_id = (select auth.uid()));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  bought boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_family_id_idx on public.products (family_id);

revoke all on public.products from public, anon, authenticated;
grant select, insert, update, delete on public.products to authenticated;

create policy "Manage products in own family"
  on public.products for all to authenticated
  using (family_id in (
    select family_id from public.family_members where user_id = (select auth.uid())
  ))
  with check (family_id in (
    select family_id from public.family_members where user_id = (select auth.uid())
  ));

-- Intentional vulnerability for the isolated classroom database.
-- The policy above takes effect after ENABLE ROW LEVEL SECURITY.
alter table public.products disable row level security;
