-- Registration autosave drafts: schema, RPCs, immutability, and privileges
--
-- Verifies the draft columns and submission-state constraint on
-- public.event_registrations, public.save_event_registration_draft, and the
-- five-argument public.submit_event_registration:
--   * draft creation with an incomplete working payload and agreement keys,
--   * whole-snapshot replacement and revision-based conflicts,
--   * closed/not-open/profile/malformed rejections writing no rows,
--   * terminal receipts staying immutable under late autosaves,
--   * draft promotion to pending/confirmed on the same primary key,
--   * capacity counting confirmed rows only and preserving drafts on failure,
--   * idempotent duplicates after closure,
--   * owner-only reads and browser-role denial,
--   * execute/table privileges for anon, authenticated, and service_role.
--
-- Everything runs in one transaction and is rolled back, so the synthetic
-- auth.users, profiles, events, and registrations never persist locally.
--
-- SQLSTATE codes asserted below:
--   23514 check_violation   42501 insufficient_privilege
begin;

-- plan() must match the number of assertions in this file.
select plan(112);

-- ===========================================================================
-- Synthetic accounts, profiles, and event editions
-- ===========================================================================
insert into auth.users (id, email) values
  ('b1111111-1111-1111-1111-111111111111', 'draft@example.test'),
  ('b2222222-2222-2222-2222-222222222222', 'other@example.test'),
  ('b3333333-3333-3333-3333-333333333333', 'noprofile@example.test'),
  ('b4444444-4444-4444-4444-444444444444', 'confirmed@example.test'),
  ('b5555555-5555-5555-5555-555555555555', 'instant@example.test'),
  ('b6666666-6666-6666-6666-666666666666', 'application@example.test'),
  ('b7777777-7777-7777-7777-777777777777', 'cap@example.test'),
  ('b8888888-8888-8888-8888-888888888888', 'full@example.test'),
  ('b9999999-9999-9999-9999-999999999999', 'closed@example.test'),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'future@example.test');

-- The no-profile account intentionally gets no public.profiles row.
insert into public.profiles values
  ('b1111111-1111-1111-1111-111111111111', 'Draft', 'User'),
  ('b2222222-2222-2222-2222-222222222222', 'Other', 'User'),
  ('b4444444-4444-4444-4444-444444444444', 'Confirmed', 'User'),
  ('b5555555-5555-5555-5555-555555555555', 'Instant', 'User'),
  ('b6666666-6666-6666-6666-666666666666', 'Application', 'User'),
  ('b7777777-7777-7777-7777-777777777777', 'Cap', 'User'),
  ('b8888888-8888-8888-8888-888888888888', 'Full', 'User'),
  ('b9999999-9999-9999-9999-999999999999', 'Closed', 'User'),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Future', 'User');

insert into public.events (id, slug, registration_opens_at, registration_closes_at, capacity, signup_mode) values
  ('c1111111-1111-1111-1111-111111111111', 'draft-open-instant', now() - interval '1 hour', now() + interval '1 hour', null, 'instant'),
  ('c2222222-2222-2222-2222-222222222222', 'draft-open-application', now() - interval '1 hour', now() + interval '1 hour', null, 'application'),
  ('c3333333-3333-3333-3333-333333333333', 'draft-closed', now() - interval '2 hours', now() - interval '1 hour', null, 'instant'),
  ('c4444444-4444-4444-4444-444444444444', 'draft-future', now() + interval '1 hour', now() + interval '2 hours', null, 'instant'),
  ('c5555555-5555-5555-5555-555555555555', 'draft-full-instant', now() - interval '1 hour', now() + interval '1 hour', 1, 'instant'),
  ('c6666666-6666-6666-6666-666666666666', 'draft-app-at-cap', now() - interval '1 hour', now() + interval '1 hour', 1, 'application');

-- One confirmed occupant fills each capped event's seat count.
insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values
  ('c5555555-5555-5555-5555-555555555555', 'b9999999-9999-9999-9999-999999999999', '{"seed":"occupant"}', '[]', 'confirmed', now() - interval '10 minutes'),
  ('c6666666-6666-6666-6666-666666666666', 'b9999999-9999-9999-9999-999999999999', '{"seed":"occupant"}', '[]', 'confirmed', now() - interval '10 minutes');

-- ===========================================================================
-- Privileges: only service_role may execute, and it may update registrations
-- ===========================================================================
select ok(has_function_privilege('service_role', 'public.save_event_registration_draft(uuid,uuid,jsonb,jsonb,integer)', 'EXECUTE'), 'service_role can execute draft save');
select ok(has_function_privilege('service_role', 'public.submit_event_registration(uuid,uuid,jsonb,jsonb,integer)', 'EXECUTE'), 'service_role can execute submission');
select ok(not has_function_privilege('anon', 'public.save_event_registration_draft(uuid,uuid,jsonb,jsonb,integer)', 'EXECUTE'), 'anon cannot execute draft save');
select ok(not has_function_privilege('anon', 'public.submit_event_registration(uuid,uuid,jsonb,jsonb,integer)', 'EXECUTE'), 'anon cannot execute submission');
select ok(not has_function_privilege('authenticated', 'public.save_event_registration_draft(uuid,uuid,jsonb,jsonb,integer)', 'EXECUTE'), 'authenticated cannot execute draft save');
select ok(not has_function_privilege('authenticated', 'public.submit_event_registration(uuid,uuid,jsonb,jsonb,integer)', 'EXECUTE'), 'authenticated cannot execute submission');
select ok(has_table_privilege('service_role', 'public.event_registrations', 'UPDATE'), 'service_role can update draft rows');
select is(to_regprocedure('public.submit_event_registration(uuid,uuid,jsonb,jsonb)'), null::regprocedure, 'old four-argument submission signature is removed');

-- ===========================================================================
-- Draft creation: incomplete answers, keys, revision one, no receipt time
-- ===========================================================================
set local role service_role;

create temporary table draft_create as
select * from public.save_event_registration_draft(
  'c1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  '{"firstName":"Ada","interests":["systems"],"removed":"later"}'::jsonb,
  '["code-of-conduct","photo-release"]'::jsonb,
  0
);

select is((select outcome from draft_create), 'saved'::text, 'first draft save is saved');
select is((select revision from draft_create), 1, 'first draft save returns revision one');
select is((select status from draft_create), 'draft'::text, 'first draft save returns draft status');
select is((select submitted_at from draft_create), null::timestamptz, 'draft has no submitted timestamp');
select ok((select saved_at from draft_create) is not null, 'draft save returns a database timestamp');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), 1::bigint, 'draft save writes exactly one row');
select is((select answers from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), '{"firstName":"Ada","interests":["systems"],"removed":"later"}'::jsonb, 'draft stores the raw working answers');
select is((select accepted_agreements from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), '[]'::jsonb, 'draft does not record legal acceptance');
select is((select draft_agreement_keys from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), '["code-of-conduct","photo-release"]'::jsonb, 'draft stores the checked agreement keys');
select is((select revision from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), 1, 'draft row starts at revision one');
select is((select updated_at from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), (select saved_at from draft_create), 'saved timestamp matches the row updated_at');

-- ===========================================================================
-- Resave: whole snapshot replacement so cleared fields really clear
-- ===========================================================================
create temporary table draft_resave as
select * from public.save_event_registration_draft(
  'c1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  '{"firstName":"Grace","interests":[]}'::jsonb,
  '["code-of-conduct"]'::jsonb,
  1
);

select is((select outcome from draft_resave), 'saved'::text, 'matching revision resave is saved');
select is((select revision from draft_resave), 2, 'resave increments the revision');
select is((select answers ? 'removed' from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), false, 'resave removes a cleared answer field');
select is((select answers ->> 'firstName' from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), 'Grace'::text, 'resave stores the new answer value');
select is((select draft_agreement_keys from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), '["code-of-conduct"]'::jsonb, 'resave replaces agreement keys');
select is((select accepted_agreements from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), '[]'::jsonb, 'resave still records no legal acceptance');

-- ===========================================================================
-- Stale revision: reject without merging or mutating
-- ===========================================================================
create temporary table draft_stale as
select * from public.save_event_registration_draft(
  'c1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  '{"firstName":"Stale"}'::jsonb,
  '[]'::jsonb,
  1
);

select is((select outcome from draft_stale), 'conflict'::text, 'stale revision returns conflict');
select is((select revision from draft_stale), 2, 'conflict reports the current revision');
select is((select answers from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), '{"firstName":"Grace","interests":[]}'::jsonb, 'conflict leaves answers unchanged');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b1111111-1111-1111-1111-111111111111'), 1::bigint, 'conflict does not duplicate the row');

-- ===========================================================================
-- Two first saves expected at revision zero: one wins, one conflicts
-- ===========================================================================
create temporary table other_first as
select * from public.save_event_registration_draft(
  'c1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  '{"firstName":"Other"}'::jsonb,
  '[]'::jsonb,
  0
);
select is((select outcome from other_first), 'saved'::text, 'first save for another attendee is saved');
select is((select revision from other_first), 1, 'first save for another attendee starts at revision one');

create temporary table other_second as
select * from public.save_event_registration_draft(
  'c1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  '{"firstName":"Overwrite"}'::jsonb,
  '[]'::jsonb,
  0
);
select is((select outcome from other_second), 'conflict'::text, 'second expected-zero save conflicts');
select is((select revision from other_second), 1, 'second expected-zero save reports revision one');
select is((select answers from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b2222222-2222-2222-2222-222222222222'), '{"firstName":"Other"}'::jsonb, 'losing first save does not overwrite the winner');

-- ===========================================================================
-- Rejected drafts: closed, not open, no profile, malformed payload
-- ===========================================================================
create temporary table draft_not_open as
select * from public.save_event_registration_draft('c4444444-4444-4444-4444-444444444444', 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from draft_not_open), 'not_open'::text, 'future window rejects draft save');
select is((select count(*) from public.event_registrations where event_id = 'c4444444-4444-4444-4444-444444444444' and user_id = 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0::bigint, 'not_open draft writes no row');

create temporary table draft_closed as
select * from public.save_event_registration_draft('c3333333-3333-3333-3333-333333333333', 'b9999999-9999-9999-9999-999999999999', '{}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from draft_closed), 'closed'::text, 'closed window rejects draft save');
select is((select count(*) from public.event_registrations where event_id = 'c3333333-3333-3333-3333-333333333333' and user_id = 'b9999999-9999-9999-9999-999999999999'), 0::bigint, 'closed draft writes no row');

create temporary table draft_no_profile as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', '{}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from draft_no_profile), 'profile_required'::text, 'missing profile rejects draft save');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b3333333-3333-3333-3333-333333333333'), 0::bigint, 'profile_required draft writes no row');

create temporary table draft_bad_answers as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', '[]'::jsonb, '[]'::jsonb, 0);
select is((select outcome from draft_bad_answers), 'invalid_payload'::text, 'non-object answers are rejected');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 0::bigint, 'non-object answers write no row');

create temporary table draft_bad_keys as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', '{}'::jsonb, '{}'::jsonb, 0);
select is((select outcome from draft_bad_keys), 'invalid_payload'::text, 'non-array agreement keys are rejected');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 0::bigint, 'non-array agreement keys write no row');

create temporary table draft_bad_key_type as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', '{}'::jsonb, '[1]'::jsonb, 0);
select is((select outcome from draft_bad_key_type), 'invalid_payload'::text, 'non-string agreement keys are rejected');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 0::bigint, 'non-string agreement keys write no row');

create temporary table draft_bad_revision as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', '{}'::jsonb, '[]'::jsonb, -1);
select is((select outcome from draft_bad_revision), 'invalid_payload'::text, 'negative expected revision is rejected');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 0::bigint, 'negative expected revision writes no row');

create temporary table draft_oversized as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', jsonb_build_object('blob', repeat('x', 65537)), '[]'::jsonb, 0);
select is((select outcome from draft_oversized), 'invalid_payload'::text, 'oversized draft payload is rejected');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 0::bigint, 'oversized draft payload writes no row');

-- ===========================================================================
-- Terminal receipts: late autosave returns the saved receipt unchanged
-- ===========================================================================
insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at, updated_at, revision) values
  ('c3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', '{"seed":"confirmed"}', '[{"key":"coc","text":"Be kind","accepted_at":"2026-11-01T12:00:00Z"}]', 'confirmed', '2026-11-01 12:00:00+00', '2026-11-01 12:00:00+00', 0),
  ('c3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666', '{"seed":"declined"}', '[{"key":"coc","text":"Be kind","accepted_at":"2026-11-01T12:01:00Z"}]', 'declined', '2026-11-01 12:01:00+00', '2026-11-01 12:01:00+00', 0);

create temporary table late_confirmed as
select * from public.save_event_registration_draft('c3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', '{"firstName":"Late"}'::jsonb, '["coc"]'::jsonb, 0);
select is((select outcome from late_confirmed), 'submitted'::text, 'late autosave reports submitted');
select is((select status from late_confirmed), 'confirmed'::text, 'late autosave returns the confirmed status');
select is((select submitted_at from late_confirmed), timestamptz '2026-11-01 12:00:00+00', 'late autosave returns the original timestamp');
select is((select revision from late_confirmed), 0, 'late autosave returns the original revision');
select is((select answers from public.event_registrations where event_id = 'c3333333-3333-3333-3333-333333333333' and user_id = 'b4444444-4444-4444-4444-444444444444'), '{"seed":"confirmed"}'::jsonb, 'late autosave leaves confirmed answers unchanged');
select is((select accepted_agreements from public.event_registrations where event_id = 'c3333333-3333-3333-3333-333333333333' and user_id = 'b4444444-4444-4444-4444-444444444444'), '[{"key":"coc","text":"Be kind","accepted_at":"2026-11-01T12:00:00Z"}]'::jsonb, 'late autosave leaves confirmed agreements unchanged');
select is((select draft_agreement_keys from public.event_registrations where event_id = 'c3333333-3333-3333-3333-333333333333' and user_id = 'b4444444-4444-4444-4444-444444444444'), '[]'::jsonb, 'late autosave leaves draft keys unchanged');

create temporary table late_declined as
select * from public.save_event_registration_draft('c3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666', '{"firstName":"Late"}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from late_declined), 'submitted'::text, 'late autosave on declined receipt reports submitted');
select is((select status from late_declined), 'declined'::text, 'late autosave returns the declined status');

-- ===========================================================================
-- Promotion: the same row becomes a pending or confirmed receipt
-- ===========================================================================
create temporary table promote_instant_draft as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', '{"firstName":"Ada","step":2}'::jsonb, '["code-of-conduct"]'::jsonb, 0);
select is((select outcome from promote_instant_draft), 'saved'::text, 'instant draft is saved before submission');

create temporary table promote_instant as
select * from public.submit_event_registration(
  'c1111111-1111-1111-1111-111111111111',
  'b5555555-5555-5555-5555-555555555555',
  '{"firstName":"Ada","step":4,"interests":["systems"]}'::jsonb,
  '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb,
  1
);
select is((select outcome from promote_instant), 'saved'::text, 'instant draft submission is saved');
select is((select status from promote_instant), 'confirmed'::text, 'instant draft submission is confirmed');
select ok((select submitted_at from promote_instant) is not null, 'instant draft submission returns a timestamp');
select is((select count(*) from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 1::bigint, 'promotion keeps one row per attendee and event');
select is((select status from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 'confirmed'::text, 'promoted row is confirmed');
select is((select answers from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), '{"firstName":"Ada","step":4,"interests":["systems"]}'::jsonb, 'promotion replaces answers with the final payload');
select is((select accepted_agreements from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb, 'promotion records accepted agreements');
select is((select draft_agreement_keys from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), '[]'::jsonb, 'promotion clears draft agreement keys');
select is((select revision from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 2, 'promotion increments the revision');
select is((select submitted_at from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), (select updated_at from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 'promotion uses one database timestamp');

create temporary table promote_app_draft as
select * from public.save_event_registration_draft('c2222222-2222-2222-2222-222222222222', 'b6666666-6666-6666-6666-666666666666', '{"team":"alpha"}'::jsonb, '["code-of-conduct"]'::jsonb, 0);
select is((select outcome from promote_app_draft), 'saved'::text, 'application draft is saved before submission');

create temporary table promote_app as
select * from public.submit_event_registration(
  'c2222222-2222-2222-2222-222222222222',
  'b6666666-6666-6666-6666-666666666666',
  '{"team":"alpha","final":true}'::jsonb,
  '[{"key":"code-of-conduct","text":"Be kind","accepted_at":"2026-11-05T12:00:00Z"}]'::jsonb,
  1
);
select is((select status from promote_app), 'pending'::text, 'application draft submission is pending');
select is((select count(*) from public.event_registrations where event_id = 'c2222222-2222-2222-2222-222222222222' and user_id = 'b6666666-6666-6666-6666-666666666666'), 1::bigint, 'application promotion keeps one row');
select is((select revision from public.event_registrations where event_id = 'c2222222-2222-2222-2222-222222222222' and user_id = 'b6666666-6666-6666-6666-666666666666'), 2, 'application promotion increments the revision');

-- ===========================================================================
-- Final submission conflicts: draft revision must match
-- ===========================================================================
create temporary table cap_draft_one as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b7777777-7777-7777-7777-777777777777', '{"firstName":"Cap","step":1}'::jsonb, '[]'::jsonb, 0);
create temporary table cap_draft_two as
select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111', 'b7777777-7777-7777-7777-777777777777', '{"firstName":"Cap","step":2}'::jsonb, '[]'::jsonb, 1);

create temporary table cap_stale as
select * from public.submit_event_registration('c1111111-1111-1111-1111-111111111111', 'b7777777-7777-7777-7777-777777777777', '{"firstName":"Cap","final":true}'::jsonb, '[]'::jsonb, 1);
select is((select outcome from cap_stale), 'conflict'::text, 'stale draft revision rejects final submission');
select is((select status from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b7777777-7777-7777-7777-777777777777'), 'draft'::text, 'stale final submission leaves the draft status intact');
select is((select revision from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b7777777-7777-7777-7777-777777777777'), 2, 'stale final submission leaves the revision intact');
select is((select answers from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b7777777-7777-7777-7777-777777777777'), '{"firstName":"Cap","step":2}'::jsonb, 'stale final submission leaves draft answers intact');

create temporary table cap_null as
select * from public.submit_event_registration('c1111111-1111-1111-1111-111111111111', 'b7777777-7777-7777-7777-777777777777', '{"firstName":"Cap","final":true}'::jsonb, '[]'::jsonb, null::integer);
select is((select outcome from cap_null), 'conflict'::text, 'missing revision cannot promote an existing draft');

-- ===========================================================================
-- Capacity: drafts never hold seats; a full event rejects final submission
-- ===========================================================================
create temporary table full_draft as
select * from public.save_event_registration_draft('c5555555-5555-5555-5555-555555555555', 'b8888888-8888-8888-8888-888888888888', '{"firstName":"Full","step":1}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from full_draft), 'saved'::text, 'draft save ignores the instant capacity cap');

create temporary table full_submit as
select * from public.submit_event_registration('c5555555-5555-5555-5555-555555555555', 'b8888888-8888-8888-8888-888888888888', '{"firstName":"Full","final":true}'::jsonb, '[]'::jsonb, 1);
select is((select outcome from full_submit), 'full'::text, 'full instant event rejects final submission');
select is((select status from public.event_registrations where event_id = 'c5555555-5555-5555-5555-555555555555' and user_id = 'b8888888-8888-8888-8888-888888888888'), 'draft'::text, 'full rejection leaves the draft status intact');
select is((select revision from public.event_registrations where event_id = 'c5555555-5555-5555-5555-555555555555' and user_id = 'b8888888-8888-8888-8888-888888888888'), 1, 'full rejection leaves the draft revision intact');
select is((select answers from public.event_registrations where event_id = 'c5555555-5555-5555-5555-555555555555' and user_id = 'b8888888-8888-8888-8888-888888888888'), '{"firstName":"Full","step":1}'::jsonb, 'full rejection leaves draft answers intact');
select is((select count(*) from public.event_registrations where event_id = 'c5555555-5555-5555-5555-555555555555' and status = 'confirmed'), 1::bigint, 'draft did not consume the capped seat');

create temporary table appcap_draft as
select * from public.save_event_registration_draft('c6666666-6666-6666-6666-666666666666', 'b7777777-7777-7777-7777-777777777777', '{"team":"beta"}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from appcap_draft), 'saved'::text, 'application draft saves at the confirmed cap');

create temporary table appcap_submit as
select * from public.submit_event_registration('c6666666-6666-6666-6666-666666666666', 'b7777777-7777-7777-7777-777777777777', '{"team":"beta","final":true}'::jsonb, '[]'::jsonb, 1);
select is((select outcome from appcap_submit), 'saved'::text, 'application submission at the cap is saved');
select is((select status from public.event_registrations where event_id = 'c6666666-6666-6666-6666-666666666666' and user_id = 'b7777777-7777-7777-7777-777777777777'), 'pending'::text, 'application submission at the cap is pending');
select is((select count(*) from public.event_registrations where event_id = 'c6666666-6666-6666-6666-666666666666' and status = 'confirmed'), 1::bigint, 'pending application does not add a confirmed seat');

-- ===========================================================================
-- Duplicate final submission after close: original receipt is idempotent
-- ===========================================================================
update public.events set registration_closes_at = now() - interval '1 minute' where id = 'c1111111-1111-1111-1111-111111111111';

create temporary table duplicate_after_close as
select * from public.submit_event_registration('c1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', '{"firstName":"Changed"}'::jsonb, '[]'::jsonb, null::integer);
select is((select outcome from duplicate_after_close), 'saved'::text, 'duplicate after close is saved');
select is((select status from duplicate_after_close), 'confirmed'::text, 'duplicate after close keeps the confirmed status');
select is((select submitted_at from duplicate_after_close), (select submitted_at from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), 'duplicate after close keeps the original timestamp');
select is((select answers from public.event_registrations where event_id = 'c1111111-1111-1111-1111-111111111111' and user_id = 'b5555555-5555-5555-5555-555555555555'), '{"firstName":"Ada","step":4,"interests":["systems"]}'::jsonb, 'duplicate after close keeps the saved answers');

-- ===========================================================================
-- No-draft submission: unexpected positive revision conflicts, zero works
-- ===========================================================================
create temporary table unexpected_revision as
select * from public.submit_event_registration('c2222222-2222-2222-2222-222222222222', 'b9999999-9999-9999-9999-999999999999', '{"team":"gamma"}'::jsonb, '[]'::jsonb, 5);
select is((select outcome from unexpected_revision), 'conflict'::text, 'unexpected positive revision without a draft conflicts');
select is((select count(*) from public.event_registrations where event_id = 'c2222222-2222-2222-2222-222222222222' and user_id = 'b9999999-9999-9999-9999-999999999999'), 0::bigint, 'unexpected revision writes no row');

create temporary table zero_revision as
select * from public.submit_event_registration('c2222222-2222-2222-2222-222222222222', 'b9999999-9999-9999-9999-999999999999', '{"team":"gamma"}'::jsonb, '[]'::jsonb, 0);
select is((select outcome from zero_revision), 'saved'::text, 'zero revision without a draft is saved');
select is((select status from public.event_registrations where event_id = 'c2222222-2222-2222-2222-222222222222' and user_id = 'b9999999-9999-9999-9999-999999999999'), 'pending'::text, 'zero revision creates a pending application');

-- ===========================================================================
-- Legacy four-positional submission still resolves through the default
-- ===========================================================================
create temporary table legacy_four as
select * from public.submit_event_registration('c2222222-2222-2222-2222-222222222222', 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"team":"delta"}'::jsonb, '[]'::jsonb);
select is((select outcome from legacy_four), 'saved'::text, 'legacy four-argument submission is saved');
select is((select status from public.event_registrations where event_id = 'c2222222-2222-2222-2222-222222222222' and user_id = 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'pending'::text, 'legacy four-argument submission creates a pending application');

-- ===========================================================================
-- Browser roles: owner-only reads and no write path
-- ===========================================================================
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'b1111111-1111-1111-1111-111111111111', true);

select is((select count(*) from public.event_registrations), 1::bigint, 'draft owner sees their own draft');
select is((select count(*) from public.event_registrations where user_id = 'b2222222-2222-2222-2222-222222222222'), 0::bigint, 'draft owner cannot see another attendee draft');
select throws_ok($$update public.event_registrations set answers = '{}'::jsonb$$, '42501', null, 'attendee cannot update a draft');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,'pending',now())$$, '42501', null, 'attendee cannot insert a receipt');
select throws_ok($$select * from public.save_event_registration_draft('c1111111-1111-1111-1111-111111111111','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,2)$$, '42501', null, 'attendee cannot execute draft save');
select throws_ok($$select * from public.submit_event_registration('c1111111-1111-1111-1111-111111111111','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb)$$, '42501', null, 'attendee cannot execute submission');

select set_config('request.jwt.claim.sub', 'b2222222-2222-2222-2222-222222222222', true);
select is((select count(*) from public.event_registrations), 1::bigint, 'second attendee sees their own draft only');

-- ===========================================================================
-- Constraint layer: direct writers cannot create invalid draft states
-- ===========================================================================
reset role;

select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,'draft',now())$$, '23514', null, 'draft with a submitted timestamp is rejected');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[{"key":"coc"}]'::jsonb,'draft')$$, '23514', null, 'draft with accepted agreements is rejected');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,'pending')$$, '23514', null, 'receipt without a submitted timestamp is rejected');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, submitted_at, revision) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,'draft',null,-1)$$, '23514', null, 'negative revision is rejected');
select throws_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, draft_agreement_keys) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,'draft','{}'::jsonb)$$, '23514', null, 'non-array draft agreement keys are rejected');
select lives_ok($$insert into public.event_registrations (event_id, user_id, answers, accepted_agreements, status, draft_agreement_keys) values ('c2222222-2222-2222-2222-222222222222','b1111111-1111-1111-1111-111111111111','{}'::jsonb,'[]'::jsonb,'draft','["coc"]'::jsonb)$$, 'valid draft row is accepted');

select * from finish();
rollback;
