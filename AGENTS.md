# Repository guidance

## Project

UBC Startups' public website at `https://ubcstartups.com`. This is a client-side
React 18 application built with Create React App (`react-scripts` 5), JavaScript,
React Router 6, and styled-components 5. Use npm and the committed
`package-lock.json`.

## Where to make changes

- `src/index.js`: application entry point.
- `src/App.js`: route definitions. Active routes include `/`, `/meetOurTeam`,
  `/events`, `/event-poster/soar-2026`, and `/event-poster/:eventId`.
  The opportunities route is currently disabled.
- `src/pages/`: page components, including event posters and the SOAR page.
- `src/home/Layout.jsx`: shared shell for redesigned pages, including navigation,
  metadata, and newsletter/footer.
- `src/home/theme.js`: shared colors, spacing, typography, breakpoints, and the
  `figma()` public asset path helper.
- `src/home/ui.jsx` and `src/home/sections/`: reusable UI and redesigned sections.
- `src/home/content.js`: homepage copy, navigation links, partners, timeline,
  featured event, and social content.
- `src/home/events.js`: event lineup and signup links.
- `src/data/team.js`: team roster and advisors.
- `src/components/` and `src/sections/`: older components still used by some pages.
  Check imports before changing or removing them.
- `src/images/`: imported photos and graphics; `public/figma/`: locally stored
  Figma exports.
- `public/index.html` and `public/404.html`: paired GitHub Pages SPA redirect logic.
- `.github/workflows/node.js.yml`: CI and GitHub Pages deployment.

## Development commands

Use Node 24 to match the deployed build. CI also checks Node 22 and 26.

```sh
npm ci
npm start
npm run build
npm test -- --watchAll=false --passWithNoTests
```

- `npm ci` installs the locked dependency versions; `npm start` runs the local
  development server.
- Run the build and noninteractive test command for application changes. There
  are currently no automated test files; an empty passing suite does not verify
  application behavior. Add meaningful React Testing Library tests when changing
  behavior that needs regression coverage; setup is in `src/setupTests.js`.
- For visual changes, check affected pages at mobile and desktop widths, including
  navigation, interactive controls, image loading, and horizontal overflow.
- For routing changes, check in-app navigation, direct links, refreshes, and hash
  anchors. Keep the Pages fallback and its matching URL restoration intact.
- Documentation-only changes need a content review, not a full application build.
  Report which checks ran and any checks that could not be completed.

## Implementation conventions

- Follow the surrounding JavaScript/JSX style and use functional React components.
  Keep changes focused; avoid unrelated formatting or framework migrations.
- Reuse the existing layout, UI components, and design tokens for redesigned
  pages. Keep responsive behavior consistent with the shared breakpoints.
- Prefer editing the dedicated content/data files over duplicating copy in JSX.
  Event details also appear in poster pages and homepage content; check related
  representations when updating dates, titles, signup links, or event slugs.
- Use React Router links for internal routes and the existing hash-link pattern
  for section navigation. Preserve existing public routes and anchor IDs unless
  the task explicitly changes them.
- Use semantic elements, accessible names, meaningful image alt text, keyboard
  operability, and visible focus states. Honor reduced-motion preferences when
  adding animation.
- Use styled-components transient props (`$prop`) for styling-only values rather
  than forwarding them to DOM elements.
- Preserve exact image filename casing: deployment builds on Linux even when
  local development uses Windows.
- Do not invent missing event links, team details, or other factual content.
  Preserve the existing placeholder or omitted-button behavior until supplied.

## Assets and dependencies

- Serve Figma assets from the checked-in `public/figma/` files, using `figma()`
  where appropriate. Do not use temporary Figma export URLs in rendered UI.
- `npm run assets` runs `scripts/fetch-figma-assets.mjs` and overwrites local exports.
  Run it only for intentional asset updates. Its export URLs expire; obtain fresh
  exports and update the script when needed, then inspect the downloaded files.
- Do not edit or commit generated `build/`, `node_modules/`, or `coverage/` output.
- If dependencies change, update `package.json` and `package-lock.json` together.
  Review existing dependency overrides before changing them. Do not run
  `npm run eject` as part of routine work.
- Preserve `public/CNAME`, the package homepage, and analytics configuration
  unless the task calls for changing them. Do not commit secrets or local env files.

## Git and releases

- Preserve existing user changes and keep the diff limited to the task.
- Feature pull requests target `development`. Releases use a pull request from
  `development` to `main`.
- Pushes to `main` deploy automatically after the full Node matrix passes, using
  the Node 24 build artifact. Pull requests and pushes to `development` do not
  deploy. Local builds are for verification; deployment runs through Actions.
- Do not push, merge, or change deployment settings unless requested.
