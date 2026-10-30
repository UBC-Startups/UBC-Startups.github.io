# Next.js public website

- Run npm commands from `web/`; use the Node version in `.nvmrc` and the lockfile.
- Routes and metadata live in `app/`. Composed page components live in `views/`,
  shared UI in `home/` and `components/`, and content in `data/` and `home/content.js`.
- Existing migrated components remain JavaScript for an incremental port. Use
  TypeScript for new features. Preserve copied content, asset casing, and routes.
- Read `docs/design-system.md` before styling UI. Use Tailwind and the primitives
  in `components/ui/` for new/shared UI. All reusable values live in `styles/tokens.css`.
- Existing CSS Modules consume those tokens and remain during section-by-section
  conversion, especially for animations/artwork. Do not create a separate portal
  styling system or duplicate token values in features. Preflight remains disabled.
- Restrict `use client` to interactive components. Do not pass event handlers or
  ordinary functions from Server Components to Client Components.
- Use `lib/use-prefers-reduced-motion` for motion decisions in rendered JSX so
  server and initial client styles agree. Preserve the shared font stylesheet.
- Keep native forms mounted through submission; verify the request contract with
  mocked endpoints when changing forms. Never send real subscriptions in tests.
- Compare shared styling changes at mobile, tablet, and desktop widths with fonts
  loaded, preserving existing typography, colors, focus behavior, and layout.
- After changes run lint, typecheck, build, and the relevant Playwright tests.
- Do not deploy `web/` through the legacy Pages workflow or modify `legacy/` as
  part of routine new-app development.
- Supabase clients live in `lib/supabase/`; read `docs/supabase.md` before adding
  auth/data access. Use the async server client per request and browser client
  for Client Components. Proxy refreshes sessions; features still authorize
  every protected operation. Run `npm run test:auth` when changing this foundation.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
