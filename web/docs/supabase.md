# Supabase integration

The shared clients and session-refresh proxy are installed. Feature owners still
implement signup/login, callbacks, authorization, schemas, migrations, RLS, and
generated database types. No sample `todos` table or route is required.

## First-time local setup

Install and start Docker Desktop (or another supported Docker-compatible runtime).
Use Node from `web/.nvmrc`. From the repository root:

```sh
npm ci
npx supabase start
npx supabase status
```

The root package pins the CLI version. Each developer gets an isolated local
database; hosted linking is optional for local feature work. Do not rerun
`supabase init` in a clone that already has `supabase/config.toml`. Install the
web application's dependencies separately with `npm ci` from `web/`.

Use `npx supabase stop` from the root to stop local services. Coordinate reviewed
migrations to hosted staging through one designated maintainer. Linking a hosted
project alone does not apply migrations.

## Local seed data

`npx supabase db reset --local` applies `supabase/seed.sql` to the local
database, which creates a synthetic `casehack-2026` event with
`signup_mode = application`, no capacity, and an open window of one day before
reset through seven days after.
Use that row only for manual new-account registration testing; it does not
represent real approved event timing. The seed uses `on conflict (slug) do
nothing`, so rerunning the seed SQL against an existing database preserves
matching rows. A local reset itself deletes existing data before applying
migrations and seeds.

Seeds are local development data, not deployed schema. `npx supabase db push`
excludes seed rows unless you pass `--include-seed`, and repository CI does not
deploy seeds.

The opt-in event-signup suite in `web/tests/event-signup/` does not use the seeded
manual row. Its CaseHack cases create the event fixture and require it to be newly
created (`created: true`), deliberately refusing an existing `casehack-2026` row
so manual data is never reused or modified. Run that stateful suite only against
a disposable local stack reset without seeds
(`npx supabase db reset --local --no-seed`), with `LOCAL_SUPABASE_URL`,
`LOCAL_SUPABASE_SERVICE_KEY`, and `LOCAL_SUPABASE_PUBLISHABLE_KEY` pointing at
that stack. The test runner never resets your normal local stack, so do not aim
the suite at a database whose seeded manual CaseHack row you want to keep.

## Environment

Copy `web/.env.example` to `web/.env.local` and fill in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
APP_ORIGIN=http://127.0.0.1:3000
```

For isolated development, run `npx supabase start` and `npx supabase status` from
the repository root. Use the local API URL and publishable key (or local legacy
anon key). Use the hosted URL and its matching publishable key when intentionally
testing against staging. Never mix keys and URLs from different instances.

`.env.local` is ignored; `.env.example` contains committed placeholders. Restart
the Next.js development server after editing environment values. `NEXT_PUBLIC_`
values are included in browser bundles at build time. Never put a secret or
service-role key there. No privileged client is included in this foundation.

## Client helpers

- Client Components: `import { createClient } from "@/lib/supabase/client"`,
  then `const supabase = createClient()`.
- Server Components, Server Actions, and Route Handlers:
  `import { createClient } from "@/lib/supabase/server"`, then
  `const supabase = await createClient()`.
- The server helper is marked `server-only` and creates a new user-scoped client
  per call. Do not share it across requests or wrap it in `use cache`.

Use the same local origin in the browser and OAuth redirect allowlist. Set `APP_ORIGIN` to the application origin for each environment. Google must redirect to the Supabase OAuth callback, and the Supabase allowlist must include the application `/auth/callback`.

The server helper reads cookies internally; callers do not pass a cookie store.
With Cache Components enabled, place components reading request cookies inside
an appropriate Suspense boundary. Keep authenticated reads out of shared caches.

`web/proxy.ts` calls `lib/supabase/proxy.ts` before page requests, excluding static
assets. It calls `auth.getClaims()` to trigger session refresh and forwards new
cookies to both the rendering request and the browser response. It also preserves
the SDK's cache-prevention headers when cookies are written. Return that response
unchanged; future redirects must preserve its cookies and cache headers.

Public pages continue to work when both environment variables are absent. A
partially configured integration throws a configuration error. The proxy does not
redirect public visitors or authorize features. Protected operations must verify
identity with `getClaims()` or `getUser()`, handle errors, enforce permissions,
and use RLS. Do not trust `getSession()` alone for server authorization.

## Verification

From `web/`:

```sh
npm run test:unit
npm run lint
npm run typecheck
npm run build
npm test
```

Auth tests use mocked HTTP responses with the real Supabase SSR client to verify
expired-session refresh, forwarded cookies, and cache headers. They require no
database, real accounts, credentials, or browser installation. Browser tests cover
the existing public website. Real login and callback acceptance tests belong with
the portal implementation.

Reference: [Supabase SSR setup](https://supabase.com/docs/guides/auth/server-side/nextjs).
