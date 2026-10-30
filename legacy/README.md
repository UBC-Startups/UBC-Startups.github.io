# Legacy website for UBC Startups

Run these commands from `legacy/`. From the repository root, first run `cd legacy`.
Use Node 26.12.0, pinned in `../web/.nvmrc` for both applications and CI.

### Run Website Locally

#### If First time running the website, install all dependencies
```
npm ci
```

```
npm start
```

### Deployment

1. Open feature pull requests against `development`. Node.js CI checks installation,
   build, and tests from `legacy/` on the pinned Node 26 version.
2. When changes are ready to release, open a pull request from `development` to `main`.
3. Merging into `main` runs the same checks and automatically deploys the Node 26
   build from `legacy/build/` to GitHub Pages after the build and tests pass.

The build check keeps the name `build (26.x)`. Remove old `build (22.x)` and
`build (24.x)` requirements from GitHub branch rules if they are configured.

Pull requests and pushes to `development` do not deploy. Local builds are for verification;
deployment is handled by GitHub Actions.

There are currently no automated test files. The test command permits an empty
suite; once tests are added, test failures will block deployment.
