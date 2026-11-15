# Supabase integration

The shared clients, session-refresh proxy, Google sign-in, and profile setup are
installed. Feature schemas live in root `supabase/migrations` with RLS and pgTAP
tests; new features still own their migrations, policies, and database tests.

## First-time local setup

Install and start Docker Desktop (or another supported Docker-compatible runtime).
Use Node from `web/.nvmrc`. From the repository root:

```sh
npm run dev
```

The root runner stops its previous Next.js session for this checkout, runs `npm ci`
in the root and `web/` on every startup, restarts the
pinned Supabase CLI's local stack, resets the local database from this branch's
migrations and seeds, and starts Next.js on http://127.0.0.1:3000. **The default
startup clears local accounts, profiles, and feature data.** The root package pins
Supabase CLI **3.1.0**, which targets the local database by default. The runner never
passes `--remote`, even when a hosted project is linked.

Setup runs in your current terminal so installation, migration progress, and
errors stay visible. Once backend setup completes, Next.js opens in a separate
terminal with live logs, and the original terminal returns to its prompt. Watch
the new terminal for Next.js's ready message. On Linux, the terminal executable
defaults to `x-terminal-emulator`; override it with `DEV_TERMINAL` if needed.

The runner creates a missing root `.env` from `.env.example`. Fill in the Google
OAuth credentials below once, then rerun the command. Local API keys and URLs are
read from CLI status and passed directly to Next.js, overriding hosted values in
the parent environment or `web/.env.local` without editing that file. Keys are not
printed by the runner. No manual web environment setup is needed for this workflow.

Use `npm run dev:resume` to preserve local data and apply pending local migrations.
Rerun startup after backend changes: both modes restart Supabase to reload its
configuration and root `.env`. Default startup rebuilds the database, including
edits to existing migrations and seeds; resume only applies pending migrations.
Use a fresh default startup after switching branches; resume does not undo another
branch's migrations. `npm run db:reset` is a direct alias for
`supabase db reset` and requires Supabase to be running. Stop the app before
resetting. If port 3000 belongs to a manually started server or another checkout,
stop that process first. The standalone `db:reset` alias does not manage Next.js or
install dependencies. `npm run dev stop` or `npm run dev:stop` stops both the
managed Next.js session and Supabase while retaining database data.
Stop also cancels an in-progress setup or terminal handoff. If an interrupted
dependency install removed the CLI, shutdown restores the root tooling before
stopping Supabase. Ordinary shutdown does not reinstall dependencies.

Each developer gets an isolated local database; hosted linking is optional for
local feature work. Do not rerun `supabase init` in a clone that already has
`supabase/config.toml`. For manual CLI operation, install root dependencies with
`npm ci`, then use `npx supabase start` and `npx supabase status`. For app-only
development, install dependencies in `web/` and run its own `npm run dev`.

Use `npm run dev:stop` from the root to stop local services. Coordinate reviewed
migrations to hosted staging through one designated maintainer. Linking a hosted
project alone does not apply migrations. Feature migrations and their pgTAP tests
live in `supabase/migrations` and `supabase/tests/database`.

CLI v3 uses `--remote` to explicitly select a hosted target. Hosted changes run
unattended require `--yes` as well. The former `--local`, `--linked`, and `--db-url`
flags are deprecated; omit a target for local work. Keep the npm CLI pin and root
lockfile together when upgrading. This CLI upgrade does not change the app's
Supabase client libraries or deploy changes to a hosted project. See the
[v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).

## Environment

### Supabase CLI

The root runner creates `.env` if missing. For manual setup, copy the root
`.env.example` to `.env` and fill in the Google OAuth client:

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

When using the root runner, these values are injected into Next.js automatically.
For manual app startup, copy `web/.env.example` to `web/.env.local` and fill in:

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
npm run test:auth
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
