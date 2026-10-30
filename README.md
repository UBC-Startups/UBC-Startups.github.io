# UBC Startups

Public website: https://ubcstartups.com

## Repository structure

```text
.github/                  # CI and deployment workflows
legacy/                   # Current Create React App website
web/                      # Next.js public-site migration
supabase/                 # CLI configuration; feature migrations/tests pending
package.json              # Shared tooling; root lockfile pins the Supabase CLI
IMPLEMENTATION_PLAN.md    # Next.js and Supabase migration plan
```

`web/` contains the migrated public pages. Membership, native event registration,
and networking features are planned. Root `supabase/` contains CLI configuration;
feature owners will add migrations, policies, and database tests. Each application
manages its own dependencies and lockfile. The root package manages shared tooling.

## Run the Next.js application

Use the Node version in `web/.nvmrc` (26.12.0), then from the repository root:

```sh
cd web
npm ci
npm run dev
```

Open http://localhost:3000. No Supabase credentials or Docker are needed for the
public pages. See [web/README.md](web/README.md) for validation and browser tests.
New contributors should also read the [shared UI and styling guide](web/docs/design-system.md).

## Supabase development

Use Node 26.12.0. With Docker Desktop running, execute from the repository root:

```sh
npm ci
npx supabase start
npx supabase status
```

Follow the [Supabase setup guide](web/docs/supabase.md) to configure `web/.env.local`
and use the shared clients. Each developer can run locally without linking to
the hosted project. Session refresh is implemented; login flows and feature
schemas remain pending. Run `npx supabase stop` when finished with the local stack.

## Run the current website

Use Node 26.12.0 for local development and run from the repository root:

```sh
cd legacy
npm ci
npm start
```

To verify the application from `legacy/`:

```sh
npm run build
npm test -- --watchAll=false --passWithNoTests
```

See [legacy/README.md](legacy/README.md) for application notes and
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the planned platform.

## Releases

Feature pull requests target `development`. Releases use a pull request from
`development` to `main`. GitHub Actions installs, builds, and tests `legacy/`
using Node 26.12.0 from `web/.nvmrc`. Pushes to `main` deploy the verified artifact
from `legacy/build/` to GitHub Pages. The legacy check remains named `build (26.x)`;
remove `build (22.x)` and `build (24.x)` from GitHub required checks if configured.

The separate `Next.js CI` workflow checks `web/` with linting, type checking, a
production build, and desktop/mobile browser tests. Its job is named `web checks`.
Add that exact check to branch rules after GitHub has reported its first run.

Pull requests and pushes to `development` do not deploy. Next.js will need separate
hosting; this change does not switch the production website to Next.js.

Generated dependencies, build output, and local environment files are ignored
at any directory depth. Root `node_modules/` contains shared tooling such as the
Supabase CLI; each app has its own dependencies. Old root-level `build/` output
is unused by the relocated application and CI.
