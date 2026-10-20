# UBC Startups

Public website: https://ubcstartups.com

## Repository structure

```text
.github/                  # CI and deployment workflows
legacy/                   # Current Create React App website
IMPLEMENTATION_PLAN.md    # Next.js and Supabase migration plan
```

The planned `web/` directory will contain the Next.js application, including its
application backend. The planned `supabase/` directory will contain database
migrations, policies, configuration, and tests. Neither has been created yet.
Each application will manage its own dependencies and lockfile.

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

Pull requests and pushes to `development` do not deploy. The future Next.js
application will need separate hosting; it is not deployed by this workflow.

Generated dependencies, build output, and local environment files are ignored
at any directory depth. Old root-level `node_modules/` and `build/` directories
are unused by the relocated application and CI.
