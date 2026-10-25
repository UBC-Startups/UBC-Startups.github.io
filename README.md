# UBC Startups

Public website: https://ubcstartups.com

## Repository structure

```text
.github/                  # CI and deployment workflows
legacy/                   # Current Create React App website
web/                      # Next.js public-site migration
IMPLEMENTATION_PLAN.md    # Next.js and Supabase migration plan
```

`web/` contains the migrated public pages. Membership, native event registration,
and networking features are planned. The future root `supabase/` directory will
contain database migrations, policies, configuration, and tests. Each application
manages its own dependencies and lockfile.

## Run the Next.js application

Use the Node version in `web/.nvmrc` (26.12.0), then from the repository root:

```sh
cd web
npm ci
npm run dev
```

Open http://localhost:3000. No Supabase credentials or Docker are needed for the
public pages. See [web/README.md](web/README.md) for validation and browser tests.

## Run the current website

Use Node 24 and run from the repository root:

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
on Node 22, 24, and 26. Pushes to `main` deploy the Node 24 artifact from
`legacy/build/` to GitHub Pages after all matrix checks pass.

The separate `Next.js CI` workflow checks `web/` with linting, type checking, a
production build, and desktop/mobile browser tests. Its job is named `web checks`.
Add that exact check to branch rules after GitHub has reported its first run.

Pull requests and pushes to `development` do not deploy. Next.js will need separate
hosting; this change does not switch the production website to Next.js.

Generated dependencies, build output, and local environment files are ignored
at any directory depth. Old root-level `node_modules/` and `build/` directories
are unused by the relocated application and CI.
