do $$
declare
  demo_family constant uuid := '54f371fa-88b7-4fbd-96eb-cabf8b9bafbb';
  ani_id uuid;
  bartek_id uuid;
begin
  select id into ani_id from auth.users where email = 'ania@local.pl';
  select id into bartek_id from auth.users where email = 'bartek@local.pl';

  if ani_id is null or bartek_id is null then
    raise exception 'Create ania@local.pl and bartek@local.pl in Supabase Auth before seeding.';
  end if;

  insert into public.families (id, name)
  values (demo_family, 'Rodzina Ani i Bartka')
  on conflict (id) do nothing;

  insert into public.family_members (family_id, user_id)
  values (demo_family, ani_id), (demo_family, bartek_id)
  on conflict (family_id, user_id) do nothing;

  insert into public.products (id, family_id, name, bought)
  values
    ('54f371fa-88b7-4fbd-96eb-cabf8b9bafb1', demo_family, 'Chleb na zakwasie', false),
    ('54f371fa-88b7-4fbd-96eb-cabf8b9bafb2', demo_family, 'Jabłka', false),
    ('54f371fa-88b7-4fbd-96eb-cabf8b9bafb3', demo_family, 'Makaron do lasagne', true)
  on conflict (id) do nothing;
end $$;
