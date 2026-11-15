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

Use Node 26.12.0 from `web/.nvmrc` and start Docker Desktop with Linux containers.
For the full local environment, run from the repository root:

```sh
npm run dev
```

This runs `npm ci` in the root and `web/` on every startup using their committed lockfiles,
restarts Supabase, **resets the local database** using the current branch's migrations
and seeds, then starts Next.js at http://127.0.0.1:3000. Existing local accounts,
profiles, and feature data are cleared on every default startup. No hosted project
is changed. The first run can take longer while installing dependencies and
downloading Docker images.

Google sign-in requires one-time configuration: fill in the two Google OAuth
credentials in the root `.env`. The runner copies `.env.example` if `.env` is missing;
Supabase reports configuration errors when the credentials have not been filled in.
See the [Supabase setup guide](web/docs/supabase.md) for callback configuration.
Connection URLs and local API keys are discovered automatically and passed directly
to Next.js; the runner does not overwrite `web/.env.local` or print the keys.

| Root command | Behavior |
| --- | --- |
| `npm run dev` | Fresh local database from this branch, then Next.js |
| `npm run dev:resume` | Preserve local data, apply pending local migrations, then Next.js |
| `npm run dev:stop` | Alias for `supabase stop`; retain local data |
| `npm run db:reset` | Alias for `supabase db reset --local`; requires Supabase running |
| `npm run test:dev` | Test the startup runner without Docker or credentials |

Run `npm run dev` again after changing backend migrations, seeds, or configuration.
It stops the previous runner and its Next.js process for this checkout, reinstalls
dependencies, restarts Supabase to reload `config.toml` and root `.env`, rebuilds
the local database, and starts Next.js again. `dev:resume` also restarts the services
but preserves data and applies only pending migrations. Editing an already-applied
migration requires a fresh default startup.

Ctrl+C stops Next.js and leaves Supabase available in the background. Use
`npm run dev:stop` when finished. Processes started manually or by another checkout
are not stopped automatically: if one occupies port 3000, stop it manually first.
Stop the app before using the standalone `db:reset` alias. The standalone CLI
aliases do not manage Next.js or install dependencies. After switching
branches, use the default fresh startup: resume only applies pending migrations
and does not remove migrations applied by another branch. Changes made manually
in Studio must be captured in migrations or seeds to be reproducible.

Runner replacement uses a local named pipe on Windows or a Unix socket in the
system temporary directory. Each checkout has its own session; no PID files or
credentials are stored in the repository.

Both fresh and resume startup reinstall dependencies every time. There is no
dependency cache check, automatic dependency upgrade, or Git pull.
In Windows PowerShell, use `npm.cmd` if execution
policy blocks the `npm.ps1` shim.

For public pages without Docker or Supabase, the app-only workflow is still:

```sh
cd web
npm ci
npm run dev
```

See [web/README.md](web/README.md) for validation and browser tests. New contributors
should also read the [shared UI and styling guide](web/docs/design-system.md).

## Supabase development

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

Pull requests and pushes to `development` do not deploy. Next.js will need separate
hosting; this change does not switch the production website to Next.js.

Generated dependencies, build output, and local environment files are ignored
at any directory depth. Root `node_modules/` contains shared tooling such as the
Supabase CLI; each app has its own dependencies. Old root-level `build/` output
is unused by the relocated application and CI.
