# UBC Startups — Next.js

Public-site migration using Next.js App Router, React, TypeScript, and Tailwind.
The shared design system uses Tailwind and TypeScript components. Existing
page-specific components retain scoped styles during incremental migration.

**New contributors:** read [the design-system guide](docs/design-system.md) before
adding UI. It covers tokens, component APIs, styling conventions, and validation.

## Development

Use Node 26.12.0 (`.nvmrc`). From this directory:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The public pages need no environment variables or
backend services. To run alongside the legacy development server, choose another
port with `npm run dev -- --port 3001`.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Browser tests start the production server on port 3100 and run at desktop and
mobile widths. Build before running them. Tests mock newsletter submissions,
analytics, and social embeds; they never send real subscriptions. Live third-party
embed behavior and email delivery still need separate manual acceptance.

The `web checks` GitHub Actions job installs dependencies, runs the checks above,
and installs Chromium with its Linux dependencies. It does not deploy the app.

## Structure

- `app/`: App Router pages, layouts, metadata, loading/error/not-found UI.
- `views/`: Public page compositions. Do not rename this to `pages/`.
- `home/`: Shared public-site layout, sections, content, design tokens, and UI.
- `components/`: Navigation, event cards, and photo gallery.
- `components/ui/`: Shared buttons, fields, typography, cards, badges, and containers.
- `styles/tokens.css`: The single source of truth for the existing design values.
- `docs/design-system.md`: Styling and onboarding guide.
- `data/`: Team roster, event lineup, and event poster content.
- `public/figma/` and `public/images/`: Local checked-in assets copied from legacy.
- `tests/e2e/`: Browser regression coverage.

Existing routes are `/`, `/events`, `/meetOurTeam`, `/event-poster/soar-2026`,
and `/event-poster/[eventId]`. Known poster slugs retain their content and signup
links. Unknown slugs now show the not-found page instead of a sample event; streamed
not-found responses may have HTTP 200, with Next.js providing `noindex` metadata.

Tailwind Preflight is intentionally omitted to avoid changing the migrated design.
Native CSS Modules are excluded from the Tailwind loader. The original Google
Fonts stylesheet loads from `app/layout.tsx`, preserving the families and weights
on every route. Desktop/mobile typography was compared against the legacy site
with the actual web fonts loaded. The analytics measurement ID is retained. Public copyright-year
data is cached; no session or member data exists in this migration.

Production remains the legacy website on GitHub Pages. Hosting selection,
Supabase integration, member accounts, registration workflows, and the networking
hub are separate implementation phases. See the root implementation plan.
