-- Event editions and registrations: public.events, public.event_registrations
--
-- Verifies the constraints and read-only access rules from
-- 20261104011923_create_event_signup_tables.sql. The caller switches between
-- the privileged role (constraints and fixtures), a signed-in attendee (RLS),
-- and an anonymous request (grants).
--
-- Everything runs in one transaction and is rolled back, so the synthetic
-- auth.users rows and fixtures below never persist in the local database.
--
-- Fixture note: profiles, events, and the registration fixtures are inserted
-- BEFORE any `set local role`, i.e. as the migration/superuser role. No real
-- caller can write registrations (see the access section), so the fixtures
-- have to be created the way migrations and seeds create them.
--
-- How a caller is simulated:
--   * set local role authenticated|anon -> the Postgres role PostgREST uses
--     for a request with a user JWT, or with only the publishable/anon key.
--   * set_config('request.jwt.claim.sub', <uuid>, true) -> the JWT "sub" claim
--     that auth.uid() reads. `true` makes the setting transaction-local.
--
-- SQLSTATE codes asserted below:
--   23503 foreign_key_violation   23505 unique_violation
--   23514 check_violation         42501 insufficient_privilege
begin;

-- plan() must match the number of assertions in this file.
select plan(32);

-- Three synthetic accounts and their shared basic profiles (Task 1's table).
-- The third account owns the pending/declined fixtures so the read-count
-- assertions for the first two accounts keep their original expectations.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'one@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'two@example.test'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'three@example.test');
insert into public.profiles values
  ('11111111-1111-1111-1111-111111111111', 'First', 'User'),
  ('22222222-2222-2222-2222-222222222222', 'Second', 'User'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Third', 'User');

select has_table('public', 'events', 'events table exists');
select has_table('public', 'event_registrations', 'registration table exists');

-- ===========================================================================
-- Constraint layer (running as the privileged role)
-- ===========================================================================
-- capacity NULL means uncapped: `NULL > 0` is NULL, which a CHECK allows, so
-- "no cap" and "invalid zero cap" stay distinguishable without a sentinel.
select lives_ok($$insert into public.events (id, slug, registration_opens_at, registration_closes_at, capacity) values ('33333333-3333-3333-3333-333333333333', 'test-event', now(), now() + interval '1 day', null)$$, 'uncapped event is valid');

-- signup_mode defaults to instant; application events opt in explicitly.
select is((select signup_mode from public.events where id = '33333333-3333-3333-3333-333333333333'), 'instant'::text, 'signup mode defaults to instant');
select lives_ok($$insert into public.events (id, slug, registration_opens_at, registration_closes_at, signup_mode) values ('55555555-5555-5555-5555-555555555555', 'application-event', now(), now() + interval '1 day', 'application')$$, 'application signup mode is valid');
select is((select signup_mode from public.events where slug = 'application-event'), 'application'::text, 'application signup mode is stored');
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at, signup_mode) values ('invalid-mode-event', now(), now() + interval '1 day', 'waitlist')$$, '23514', null, 'invalid signup mode rejected');

select lives_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at, capacity) values ('capped-event', now(), now() + interval '1 day', 1)$$, 'capacity one is valid');
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at, capacity) values ('zero-event', now(), now() + interval '1 day', 0)$$, '23514', null, 'zero capacity rejected');
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at, capacity) values ('negative-event', now(), now() + interval '1 day', -1)$$, '23514', null, 'negative capacity rejected');

-- The slug is the public URL identity, so uniqueness alone is not enough.
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at) values ('test-event', now(), now() + interval '1 day')$$, '23505', null, 'duplicate slug rejected');
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at) values ('Test Event', now(), now() + interval '1 day')$$, '23514', null, 'malformed slug rejected');

-- A signup window must be positive; equality and inversion both fail.
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at) values ('closed-event', now(), now())$$, '23514', null, 'zero-length window rejected');
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at) values ('reversed-event', now(), now() - interval '1 day')$$, '23514', null, 'reversed window rejected');

-- A confirmed registration, created as the privileged role.
insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values
 ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '{}', '[]', 'confirmed', now());

-- (event_id, user_id) is the primary key: one registration per edition.
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','{}','[]','confirmed',now())$$, '23505', null, 'duplicate registration rejected');

-- Both foreign keys must hold: a real edition, and a completed profile.
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','{}','[]','confirmed',now())$$, '23503', null, 'unknown event rejected');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('33333333-3333-3333-3333-333333333333','99999999-9999-9999-9999-999999999999','{}','[]','confirmed',now())$$, '23503', null, 'registration for unknown profile rejected');

-- Payload shapes and the status domain are enforced by the database, so a
-- buggy writer cannot store malformed answers or an unexpected state.
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','[]','[]','confirmed',now())$$, '23514', null, 'answers must be a json object');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','{}','{}','confirmed',now())$$, '23514', null, 'agreements must be a json array');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','{}','[]','cancelled',now())$$, '23514', null, 'unsupported status rejected');

-- Pending and declined registrations are valid states for the future trusted
-- writer; status stays required with no default, so the writer must choose it.
select lives_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','{}','[]','pending',now())$$, 'pending status is valid');
select lives_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('55555555-5555-5555-5555-555555555555','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','{}','[]','declined',now())$$, 'declined status is valid');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status) values ('33333333-3333-3333-3333-333333333333','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','{}','[]',null)$$, '23502', null, 'missing status rejected');

-- ===========================================================================
-- Signed-in caller (RLS and grants)
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

-- Registrations are owner-only reads; event metadata is readable by any
-- signed-in user.
select is((select count(*) from public.event_registrations), 1::bigint, 'owner can read registration');
select ok(exists(select 1 from public.events where slug = 'test-event'), 'signed-in user can read event metadata');

-- The lineup is club-managed: no authenticated write path to events exists.
select throws_ok($$insert into public.events (slug, registration_opens_at, registration_closes_at) values ('member-event', now(), now() + interval '1 day')$$, '42501', null, 'signed-in user cannot create events');

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

-- A filtered read, not a denial: user 1's row is invisible, so 0.
select is((select count(*) from public.event_registrations), 0::bigint, 'other user cannot read registration');

-- These are privilege failures, not RLS: the table is granted SELECT only, so
-- the browser has no write path and a future RPC is the sole writer.
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status) values ('33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','{}','[]','confirmed')$$, '42501', null, 'attendee cannot insert registration');
select throws_ok($$update public.event_registrations set status = 'confirmed'$$, '42501', null, 'attendee cannot update registration');
select throws_ok($$delete from public.event_registrations$$, '42501', null, 'attendee cannot delete registration');

-- ===========================================================================
-- Anonymous caller (publishable key, no user JWT)
-- ===========================================================================
reset role;
set local role anon;

-- All privileges were revoked from anon, so both tables are denied outright.
select throws_ok($$select * from public.events$$, '42501', null, 'anonymous cannot read events');
select throws_ok($$select * from public.event_registrations$$, '42501', null, 'anonymous cannot read registrations');

reset role;
select * from finish();
rollback;
