# Next.js public website

- Run npm commands from `web/`; use the Node version in `.nvmrc` and the lockfile.
- Routes and metadata live in `app/`. Composed page components live in `views/`,
  shared UI in `home/` and `components/`, and content in `data/` and `home/content.js`.
- Existing migrated components remain JavaScript for an incremental port. Use
  TypeScript for new features. Preserve copied content, asset casing, and routes.
- Keep the existing CSS Modules during migration. Tailwind utilities are enabled
  without Preflight so they do not reset existing browser defaults.
- Restrict `use client` to interactive components. Do not pass event handlers or
  ordinary functions from Server Components to Client Components.
- After changes run lint, typecheck, build, and the relevant Playwright tests.
- Do not deploy `web/` through the legacy Pages workflow or modify `legacy/` as
  part of routine new-app development.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
