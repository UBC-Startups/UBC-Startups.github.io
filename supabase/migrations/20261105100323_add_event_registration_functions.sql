SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_event_registration_availability (
  p_event_id uuid
)
  RETURNS TABLE (
    outcome text
  )
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
declare
  v_event public.events%rowtype;
  v_now timestamptz;
  v_confirmed bigint;
begin
  select e.*
  into v_event
  from public.events as e
  where e.id = p_event_id;

  if not found then
    return query select 'not_found'::text;
    return;
  end if;

  v_now := pg_catalog.clock_timestamp();

  if v_now < v_event.registration_opens_at then
    return query select 'not_open'::text;
  elsif v_now >= v_event.registration_closes_at then
    return query select 'closed'::text;
  elsif v_event.signup_mode = 'application' then
    return query select 'open'::text;
  elsif v_event.capacity is null then
    return query select 'open'::text;
  else
    select count(*)
    into v_confirmed
    from public.event_registrations as r
    where r.event_id = p_event_id
      and r.status = 'confirmed';

    if v_confirmed >= v_event.capacity then
      return query select 'full'::text;
    else
      return query select 'open'::text;
    end if;
  end if;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."get_event_registration_availability"(uuid) FROM PUBLIC, "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.submit_event_registration (
  p_event_id            uuid,
  p_user_id             uuid,
  p_answers             jsonb,
  p_accepted_agreements jsonb
)
  RETURNS TABLE (
    outcome      text,
    status       text,
    submitted_at timestamp with time zone
  )
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
declare
  v_event public.events%rowtype;
  v_now timestamptz;
  v_existing_status text;
  v_existing_submitted_at timestamptz;
  v_status text;
  v_confirmed bigint;
begin
  -- The edition row is the serialization point for the cap decision.
  select e.*
  into v_event
  from public.events as e
  where e.id = p_event_id
  for update;

  if not found then
    return query select 'not_found'::text, null::text, null::timestamptz;
    return;
  end if;

  -- A retry returns the account's one saved record before any new checks, so
  -- it still resolves after the window closes or the event fills.
  select r.status, r.submitted_at
  into v_existing_status, v_existing_submitted_at
  from public.event_registrations as r
  where r.event_id = p_event_id
    and r.user_id = p_user_id;

  if found then
    return query select 'saved'::text, v_existing_status, v_existing_submitted_at;
    return;
  end if;

  -- Database time is read only after the lock, so a waiter sees the current
  -- window and capacity state once it owns the row.
  v_now := pg_catalog.clock_timestamp();

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

  -- Only instant rows hold a seat; application rows stay pending even when
  -- confirmed registrations already meet the configured cap.
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

  insert into public.event_registrations (
    event_id,
    user_id,
    answers,
    accepted_agreements,
    status,
    submitted_at
  )
  values (
    p_event_id,
    p_user_id,
    p_answers,
    p_accepted_agreements,
    v_status,
    v_now
  );

  return query select 'saved'::text, v_status, v_now;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb) FROM PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_event_registration_availability"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_event_registration_availability"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_event_registration_availability"(uuid) TO "service_role";

REVOKE ALL ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_event_registration"(uuid, uuid, jsonb, jsonb) TO "service_role";

-- Reviewed supplement to the CLI-generated SQL: the local platform's default
-- grants hid these from the diff. Both routines run as the invoker, so the
-- trusted service role needs the schema, reads for the profile/event lookups,
-- INSERT for the registration, and UPDATE for the FOR UPDATE row lock.
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT SELECT, UPDATE ON TABLE "public"."events" TO "service_role";

GRANT SELECT ON TABLE "public"."profiles" TO "service_role";

GRANT SELECT, INSERT ON TABLE "public"."event_registrations" TO "service_role";

