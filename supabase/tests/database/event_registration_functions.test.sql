-- Event registration availability and submission RPCs
--
-- Verifies public.get_event_registration_availability and
-- public.submit_event_registration from the generated migration:
--   * the derived availability states,
--   * instant confirmation and capacity enforcement,
--   * application submissions staying pending at the cap,
--   * retries returning the original saved status after the window closes,
--   * JSON answer arrays round-tripping inside answers,
--   * rejected outcomes writing no rows,
--   * execute/table privileges for anon, authenticated, and service_role.
--
-- Everything runs in one transaction and is rolled back, so the synthetic
-- auth.users, profiles, events, and registrations never persist locally.
--
-- How a caller is simulated:
--   * set local role service_role -> the trusted server role the RPCs are
--     granted to.
--   * set local role authenticated|anon -> PostgREST browser roles, which must
--     not be able to execute either routine.
--
-- SQLSTATE codes asserted below:
--   42501 insufficient_privilege
begin;

-- plan() must match the number of assertions in this file.
select plan(61);

-- ===========================================================================
-- Synthetic accounts and shared profiles
-- ===========================================================================
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'instant@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'future@example.test'),
  ('33333333-3333-3333-3333-333333333333', 'closed@example.test'),
  ('44444444-4444-4444-4444-444444444444', 'full@example.test'),
  ('55555555-5555-5555-5555-555555555555', 'occupant@example.test'),
  ('66666666-6666-6666-6666-666666666666', 'noprofile@example.test'),
  ('77777777-7777-7777-7777-777777777777', 'confirmed@example.test'),
  ('88888888-8888-8888-8888-888888888888', 'pending@example.test'),
  ('99999999-9999-9999-9999-999999999999', 'declined@example.test'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'applicant@example.test');

-- The no-profile account intentionally gets no public.profiles row.
insert into public.profiles values
  ('11111111-1111-1111-1111-111111111111', 'Instant', 'User'),
  ('22222222-2222-2222-2222-222222222222', 'Future', 'User'),
  ('33333333-3333-3333-3333-333333333333', 'Closed', 'User'),
  ('44444444-4444-4444-4444-444444444444', 'Full', 'User'),
  ('55555555-5555-5555-5555-555555555555', 'Occupant', 'User'),
  ('77777777-7777-7777-7777-777777777777', 'Confirmed', 'User'),
  ('88888888-8888-8888-8888-888888888888', 'Pending', 'User'),
  ('99999999-9999-9999-9999-999999999999', 'Declined', 'User'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Applicant', 'User');

-- ===========================================================================
-- Event editions (fixtures, created as the privileged role)
-- ===========================================================================
insert into public.events (id, slug, registration_opens_at, registration_closes_at, capacity, signup_mode) values
  ('10000000-0000-0000-0000-000000000001', 'rpc-open-instant', now() - interval '1 hour', now() + interval '1 hour', null, 'instant'),
  ('10000000-0000-0000-0000-000000000002', 'rpc-future', now() + interval '1 hour', now() + interval '2 hours', null, 'instant'),
  ('10000000-0000-0000-0000-000000000003', 'rpc-closed', now() - interval '2 hours', now() - interval '1 hour', null, 'instant'),
  ('10000000-0000-0000-0000-000000000004', 'rpc-full-instant', now() - interval '1 hour', now() + interval '1 hour', 1, 'instant'),
  ('10000000-0000-0000-0000-000000000005', 'rpc-app-at-cap', now() - interval '1 hour', now() + interval '1 hour', 1, 'application');

-- The occupant fills the single seat of the full instant event and the
-- confirmed count of the application event.
insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values
  ('10000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', '{"seed":"occupant"}', '[]', 'confirmed', now() - interval '10 minutes'),
  ('10000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', '{"seed":"occupant"}', '[]', 'confirmed', now() - interval '10 minutes');

-- Existing records on the closed event, one per saved status. Retries must
-- return these untouched even though the signup window has ended.
insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values
  ('10000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', '{"seed":"confirmed"}', '[]', 'confirmed', '2026-11-01 12:00:00+00'),
  ('10000000-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', '{"seed":"pending"}', '[]', 'pending', '2026-11-01 12:01:00+00'),
  ('10000000-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', '{"seed":"declined"}', '[]', 'declined', '2026-11-01 12:02:00+00');

-- ===========================================================================
-- Privileges: only service_role may execute, and it may lock the event row
-- ===========================================================================
select ok(has_function_privilege('service_role', 'public.get_event_registration_availability(uuid)', 'EXECUTE'), 'service_role can execute availability');
select ok(has_function_privilege('service_role', 'public.submit_event_registration(uuid,uuid,jsonb,jsonb)', 'EXECUTE'), 'service_role can execute submission');
select ok(not has_function_privilege('anon', 'public.get_event_registration_availability(uuid)', 'EXECUTE'), 'anon cannot execute availability');
select ok(not has_function_privilege('anon', 'public.submit_event_registration(uuid,uuid,jsonb,jsonb)', 'EXECUTE'), 'anon cannot execute submission');
select ok(not has_function_privilege('authenticated', 'public.get_event_registration_availability(uuid)', 'EXECUTE'), 'authenticated cannot execute availability');
select ok(not has_function_privilege('authenticated', 'public.submit_event_registration(uuid,uuid,jsonb,jsonb)', 'EXECUTE'), 'authenticated cannot execute submission');
select ok(has_table_privilege('service_role', 'public.events', 'UPDATE'), 'service_role has the UPDATE privilege needed to lock events');
select ok(has_table_privilege('service_role', 'public.event_registrations', 'INSERT'), 'service_role can insert registrations');
select ok(has_table_privilege('service_role', 'public.profiles', 'SELECT'), 'service_role can check profiles');

-- ===========================================================================
-- Availability: read-only derived states
-- ===========================================================================
set local role service_role;

select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000001')), 'open'::text, 'open uncapped instant event is open');
select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000002')), 'not_open'::text, 'future window is not open');
select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000003')), 'closed'::text, 'past window is closed');
select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000004')), 'full'::text, 'capped instant event at capacity is full');
select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000005')), 'open'::text, 'application event stays open at the cap');
select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000099')), 'not_found'::text, 'unknown event is not found');

-- ===========================================================================
-- Instant submission: confirmed, answers and agreements stored together
-- ===========================================================================
select is(
  (select outcome from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Ada","interests":["systems","design"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  'saved'::text,
  'open instant submission is saved');
select is(
  (select status from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Ada","interests":["systems","design"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  'confirmed'::text,
  'instant submission is confirmed');
select isnt(
  (select submitted_at from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Ada","interests":["systems","design"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  null,
  'instant submission returns a timestamp');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'), 1::bigint, 'instant submission writes exactly one row');
select is((select answers -> 'interests' from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'), '["systems","design"]'::jsonb, 'multiselect answer stays a JSON array');
select is((select answers ->> 'firstName' from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'), 'Ada'::text, 'scalar answer is stored');
select is((select accepted_agreements from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'), '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb, 'agreement snapshots are stored');
select is(
  (select outcome from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Ada","interests":["systems","design"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  'saved'::text,
  'repeated instant submission is saved');
select is(
  (select status from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Ada","interests":["systems","design"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  'confirmed'::text,
  'repeated instant submission keeps the saved status');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'), 1::bigint, 'repeated instant submission does not duplicate the row');
select is(
  (select submitted_at from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Ada","interests":["systems","design"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  (select submitted_at from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'),
  'repeated instant submission keeps the saved timestamp');

-- ===========================================================================
-- Rejected new submissions: no write
-- ===========================================================================
select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '{}'::jsonb, '[]'::jsonb)),
  'not_open'::text,
  'future window rejects submission');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000002' and user_id = '22222222-2222-2222-2222-222222222222'), 0::bigint, 'not_open writes no row');

select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', '{}'::jsonb, '[]'::jsonb)),
  'closed'::text,
  'closed window rejects submission');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000003' and user_id = '33333333-3333-3333-3333-333333333333'), 0::bigint, 'closed writes no row');

select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', '{}'::jsonb, '[]'::jsonb)),
  'full'::text,
  'full instant event rejects submission');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000004' and user_id = '44444444-4444-4444-4444-444444444444'), 0::bigint, 'full writes no row');

select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', '{}'::jsonb, '[]'::jsonb)),
  'profile_required'::text,
  'missing profile rejects submission');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '66666666-6666-6666-6666-666666666666'), 0::bigint, 'profile_required writes no row');

select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000099', '11111111-1111-1111-1111-111111111111', '{}'::jsonb, '[]'::jsonb)),
  'not_found'::text,
  'unknown event is not found');

-- ===========================================================================
-- Retries on a closed event: original status, answers, timestamp unchanged
-- ===========================================================================
select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  'saved'::text,
  'retry of confirmed registration is saved');
select is(
  (select status from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  'confirmed'::text,
  'retry keeps confirmed status');
select is(
  (select submitted_at from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  timestamptz '2026-11-01 12:00:00+00',
  'retry keeps confirmed timestamp');
select is((select answers from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000003' and user_id = '77777777-7777-7777-7777-777777777777'), '{"seed":"confirmed"}'::jsonb, 'retry keeps confirmed answers');

select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  'saved'::text,
  'retry of pending registration is saved');
select is(
  (select status from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  'pending'::text,
  'retry keeps pending status');
select is(
  (select submitted_at from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '88888888-8888-8888-8888-888888888888', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  timestamptz '2026-11-01 12:01:00+00',
  'retry keeps pending timestamp');
select is((select answers from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000003' and user_id = '88888888-8888-8888-8888-888888888888'), '{"seed":"pending"}'::jsonb, 'retry keeps pending answers');

select is(
  (select outcome from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  'saved'::text,
  'retry of declined registration is saved');
select is(
  (select status from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  'declined'::text,
  'retry keeps declined status');
select is(
  (select submitted_at from public.submit_event_registration('10000000-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', '{"firstName":"Retry"}'::jsonb, '[]'::jsonb)),
  timestamptz '2026-11-01 12:02:00+00',
  'retry keeps declined timestamp');
select is((select answers from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000003' and user_id = '99999999-9999-9999-9999-999999999999'), '{"seed":"declined"}'::jsonb, 'retry keeps declined answers');

-- ===========================================================================
-- Duplicate after the instant event closes
-- ===========================================================================
reset role;
update public.events set registration_closes_at = now() - interval '1 minute' where id = '10000000-0000-0000-0000-000000000001';
set local role service_role;

select is(
  (select outcome from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Changed"}'::jsonb,
    '[]'::jsonb)),
  'saved'::text,
  'duplicate after close is saved');
select is(
  (select status from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Changed"}'::jsonb,
    '[]'::jsonb)),
  'confirmed'::text,
  'duplicate after close keeps confirmed status');
select is(
  (select submitted_at from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '{"firstName":"Changed"}'::jsonb,
    '[]'::jsonb)),
  (select submitted_at from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'),
  'duplicate after close keeps the saved timestamp');
select is((select answers from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000001' and user_id = '11111111-1111-1111-1111-111111111111'), '{"firstName":"Ada","interests":["systems","design"]}'::jsonb, 'duplicate after close keeps the saved answers');

-- ===========================================================================
-- Application at the cap: pending save, pending rows do not consume seats
-- ===========================================================================
select is(
  (select outcome from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '{"team":"alpha","skills":["rust","sql"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  'saved'::text,
  'application at the cap is saved');
select is(
  (select status from public.submit_event_registration(
    '10000000-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '{"team":"alpha","skills":["rust","sql"]}'::jsonb,
    '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb)),
  'pending'::text,
  'application at the cap is pending');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000005' and status = 'confirmed'), 1::bigint, 'pending application does not add a confirmed seat');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000005' and user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and status = 'pending'), 1::bigint, 'application row is stored as pending');
select is((select outcome from public.get_event_registration_availability('10000000-0000-0000-0000-000000000005')), 'open'::text, 'application availability stays open after pending save');
select is((select count(*) from public.event_registrations where event_id = '10000000-0000-0000-0000-000000000005'), 2::bigint, 'application event holds one seat and one pending row');

-- ===========================================================================
-- Browser roles cannot execute either routine
-- ===========================================================================
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

select throws_ok(
  $$select * from public.get_event_registration_availability('10000000-0000-0000-0000-000000000001')$$,
  '42501', null, 'authenticated cannot execute availability');
select throws_ok(
  $$select * from public.submit_event_registration('10000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb)$$,
  '42501', null, 'authenticated cannot execute submission');

reset role;
set local role anon;

select throws_ok(
  $$select * from public.get_event_registration_availability('10000000-0000-0000-0000-000000000001')$$,
  '42501', null, 'anonymous cannot execute availability');
select throws_ok(
  $$select * from public.submit_event_registration('10000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb)$$,
  '42501', null, 'anonymous cannot execute submission');

reset role;
select * from finish();
rollback;
