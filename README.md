# Website for UBC Startups

### Run Website Locally

#### If First time running the website, install all dependencies
```
npm install
```

```
npm start
```

### Deployment

1. Open feature pull requests against `development`. Node.js CI checks installation,
   build, and tests on Node 22, 24, and 26.
2. When changes are ready to release, open a pull request from `development` to `main`.
3. Merging into `main` runs the same checks and automatically deploys the Node 24
   build to GitHub Pages after all three Node versions pass.

Pull requests and pushes to `development` do not deploy. Local builds are for verification;
deployment is handled by GitHub Actions.

There are currently no automated test files. The test command permits an empty
suite; once tests are added, test failures will block deployment.
