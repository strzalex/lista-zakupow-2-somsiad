create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> '')
);

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (family_id, user_id)
);

create index family_members_user_id_idx on public.family_members (user_id);

alter table public.families enable row level security;
alter table public.family_members enable row level security;

revoke all on public.families, public.family_members from public, anon, authenticated;
