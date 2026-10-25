# UBC Startups platform implementation plan

Status: Migration started; product policies and launch decisions remain under review
Updated: 2026-10-25

## Current progress

Verified from the local repository unless otherwise noted:

| Item | Status |
| --- | --- |
| Legacy application relocation | Complete: source, assets, scripts, package manifest, and lockfile live in `legacy/`. |
| Legacy CI paths | Updated: commands run in `legacy/`, dependency caching uses its lockfile, and the Pages artifact is `legacy/build/`. |
| Legacy PR builds | User reports Node 22/24/26 checks passed. Production deployment still uses the Node 24 artifact. |
| Next.js application | Consolidated to `web/`; all five public route patterns migrated, including the team, events, SOAR, and known event posters. |
| Application tooling | Next.js 16.4.2, React 19.3.0, TypeScript routes/new UI, ESLint, Tailwind CSS 4, and CSS Modules for the existing design. Ported components remain JavaScript for incremental typing. |
| Scaffold configuration | Cache Components, partial prefetching, and experimental agent feedback are enabled. |
| Developer runtime | `web/.nvmrc` pins Node 26.12.0; the new-app workflow uses that file. Legacy deployment remains on Node 24. |
| Supabase | Root `supabase/` directory has not been created; local services, schema, and auth integration remain pending. |
| New application CI | Added `.github/workflows/web.yml` with lint, types, production build, and desktop/mobile Playwright checks. Its stable job name is `web checks`; first remote execution is pending. |
| Local verification | New-app lint/build/type checks and 22 browser checks passed. Legacy build/test command passed (legacy still has no automated tests). Desktop/mobile screenshots were compared against the rebuilt legacy app. |

The application root is now `web/`. Production still serves the legacy app;
Next.js hosting, live third-party service acceptance, and production cutover remain pending.

## 1. Goal and scope

Expand the existing public website into a platform with:

- A members portal for accounts, onboarding, profiles, and membership management.
- Event registration with capacity limits, cancellations, waitlists, and administrative tools.
- A networking hub where members can discover founders, investors, and startups and request connections.

Preserve the existing public website and its URLs during the migration. Deliver the platform in stages so each release is usable and independently verifiable.

This document plans future implementation. It does not authorize production provisioning, DNS changes, deployment, or importing personal data.

## 2. Technology decisions

| Area | Decision | Notes |
| --- | --- | --- |
| Application | Next.js App Router and TypeScript | One application for public pages, the portal, and server endpoints. |
| Database | Supabase PostgreSQL | Relational data, constraints, transactions, and full-text search. |
| Authentication | Supabase Auth | Cookie-based server integration using `@supabase/ssr`. |
| Authorization | PostgreSQL row-level security (RLS) and server authorization | Enforce access in the database and at each server operation. |
| Files | Supabase Storage | Bucket and object policies for avatars and startup logos. |
| Application workflows | Next.js Server Actions and Route Handlers | Shared server modules contain business logic. |
| Styling | CSS Modules for migrated UI; Tailwind CSS 4 utilities for new UI | Legacy styled-components are extracted into native styles. Tailwind Preflight is omitted to preserve the existing design. |
| Hosting | Managed hosting with full Next.js support | Provider, account ownership, and budget remain to be selected. |
| Package management | Independent npm projects in `legacy/` and the Next.js application root, each with a committed `package-lock.json` | No npm workspaces initially. Standardize a tested Node 26 version for new-app development; legacy deployment remains Node 24 until intentionally changed. |
| Local development | Native Node/npm for applications; Docker-compatible runtime and Supabase CLI for local Supabase, recommended | Five-person team: isolate database work per developer. No custom application Dockerfile or mandatory WSL setup. |
| Caching | Cache Components enabled in the scaffold | Preserve this fact in the plan; review the selected version's guidance before caching public data. Never share-cache personal data or auth responses. |
| Validation | Zod, proposed | Validate untrusted input on the server; database constraints remain authoritative. |
| Testing | Vitest/React Testing Library, Playwright, and database integration tests, proposed | Cover business rules, user flows, and permissions. |
| Email | Transactional email provider, to be selected | Production authentication email and application notifications need delivery configuration. |

Use the Supabase client and generated database types initially; an additional ORM is unnecessary for the first version. Commit SQL migrations and regenerate types when the schema changes.

Keep business logic in Next.js rather than duplicating it in Edge Functions. Introduce a durable job runner only when notifications or other asynchronous work require it; do not rely on work continuing after an HTTP response.

## 3. Membership policy and initial product assumptions

Confirmed membership policy:

- The members portal is open to the public: anyone can register as a member, including students, founders, investors, and people outside UBC.
- Membership does not require administrator approval, an invitation, or a UBC email address.
- Open registration does not grant administrative permissions or automatically publish a member's profile or contact information.

The following remain proposed defaults rather than confirmed club policies:

- Registration requires an account with a verified email. Guest registration and paid tickets are deferred.
- Profiles are hidden from the directory until the user explicitly opts in. Public search-engine visibility is a separate setting.
- Founder and investor are profile categories, and a member can select both. They do not grant administrative privileges or imply verification.
- The networking MVP consists of profiles, filtering, and connection requests. Direct messaging, a social feed, recommendations, and real-time presence are deferred.
- No existing event registration or newsletter data is imported automatically.

Before implementing dependent features, resolve:

| Decision | Why it matters |
| --- | --- |
| What information is shared after accepting a connection? | Determines private contact storage and consent. |
| Who owns hosting, billing, support, and moderation? | Ensures continuity across executive turnover. |
| What are the data retention and account deletion policies? | Determines deletion, audit history, and event reporting behavior. |

Public startup discovery is supported by the architecture, but only explicitly published data should become indexable.

Directory audience, startup editing/ownership rules, and event guest/payment policies
must also be recorded before their dependent features are implemented. Open membership
does not by itself resolve those separate product decisions.

## 4. Application structure and boundaries

The existing CRA application lives in `legacy/`, and the new application lives in
`web/`. Keep future database infrastructure in root `supabase/`. Follow the
no-`src/` convention:

```text
legacy/                       # Existing CRA app and its own package/lockfile
web/                          # Target Next.js root and its own package/lockfile
  app/
    (public)/                 # Existing website and published profiles
    (auth)/                   # Sign-in, registration, recovery
    (portal)/portal/           # Member dashboard and account management
    (admin)/admin/             # Club administration
    auth/callback/            # Authentication callback
    api/                      # Integrations and external endpoints
    layout.tsx
  components/                 # Shared UI
  views/                      # Migrated page compositions, not a Pages Router
  home/                       # Existing public-site layout, sections, and copy
  data/                       # Team, event lineup, and event poster data
  features/
    members/
    events/
    networking/
    admin/
  lib/
    supabase/                 # Browser, server, and restricted privileged clients
    auth/                     # Identity and permission helpers
    validation/
  server/                     # Server-only data access and business workflows
  types/                      # Generated database types
supabase/
  migrations/
  tests/
  seed.sql                    # Synthetic development data only
web/tests/
  e2e/
```

Route groups organize code without adding URL segments. Keep existing components and content modules during migration where useful rather than reorganizing everything at once.

### Team development workflow

- Plan for five contributors, each using their own clone and feature branch. Open focused PRs against `development`; coordinate ownership of shared schema and authentication changes.
- Use the committed `web/.nvmrc` Node version; document npm and Supabase CLI versions when introducing database tooling. New-app Node 26 does not change the legacy production runtime automatically.
- Run Next.js directly with npm. Recommend Docker Desktop or another supported Docker-compatible runtime for local Supabase; WSL is optional for application development.
- Give each developer a local database with synthetic seeds. Commit schema and RLS changes as migrations; avoid unrecorded edits to a shared hosted database.
- Verify migrations against a clean local database and review conflicting migrations before merging. Do not edit migrations already applied to shared environments; add corrective migrations.
- Use hosted staging to test integrated changes, separate from production. Coordinate staging migration application through a documented release owner or CI process.
- Commit environment variable names and safe examples, never actual secrets. Keep application environment files in the current Next.js root and document commands relative to that root.
- Use stable required check names matching actual job results. For legacy CI, require `build (22.x)`, `build (24.x)`, and `build (26.x)` rather than the workflow title `Node.js CI`. Require `web checks` after its first successful GitHub run. Keep deployment optional on PRs; confirm the repository rules were saved in GitHub.

- Use Server Components for initial reads and public page rendering; Client Components handle forms and interactive controls.
- Use Server Actions for application form submissions and Route Handlers for callbacks, webhooks, and external clients.
- Revalidate identity and permissions inside every protected read or mutation. Layout redirects and session-refresh logic are not sufficient authorization.
- Use user-scoped Supabase clients for ordinary requests so RLS applies. Isolate privileged credentials in server-only modules for narrowly defined administrative operations.
- Keep authenticated responses out of shared caches. Cache only explicitly public data and invalidate it when publication or visibility changes.

## 5. Proposed data model

Finalize column definitions and state transitions before writing migrations. Use UUID primary keys, foreign keys, timestamps, explicit constraints, and indexes matching actual queries.

| Entity | Purpose and key rules |
| --- | --- |
| `auth.users` | Supabase-managed identity; do not build a second password system. |
| `profiles` | One per account: display name, bio, categories, interests, onboarding state, and visibility. |
| `member_contacts` | Private contact fields, stored separately from directory fields. |
| `memberships` | Membership lifecycle, such as active, suspended, or closed, and join date; no approval state or approval gate. |
| `role_assignments` | Server-managed permissions such as administrator and event manager. Users cannot assign themselves roles. |
| `startups` | Name, unique slug, description, sector, stage, website, and publication status. |
| `startup_members` | User-to-startup relationship with owner/editor permissions and unique membership pairs. |
| `investor_profiles` | Optional investment interests, sectors, and stages; distinguish self-description from club verification. |
| `events` | Unique slug, content, UTC timestamps, display timezone, capacity, registration window, and draft/published/cancelled status. |
| `event_registrations` | One record per event/user pair; registered, waitlisted, cancelled, and attendance information. |
| `connection_requests` | Requester, recipient, status, timestamps; prevent self-requests and duplicate pending requests in either direction. |
| `member_blocks` | Blocking relationships that prevent further connection requests and contact access. |
| `reports` | Member reports with restricted access for moderators. |
| `audit_logs` | Actor, action, target, timestamp, and minimal metadata for sensitive administrative changes. |
| `notification_outbox` | Durable notification intents with deduplication keys, delivery state, and retry information. |

Use normalized tags or constrained values for frequently filtered sectors and interests. Do not turn the existing team roster into account records; public team content and portal membership are separate concepts.

### Access rules to implement and test

| Actor | Intended access |
| --- | --- |
| Public visitor | Published events and explicitly public profile/startup fields only. |
| Account owner | Own onboarding, profile, privacy settings, registrations, and connection requests. |
| Signed-in member | Directory-visible fields according to the final directory access and profile visibility policies. |
| Startup owner/editor | Authorized startup fields and membership actions within assigned permissions. |
| Event manager | Assigned events and the minimum attendee information needed to operate them. |
| Administrator/moderator | Explicitly assigned administrative or moderation capabilities, with audit logging. |

RLS controls rows, not which fields are safe to disclose. Separate private data into restricted tables and expose deliberately selected fields. Any database views must preserve caller permissions or otherwise enforce equivalent access rules.

## 6. Implementation phases

### Phase 0: Confirm product rules and establish a baseline

- Record open public membership as a fixed requirement; resolve remaining account, directory access, and privacy decisions.
- Inventory current pages, assets, anchors, external signup links, analytics, metadata, and responsive behavior.
- Capture desktop and mobile reference screenshots and record working direct URLs.
- Select hosting and email providers, assign club-owned accounts, and estimate costs against expected usage.
- Record initial account, event, and connection state transitions.

**Exit criteria:** Reviewed MVP scope, access matrix, route inventory, and infrastructure proposal.

### Phase 1: Migrate the public website to Next.js

- Completed: consolidated the scaffold into `web/` while keeping `legacy/` independently runnable. Keep each application's manifest and lockfile together.
- Pin compatible framework, React, TypeScript, and Supabase packages at implementation time. Review existing dependency overrides before retaining or removing them.
- Completed: ported existing styles to CSS Modules, retaining colors, spacing, typography, and responsive behavior. Tailwind utilities remain available for new UI; styled-components is not installed in the new application.
- Review the scaffold's Cache Components, partial prefetching, and experimental agent feedback settings against the installed Next.js documentation. Make deliberate configuration choices; establish public/private data boundaries before adding caches.
- Adapt the legacy CRA entry point, React Router navigation, and React Helmet metadata to Next.js equivalents in `web/`; retain the deployed legacy implementation during migration.
- Preserve `/`, `/meetOurTeam`, `/events`, `/event-poster/soar-2026`, and `/event-poster/[eventId]`. Keep SOAR's dedicated page behavior.
- Preserve section anchors, analytics, exact asset filename casing, existing copy, and signup links. Adapt imported image handling as needed; keep `public/figma` assets local.
- Implement accessible loading, error, and not-found states. Preserve the existing design tokens and responsive layouts.
- Add scripts for development, production build/start, type checking, linting, and noninteractive tests; update contributor documentation.
- Verify the Next.js application on a separate preview host and add its own CI checks. Keep deploying `legacy/build/` through the existing Pages workflow until cutover; a server-capable Next.js build cannot be shipped by that workflow.

**Exit criteria:** Existing pages match the baseline at mobile and desktop sizes; direct links, refreshes, navigation, anchors, and images work; production build and migration checks pass.

### Phase 2: Establish Supabase and authorization

- Initialize root `supabase/` and document running the pinned CLI from the repository root. Establish the recommended per-developer local stack through Docker and isolated hosted staging/production projects. Preview deployments must not use production data or privileged production credentials.
- Commit initial schema, RLS, storage policies, constraints, indexes, and synthetic seeds through migrations.
- Configure cookie-based auth, session refresh, verified server identity, safe callback redirects, email verification, sign-out, and password recovery.
- Configure production email delivery and explicit callback URL allowlists per environment.
- Implement server-only data access and validation helpers. Generate database types from the schema.
- Bootstrap the first administrator through a documented controlled procedure; never expose role assignment in ordinary profile editing.
- Add permission tests against direct database/API access, including anonymous users, owners, other members, and administrators.

**Exit criteria:** A fresh environment can be recreated from migrations; authentication works; cross-account access and privilege escalation attempts fail.

### Phase 3: Deliver the members portal

- Build onboarding, the member dashboard, profile editing, membership status, and privacy controls.
- Support founder/investor categories independently of permission roles.
- Add avatar uploads with ownership, size, and allowed-format validation; use private buckets for files requiring revocable access.
- Enable self-service membership registration for anyone, without approval, invitations, or institutional email restrictions. Keep email verification separate from membership approval.
- Add account export/deletion handling according to the retention policy, including storage cleanup and explicit treatment of event and audit records.

**Exit criteria:** Members can complete onboarding and manage their own information; hidden data remains inaccessible through pages, APIs, search, and storage.

### Phase 4: Deliver event registration

- Add event management for drafts, publication, registration windows, capacity, cancellation, and assigned managers.
- Keep existing external registration links until each event intentionally switches to native registration. Centralize event details so homepage, listing, and poster pages stay consistent.
- Implement registration, cancellation, and waitlist promotion as database transactions with consistent per-event locking. Enforce eligibility and caller identity inside the transaction.
- Enforce unique event/user registration records, idempotent retries, closed-event rules, and capacity checks. Capacity edits must respect existing registrations.
- Promote waitlisted members in a documented deterministic order. Handle cancellation/promotion races atomically.
- Add personal registration history, restricted attendee exports, and authenticated staff check-in. Escape spreadsheet formula prefixes in CSV exports.
- Write notification intents in the same transaction as registration changes. Deliver through a retryable outbox processor; failed email must not roll back a confirmed seat.

**Exit criteria:** Concurrent attempts cannot overbook the last seat; retries do not duplicate registrations or notifications; cancellation and waitlist promotion remain consistent; attendee data is restricted.

### Phase 5: Deliver the networking hub

- Build opt-in member profiles, startup pages, and investor profiles with explicit publication controls.
- Implement startup creation, invitations or owner-managed membership, and ownership transfer according to the confirmed policy.
- Add paginated directory search and filters for relevant sectors, stages, interests, and member categories using PostgreSQL indexes and full-text search.
- Enforce visibility before returning search results, counts, profile pages, metadata, and images. Add public metadata only for explicitly public profiles.
- Implement connection request, accept, decline, cancel, and block workflows. Reveal only consented contact information after acceptance.
- Add reporting, moderation, and persistent rate limits for requests and other abuse-prone actions.
- Remove unpublished profiles from public search and invalidate public caches promptly; explain that third-party search engines can retain older copies.

**Exit criteria:** Users can find appropriate profiles and connect; private data never appears in public results or metadata; blocks and permission changes apply immediately to protected reads.

### Phase 6: Production readiness and launch

- Complete mobile, desktop, keyboard, focus, reduced-motion, and horizontal-overflow checks on old and new flows.
- Configure error reporting, structured logs, health checks, and alerts for authentication, registration failures, and notification backlog without logging credentials or unnecessary personal data.
- Configure and test backups and restoration. Review provider limits, storage growth, email delivery, and monthly budget.
- Update CI to run locked installs, type checks, linting, unit/integration tests, production builds, and critical browser flows. Retain the existing Node matrix where supported or document changes.
- Preserve feature PRs to `development` and releases through `development` to `main`. Ensure hosting cannot publish production before required checks pass.
- Rehearse staging migrations and a deployment with synthetic accounts. Use additive schema changes so application rollback remains possible.
- Prepare the domain cutover, HTTPS, authentication callback changes, legacy redirects, and replacement of the Pages workflow. Preserve existing CNAME and SPA fallback behavior until cutover; remove obsolete behavior only as part of the hosting migration.
- Obtain launch authorization before applying production migrations, changing DNS, or switching deployment. Keep the previous public site recoverable; disable new features if a rollback would otherwise strand production data.
- Update README and AGENTS.md to match the delivered architecture, commands, environment setup, and release process.

**Exit criteria:** Staging acceptance checks pass, production migration and rollback procedures are reviewed, and launch is authorized.

## 7. Verification strategy

Tests should establish observable behavior rather than mirror implementation details:

- **Database integration:** RLS for every role, field privacy, ownership, state transitions, duplicate constraints, and concurrent registration/cancellation/waitlist operations against PostgreSQL.
- **Server workflows:** Open public signup without approval or institutional email restrictions, invalid input, unauthenticated calls, suspended-account restrictions, role changes, idempotency, and delivery retries.
- **Browser flows:** Sign up, verify email, sign in/out, recover access, onboard, edit privacy, register/cancel, search profiles, connect/block, and administer an event.
- **Migration regression:** All existing public routes, direct navigation, refreshes, anchors, metadata, image loading, and responsive navigation.
- **Operations:** Rebuild an empty database from migrations, restore a backup in isolation, deploy staging, and rehearse application rollback with the migrated schema.

Use synthetic users and independent sessions for privacy tests. Verify private information is absent from rendered HTML and network responses, not merely hidden in the interface. Choose the test runner configuration during migration; CRA's current test flags do not automatically apply to a replacement runner.

## 8. Delivery approach and deferred work

Open focused feature PRs against `development`: public-site migration, database/auth foundation, portal, event registration, networking, then launch preparation. Split further where useful, keeping each PR buildable and including its migrations, tests, and documentation. Deploy incomplete features only behind server-enforced access controls or feature flags.

Payments, guest tickets, real-time chat, feeds, algorithmic matching, fundraising transactions, advanced search infrastructure, and a separate API service are outside the first release. Revisit them after the core workflows are used successfully.

The public-site port, directory cleanup, Node pin, and new-app CI configuration
are implemented locally. Next: review the migrated site with the team, run the new
checks on GitHub, and arrange a separate preview host. Third-party embeds and actual
newsletter delivery need manual acceptance; automated checks mock those services.
Resolve remaining Phase 0 policies and begin local Supabase setup/schema design
without treating backend features or production launch as complete.

## 9. Technical references

Verify implementation details against the selected package versions before coding:

- [Next.js server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
- For scaffold-specific behavior, consult `node_modules/next/dist/docs/` from the actual Next.js application root, as directed by its generated AGENTS.md.
- [Next.js static export limitations](https://nextjs.org/docs/app/guides/static-exports)
- [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase local development](https://supabase.com/docs/guides/local-development)
- [PostgreSQL full-text search through Supabase](https://supabase.com/docs/guides/database/full-text-search)
