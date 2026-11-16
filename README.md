# UBC Startups

Public website: https://ubcstartups.com

## Repository structure

```text
.github/                  # CI and deployment workflows
legacy/                   # Current Create React App website
web/                      # Next.js public-site migration
supabase/                 # Local configuration, migrations, seeds, and database tests
package.json              # Shared tooling; root lockfile pins the Supabase CLI
IMPLEMENTATION_PLAN.md    # Next.js and Supabase migration plan
```

`web/` contains the migrated public pages. Membership, native event registration,
and networking features are planned. Root `supabase/` contains database migrations,
policies, seeds, and tests. Each application manages its own dependencies and
lockfile. The root package manages shared tooling.

## Run the Next.js application

Use Node 26.12.0 from `web/.nvmrc` and start Docker Desktop with Linux containers.
For the full local environment, run from the repository root:

```sh
npm run dev
```

`npm run dev` installs locked root/web dependencies, restarts Supabase, and
**resets local accounts and data** from this branch's migrations and seeds.
Setup runs in the current terminal; Next.js opens in a separate terminal with
live logs. Wait for its ready message, then open http://127.0.0.1:3000.

On first use, the runner creates root `.env` from `.env.example`. Fill in its Google
OAuth credentials and rerun startup. See [OAuth setup](web/docs/supabase.md#supabase-cli)
for the callback URL. Local Supabase keys are injected automatically; no manual
`web/.env.local` is needed. The first run also downloads Docker images.

| Root command | Behavior |
| --- | --- |
| `npm run dev` | Fresh local database, then Next.js in a separate terminal |
| `npm run dev:resume` | Preserve data, apply pending migrations, then open Next.js |
| `npm run dev stop` / `npm run dev:stop` | Stop the managed Next.js session and Supabase; retain data |
| `npm run db:reset` | Alias for `supabase db reset`; requires Supabase running |
| `npm run test:dev` | Test the startup runner without Docker or credentials |

Rerunning startup replaces the managed server for this checkout and reloads
Supabase configuration. Use fresh startup after switching branches or editing
existing migrations/seeds: resume only applies pending migrations. Capture Studio
changes in migrations or seeds to share them.

Stop with `npm run dev stop`, including during setup. Manually started servers are
not managed; stop them yourself if they occupy port 3000. Stop Next.js before using
the standalone `db:reset` command.

Windows opens a new console, macOS uses Terminal, and Linux requires
`x-terminal-emulator` (override with `DEV_TERMINAL`). In PowerShell, use `npm.cmd`
if execution policy blocks `npm.ps1`.

For public pages without Docker or Supabase, the app-only workflow is still:

```sh
cd web
npm ci
npm run dev
```

See [web/README.md](web/README.md) for validation and browser tests. New contributors
should also read the [shared UI and styling guide](web/docs/design-system.md).

## Supabase development

The root package pins **Supabase CLI 3.1.0**. Database commands target the local
stack by default; hosted work requires an explicit `--remote` target.

`Supabase CI` tests migrations and database policies on PRs. The Supabase GitHub
integration handles shared development database deployment; see
[setup](web/docs/supabase.md#shared-development-database).

The root development commands above manage the local stack. For manual CLI work,
use Node 26.12.0 and run from the repository root with Docker Desktop running:

```sh
npm ci
npx supabase start
npx supabase status
```

Follow the [Supabase setup guide](web/docs/supabase.md) for manual `web/.env.local`
configuration and shared clients. Each developer can run locally without linking
to the hosted project. Run `npm run dev:stop` when finished with the local stack.

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

Website deployment runs only from `main`; pushes to `development` can migrate the
shared development database. Next.js will need separate hosting; this change does
not switch the production website to Next.js.

Generated dependencies, build output, and local environment files are ignored
at any directory depth. Root `node_modules/` contains shared tooling such as the
Supabase CLI; each app has its own dependencies. Old root-level `build/` output
is unused by the relocated application and CI.
