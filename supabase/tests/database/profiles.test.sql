-- Shared basic profile: public.profiles
--
-- Verifies the constraints and access rules from 20261104011811_create_profiles.sql
-- and 20261108031411_allow_member_directory_reads.sql by acting as three callers:
-- the profile owner, another signed-in account, and an anonymous request.
--
-- Everything runs in one transaction and is rolled back, so the synthetic
-- auth.users rows below never persist in the local database.
--
-- How a caller is simulated:
--   * set local role authenticated|anon -> the Postgres role PostgREST uses
--     for a request with a user JWT, or with only the publishable/anon key.
--   * set_config('request.jwt.claim.sub', <uuid>, true) -> the JWT "sub" claim
--     that auth.uid() reads. `true` makes the setting transaction-local.
--
-- SQLSTATE codes asserted below:
--   23502 not_null_violation       23505 unique_violation
--   23514 check_violation          42501 insufficient_privilege
begin;

-- plan() must match the number of assertions in this file.
select plan(17);

-- Two synthetic accounts. auth.users is the real Supabase Auth table, so these
-- UUIDs can satisfy the foreign key on profiles.user_id.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'one@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'two@example.test');

select has_table('public', 'profiles', 'shared profiles table exists');

-- ===========================================================================
-- Caller 1: the profile owner (user 1)
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

-- The insert policy's WITH CHECK requires the new row's user_id to equal
-- auth.uid(), so an owner can create exactly their own profile.
select lives_ok($$insert into public.profiles values ('11111111-1111-1111-1111-111111111111','Ada','Lovelace')$$, 'owner can create profile');
-- Only user 1's profile exists so far, so the owner sees exactly one row.
select is((select count(*) from public.profiles), 1::bigint, 'owner can read profile');
select lives_ok($$update public.profiles set first_name = 'Grace'$$, 'owner can edit name');

-- user_id is the primary key, which enforces one profile per account (23505).
select throws_ok($$insert into public.profiles values ('11111111-1111-1111-1111-111111111111','Ada','Lovelace')$$, '23505', null, 'duplicate profile rejected');

-- The name check constraints reject empty and whitespace-only values (23514),
-- so the form's trim() is a convenience rather than the only validation.
select throws_ok($$update public.profiles set first_name = '   '$$, '23514', null, 'blank name rejected');
select throws_ok($$update public.profiles set first_name = E'\t'$$, '23514', null, 'tab-only first name rejected');
select throws_ok($$update public.profiles set last_name = E'\n'$$, '23514', null, 'newline-only last name rejected');
select throws_ok($$update public.profiles set first_name = E'\tAda'$$, '23514', null, 'leading tab in first name rejected');
select throws_ok($$update public.profiles set last_name = E'Lovelace\n'$$, '23514', null, 'trailing newline in last name rejected');

select throws_ok($$update public.profiles set last_name = null$$, '23502', null, 'missing last name rejected');

-- 42501 from privileges, not RLS: UPDATE is granted only on (first_name,
-- last_name), and column privileges are checked before policies run. This is
-- what stops a user pointing their row at another account's UUID.
select throws_ok($$update public.profiles set user_id = '22222222-2222-2222-2222-222222222222'$$, '42501', null, 'cannot reassign profile');
-- 42501 from the insert policy instead: the row's user_id must equal the
-- caller's auth.uid(), so an app bug cannot forge a profile for anyone else.
select throws_ok($$insert into public.profiles values ('22222222-2222-2222-2222-222222222222','Other','User')$$, '42501', null, 'cannot create another user profile');

-- ===========================================================================
-- Caller 2: a different signed-in account (user 2)
-- ===========================================================================
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

-- The member directory lets any signed-in account read every profile.
select is((select count(*) from public.profiles), 1::bigint, 'other signed-in user can read profile');
-- The update policy still limits writes to the owner. A filtered UPDATE raises
-- no error, so count the rows the statement actually touched instead.
with changed as (update public.profiles set first_name = 'Other' returning 1) select is((select count(*) from changed), 0::bigint, 'other user cannot update profile');

-- ===========================================================================
-- Caller 3: anonymous request (publishable key, no user JWT)
-- ===========================================================================
reset role;
set local role anon;

-- The migration revokes all privileges from anon, so these fail at the
-- privilege layer before RLS is consulted: denied outright, never filtered.
select throws_ok($$select * from public.profiles$$, '42501', null, 'anonymous read rejected');
select throws_ok($$insert into public.profiles values ('22222222-2222-2222-2222-222222222222','Other','User')$$, '42501', null, 'anonymous insert rejected');

reset role;
select * from finish();
rollback;
