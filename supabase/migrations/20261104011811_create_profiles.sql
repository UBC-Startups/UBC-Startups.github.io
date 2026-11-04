create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (first_name ~ '^[^[:space:]]' and first_name ~ '[^[:space:]]$'),
  last_name text not null check (last_name ~ '^[^[:space:]]' and last_name ~ '[^[:space:]]$')
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert on public.profiles to authenticated;
grant update (first_name, last_name) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
