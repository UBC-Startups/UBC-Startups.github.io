-- Synthetic local testing window for manual new-account CaseHack signup.
-- This is not the real approved event timing; do not announce or reuse it.
insert into public.events (
  slug,
  registration_opens_at,
  registration_closes_at,
  signup_mode,
  capacity
)
values (
  'casehack-2026',
  now() - interval '1 day',
  now() + interval '7 days',
  'application',
  null
)
on conflict (slug) do nothing;
