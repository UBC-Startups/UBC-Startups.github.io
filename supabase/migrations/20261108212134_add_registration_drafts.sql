SET local check_function_bodies = off;

ALTER TABLE "public"."event_registrations"
  DROP CONSTRAINT "event_registrations_status_check";

DROP FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb);

ALTER TABLE "public"."event_registrations"
  ALTER COLUMN "submitted_at" DROP DEFAULT;

ALTER TABLE "public"."event_registrations"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."event_registrations"
  ADD COLUMN "revision" integer NOT NULL DEFAULT 0;

ALTER TABLE "public"."event_registrations"
  ADD COLUMN "draft_agreement_keys" jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "public"."event_registrations"
  ALTER COLUMN "submitted_at" DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.save_event_registration_draft (
  p_event_id          uuid,
  p_user_id           uuid,
  p_answers           jsonb,
  p_agreement_keys    jsonb,
  p_expected_revision integer
)
  RETURNS TABLE (
    outcome      text,
    revision     integer,
    saved_at     timestamp with time zone,
    status       text,
    submitted_at timestamp with time zone
  )
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  v_event public.events%rowtype;
  v_row public.event_registrations%rowtype;
  v_now timestamptz;
  v_found boolean;
begin
  -- A shared event lock lets different attendees autosave concurrently while
  -- still ordering against the exclusive lock a final submission takes.
  select e.*
  into v_event
  from public.events as e
  where e.id = p_event_id
  for share;

  if not found then
    return query select 'not_found'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  select r.*
  into v_row
  from public.event_registrations as r
  where r.event_id = p_event_id
    and r.user_id = p_user_id
  for update;
  v_found := found;

  -- A saved receipt is immutable: late or in-flight autosaves return it
  -- without touching the row, even after the window closes.
  if v_found and v_row.status <> 'draft' then
    return query select 'submitted'::text, v_row.revision, v_row.updated_at, v_row.status, v_row.submitted_at;
    return;
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    return query select 'invalid_payload'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if p_agreement_keys is null or jsonb_typeof(p_agreement_keys) <> 'array' then
    return query select 'invalid_payload'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_agreement_keys) as elem
    where jsonb_typeof(elem) <> 'string'
  ) then
    return query select 'invalid_payload'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if p_expected_revision is null or p_expected_revision < 0 then
    return query select 'invalid_payload'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if octet_length(p_answers::text) + octet_length(p_agreement_keys::text) > 65536 then
    return query select 'invalid_payload'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if not exists (
    select 1
    from public.profiles as p
    where p.user_id = p_user_id
  ) then
    return query select 'profile_required'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  -- Database time is read after both locks so a waiter sees the current window.
  v_now := pg_catalog.clock_timestamp();

  if v_now < v_event.registration_opens_at then
    return query select 'not_open'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  elsif v_now >= v_event.registration_closes_at then
    return query select 'closed'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if v_found then
    if v_row.revision <> p_expected_revision then
      return query select 'conflict'::text, v_row.revision, v_row.updated_at, v_row.status, v_row.submitted_at;
      return;
    end if;

    -- Whole-snapshot replacement: clearing a field or agreement key in the
    -- browser really clears it here; there is no server-side merge.
    update public.event_registrations as r
    set answers = p_answers,
        accepted_agreements = '[]'::jsonb,
        draft_agreement_keys = p_agreement_keys,
        revision = r.revision + 1,
        updated_at = v_now
    where r.event_id = p_event_id
      and r.user_id = p_user_id
    returning r.* into v_row;

    return query select 'saved'::text, v_row.revision, v_row.updated_at, v_row.status, v_row.submitted_at;
    return;
  end if;

  if p_expected_revision <> 0 then
    return query select 'conflict'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  -- Concurrent first saves both reach the unique key. The winner inserts;
  -- the loser re-reads under the row lock and reports a conflict.
  insert into public.event_registrations (
    event_id,
    user_id,
    answers,
    accepted_agreements,
    status,
    submitted_at,
    draft_agreement_keys,
    updated_at,
    revision
  )
  values (
    p_event_id,
    p_user_id,
    p_answers,
    '[]'::jsonb,
    'draft',
    null,
    p_agreement_keys,
    v_now,
    1
  )
  on conflict (event_id, user_id) do nothing
  returning * into v_row;

  if found then
    return query select 'saved'::text, v_row.revision, v_row.updated_at, v_row.status, v_row.submitted_at;
    return;
  end if;

  select r.*
  into v_row
  from public.event_registrations as r
  where r.event_id = p_event_id
    and r.user_id = p_user_id
  for update;

  if not found then
    return query select 'conflict'::text, null::integer, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;

  if v_row.status <> 'draft' then
    return query select 'submitted'::text, v_row.revision, v_row.updated_at, v_row.status, v_row.submitted_at;
    return;
  end if;

  return query select 'conflict'::text, v_row.revision, v_row.updated_at, v_row.status, v_row.submitted_at;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."save_event_registration_draft"(uuid, uuid, jsonb, jsonb, integer) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.submit_event_registration (
  p_event_id            uuid,
  p_user_id             uuid,
  p_answers             jsonb,
  p_accepted_agreements jsonb,
  p_expected_revision   integer DEFAULT NULL::integer
)
  RETURNS TABLE (
    outcome      text,
    status       text,
    submitted_at timestamp with time zone
  )
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  v_event public.events%rowtype;
  v_existing public.event_registrations%rowtype;
  v_existing_found boolean;
  v_now timestamptz;
  v_status text;
  v_confirmed bigint;
begin
  -- The edition row remains the serialization point for the cap decision.
  select e.*
  into v_event
  from public.events as e
  where e.id = p_event_id
  for update;

  if not found then
    return query select 'not_found'::text, null::text, null::timestamptz;
    return;
  end if;

  select r.*
  into v_existing
  from public.event_registrations as r
  where r.event_id = p_event_id
    and r.user_id = p_user_id
  for update;
  v_existing_found := found;

  -- A saved receipt wins before any window, capacity, or draft-revision
  -- check, so a retry remains idempotent after the event closes or fills.
  if v_existing_found and v_existing.status <> 'draft' then
    return query select 'saved'::text, v_existing.status, v_existing.submitted_at;
    return;
  end if;

  v_now := pg_catalog.clock_timestamp();

  if v_existing_found then
    if p_expected_revision is null or p_expected_revision <> v_existing.revision then
      return query select 'conflict'::text, v_existing.status, v_existing.submitted_at;
      return;
    end if;
  elsif p_expected_revision is not null and p_expected_revision <> 0 then
    return query select 'conflict'::text, null::text, null::timestamptz;
    return;
  end if;

  if not exists (
    select 1
    from public.profiles as p
    where p.user_id = p_user_id
  ) then
    return query select 'profile_required'::text, null::text, null::timestamptz;
    return;
  end if;

  if v_now < v_event.registration_opens_at then
    return query select 'not_open'::text, null::text, null::timestamptz;
    return;
  elsif v_now >= v_event.registration_closes_at then
    return query select 'closed'::text, null::text, null::timestamptz;
    return;
  end if;

  v_status := case
    when v_event.signup_mode = 'instant' then 'confirmed'
    else 'pending'
  end;

  -- Only confirmed rows hold a seat, so a draft never consumes capacity.
  if v_status = 'confirmed' and v_event.capacity is not null then
    select count(*)
    into v_confirmed
    from public.event_registrations as r
    where r.event_id = p_event_id
      and r.status = 'confirmed';

    if v_confirmed >= v_event.capacity then
      return query select 'full'::text, null::text, null::timestamptz;
      return;
    end if;
  end if;

  if v_existing_found then
    -- Promote the same draft row rather than inserting a second receipt.
    update public.event_registrations as r
    set answers = p_answers,
        accepted_agreements = p_accepted_agreements,
        status = v_status,
        submitted_at = v_now,
        updated_at = v_now,
        revision = r.revision + 1,
        draft_agreement_keys = '[]'::jsonb
    where r.event_id = p_event_id
      and r.user_id = p_user_id;

    return query select 'saved'::text, v_status, v_now;
    return;
  end if;

  insert into public.event_registrations (
    event_id,
    user_id,
    answers,
    accepted_agreements,
    status,
    submitted_at,
    updated_at,
    revision,
    draft_agreement_keys
  )
  values (
    p_event_id,
    p_user_id,
    p_answers,
    p_accepted_agreements,
    v_status,
    v_now,
    v_now,
    1,
    '[]'::jsonb
  );

  return query select 'saved'::text, v_status, v_now;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb, integer) FROM PUBLIC, "anon", "authenticated";

ALTER TABLE "public"."event_registrations"
  ADD CONSTRAINT "event_registrations_draft_agreement_keys_check" CHECK ((jsonb_typeof(draft_agreement_keys) = 'array'::text));

ALTER TABLE "public"."event_registrations"
  ADD CONSTRAINT "event_registrations_revision_check" CHECK ((revision >= 0));

ALTER TABLE "public"."event_registrations"
  ADD CONSTRAINT "event_registrations_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'confirmed'::text, 'declined'::text])));

ALTER TABLE "public"."event_registrations"
  ADD CONSTRAINT "event_registrations_submission_state_check"
    CHECK ((((status = 'draft'::text) AND (submitted_at IS NULL) AND (accepted_agreements = '[]'::jsonb)) OR ((status <> 'draft'::text) AND (submitted_at IS NOT NULL))));

REVOKE ALL ON FUNCTION "public"."save_event_registration_draft"(uuid, uuid, jsonb, jsonb, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."save_event_registration_draft"(uuid, uuid, jsonb, jsonb, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."save_event_registration_draft"(uuid, uuid, jsonb, jsonb, integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb, integer) TO "service_role";

-- Reviewed supplement to the CLI-generated SQL: the local platform's default
-- grants hid these from the diff. Both routines run as the invoker, so the
-- trusted service role needs the schema, reads for the profile/event lookups,
-- INSERT for a first draft, and UPDATE for draft snapshots and promotion.
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT SELECT, UPDATE ON TABLE "public"."events" TO "service_role";

GRANT SELECT ON TABLE "public"."profiles" TO "service_role";

GRANT SELECT, INSERT, UPDATE ON TABLE "public"."event_registrations" TO "service_role";

