create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  registration_opens_at timestamptz not null,
  registration_closes_at timestamptz not null,
  capacity integer check (capacity > 0),
  signup_mode text not null default 'instant' check (signup_mode in ('instant', 'application')),
  check (registration_closes_at > registration_opens_at)
);
create table public.event_registrations (
  event_id uuid not null references public.events(id),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  accepted_agreements jsonb not null check (jsonb_typeof(accepted_agreements) = 'array'),
  status text not null check (status in ('pending', 'confirmed', 'declined')),
  submitted_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index event_registrations_user_id_idx on public.event_registrations(user_id);
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
revoke all on public.events, public.event_registrations from anon, authenticated;
grant select on public.events, public.event_registrations to authenticated;
create policy events_authenticated_read on public.events for select to authenticated using (true);
create policy registrations_select_own on public.event_registrations for select to authenticated using ((select auth.uid()) = user_id);
