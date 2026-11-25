insert into public.events (slug, registration_opens_at, registration_closes_at, capacity)
values ('sample-event', now() - interval '1 day', now() + interval '1 day', null)
on conflict (slug) do nothing;
