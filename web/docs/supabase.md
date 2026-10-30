# Supabase integration

The shared clients and session-refresh proxy are installed. Feature owners still
implement signup/login, callbacks, authorization, schemas, migrations, RLS, and
generated database types. No sample `todos` table or route is required.

## Environment

Copy `web/.env.example` to `web/.env.local` and fill in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
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
