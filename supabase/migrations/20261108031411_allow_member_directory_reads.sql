-- Signed-in members can see each other on /members; keep only shareable columns on this table.
drop policy profiles_select_own on public.profiles;
create policy profiles_select_members on public.profiles for select to authenticated using (true);
