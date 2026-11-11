# Supabase integration

The shared clients, session-refresh proxy, Google sign-in, and profile setup are
installed. Feature schemas live in root `supabase/migrations` with RLS and pgTAP
tests; new features still own their migrations, policies, and database tests.

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
project alone does not apply migrations. Feature migrations and their pgTAP tests
live in `supabase/migrations` and `supabase/tests/database`.

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

## Registration drafts and local autosave checks

The event registration form autosaves a working draft before the first
submission. A draft is the same `public.event_registrations` row with
`status = 'draft'`, `submitted_at IS NULL`, empty `accepted_agreements`, and the
raw answers plus checked agreement ids in `draft_agreement_keys`. Final
submission promotes that row in place and replaces the acceptance snapshot with
trusted server timestamps. The schema and RPCs are in
`supabase/migrations/20261108212134_add_registration_drafts.sql`; apply them to a
local stack with the normal migration workflow.

The browser sends a full snapshot through the `saveEventRegistrationDraft`
Server Action, never through the native form action, so autosave cannot reset
the form or caret. The form keeps one request in flight, coalesces newer edits,
and only advances its expected revision after a successful save. Resuming a draft
restores known answers and agreement ids, opens the first incomplete step, and
does not show required-field errors until the attendee advances.

To check autosave and resume manually, start the local stack and the web app,
sign in with a complete local test profile, and open an open registration such
as `/events/casehack-2026/register`:

1. Enter an answer, wait for the “Progress saved” status, refresh the page, and
   confirm the answer and first incomplete step are restored.
2. Clear that answer, wait for “Progress saved” again, refresh, and confirm the
   cleared value persists instead of the earlier text.
3. Complete the required answers and submit. Confirm the receipt replaces the
   form; saved progress alone must never be shown as a submission.

The committed opt-in suite exercises autosave persistence/restore and draft
promotion on submission. It does not automate forced retry, revision conflict,
or final-flush coverage; check those manually using the steps above. The suite
never runs in CI or in the backend-free `npm test` pass. Point the three
`LOCAL_SUPABASE_*` variables at a disposable local stack reset without seeds,
then from `web/` run:

```sh
npx playwright test --config playwright.event-signup.config.ts
```

The suite creates and deletes synthetic users, profiles, events, and
registrations. Do not aim it at your normal local database or at a seeded
`casehack-2026` row you want to keep. The backend-free checks do not cover
autosave runtime behavior; verify it against the disposable local stack.

## Environment

### Supabase CLI

Copy the root `.env.example` to `.env` and fill in the Google OAuth client:

```sh
cp .env.example .env
```

```dotenv
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

`supabase/config.toml` reads these through `env(...)` when the Google provider is
enabled, so create the root `.env` before `npx supabase start`. The client secret
stays local and is never committed. The root `.env` configures the Supabase CLI;
the Next.js app does not read it.

### Web application

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

Both root `.env` and `web/.env.local` are ignored; the matching `.env.example`
files contain committed placeholders. Restart the Next.js development server
after editing environment values. `NEXT_PUBLIC_` values are included in browser
bundles at build time. Never put a secret or service-role key there. No privileged
client is included in this foundation.

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
