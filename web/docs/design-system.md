# Styling and shared UI

Start here when building a screen or changing the website's appearance. Our goal
is to preserve the existing UBC Startups design while giving every contributor
the same tools and conventions.

## Where things live

| File or directory | Responsibility |
| --- | --- |
| `styles/tokens.css` | Authoritative colors, fonts, typography, spacing, radii, and breakpoints. |
| `components/ui/` | Reusable TypeScript primitives styled with Tailwind. |
| `home/sections/` | Public-site sections; navigation, page hero, and newsletter use shared UI. |
| `home/theme.ts` | Compatibility references to CSS variables for existing JavaScript sections. Values must not be duplicated here. |
| `app/globals.css` | Tailwind imports, narrowly scoped legacy resets, focus treatment, and reduced motion. |
| `app/layout.tsx` | The shared Google Fonts stylesheet used by every route. |
| `*.module.css` | Existing page-specific styles, decorative geometry, and animations. These also consume the central tokens. |

Run commands from `web/`, using the Node version in `.nvmrc`. Start locally with
`npm ci` followed by `npm run dev`. The public site needs no backend services.

## Build with shared components first

Import from `@/components/ui`. Keep imports consistent; do not create a second
button, input, or typography system inside a feature folder.

| Component | Use | Options |
| --- | --- | --- |
| `Button` | Actions, submissions, and button-shaped links. | `variant="primary"`, `"secondary"`, or `"outline"`; native button/anchor attributes. |
| `Heading` | Semantic headings with a named visual style. | `as="h1"` through `"h6"`; independent `variant`. |
| `Text` | Body text, labels, and captions. | `as="p"` or `"span"`; named typography variant. |
| `TextField` | A labeled input with optional hint/error. | Required `id` and `label`; `tone="light"` or `"dark"`; `hideLabel` when necessary. |
| `Card` | A surface containing related content. | `as="div"`, `"section"`, or `"article"`; `padding="none"`, `"compact"`, or `"comfortable"`. |
| `Badge` | Short informational tags. | `variant="accent"` or `"surface"`. |
| `PageContainer` | The shared site width, page gutters, and brand font. | Native div attributes and a layout-only `className`. |

```tsx
import { Button, Card, Heading, Text } from "@/components/ui";

export function EventSummary() {
  return (
    <Card className="flex flex-col gap-lg">
      <Heading as="h2" variant="heading-m">Upcoming events</Heading>
      <Text className="text-ink-secondary">
        Browse the club's event lineup.
      </Text>
      <Button href="/events">View events</Button>
    </Card>
  );
}
```

The example uses existing routes and illustrative UI copy; keep actual event and
member details in the dedicated content/data files.

`Button` without `href` renders a native button and defaults to `type="button"`.
Set `type="submit"` inside a form. With an internal `href`, it renders a Next.js
link; external links default to a new tab. Set native `target`/`rel` explicitly
when a different behavior is needed. Only native buttons support `disabled`.

```tsx
<Button type="submit" disabled={saving}>Save profile</Button>
<Button href="/events" variant="outline">Browse events</Button>
```

`outline` is intended for dark surfaces; choose a variant that fits the surface.
Use `className` for layout such as alignment or width. Add a named variant to the
component when the design calls for a recurring appearance change instead of
overriding its colors, font, and padding in each caller.

## Accessible fields and errors

```tsx
import { TextField } from "@/components/ui";

<TextField
  id="profile-display-name"
  name="displayName"
  label="Display name"
  autoComplete="name"
  required
  hint="Choose the name other members will see."
/>
```

Use a stable, page-unique `id`. `TextField` connects its label, hint, and error to
the input and sets `aria-invalid` for an error. `hideLabel` keeps an accessible
label while hiding it visually; a placeholder is not a replacement for a label.
Handlers such as `onChange` belong in a Client Component. Keep server validation
and authorization separate from the field's presentation.

## Use the existing design tokens

Tailwind reads the CSS theme directly. Examples:

| Category | Examples |
| --- | --- |
| Surfaces and text | `bg-canvas`, `bg-surface`, `bg-inverse`, `text-ink`, `text-ink-secondary`, `text-ink-inverse`. |
| Accent | `text-accent`, `border-accent`, `focus-visible:outline-accent`. |
| Fonts | `font-brand` (Poppins), `font-body` (Roboto Flex), `font-editorial` (Sansation), `font-ui` (Inter). |
| Spacing | `gap-xs` (8px), `gap-lg` (24px), `px-xl` (32px), `py-xxxl` (64px). |
| Radii | `rounded-thumbnail` (12px), `rounded-field` (16px), `rounded-card` (20px), `rounded-panel` (24px), `rounded-pill` (999px). |
| Layout | `max-w-site` (1440px); `PageContainer` supplies the existing responsive gutters. |
| Breakpoints | `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px). |

Existing typography is preserved, including its fluid `clamp()` sizes. The
`text-heading-xl`, `text-body-m`, and related theme utilities include their
associated weight, line height, and letter spacing. Prefer `Heading` and `Text`,
which also select the brand font. The semantic heading level does not determine
the visual size: use an appropriate `as` and an explicit visual `variant`.

Do not replace these with approximate defaults such as `font-sans` or `text-4xl`.
Do not introduce new hex colors or font definitions in a feature. If a reusable
design value is missing, add a well-named token after checking the existing design.
Genuine one-off artwork measurements can remain local; not every coordinate is a
design-system token.

For remaining scoped CSS, reference the same variables:

```css
.decoration {
  background: var(--color-accent);
  border-radius: var(--radius-panel);
}
```

## Keep one primary styling convention

Use Tailwind and shared primitives for new components and for ordinary layout,
spacing, colors, and typography. CSS Modules remain appropriate for keyframes,
intricate decorative selectors, third-party overrides, and art-directed effects.
The existing page-specific modules are transitional; when substantially editing
a section, move its ordinary styles to Tailwind and remove the unused CSS rules.
There is no separate styling convention for the portal versus the public site.

- Keep complete class names in source. Use explicit variant maps instead of
  constructing names such as `bg-${color}`, which Tailwind cannot reliably detect.
- Use inline styles for runtime values such as image crop positions or animation
  durations. Reference CSS variables for shared colors; do not duplicate token values.
- Keep page compositions small and feature-specific components close to their
  feature. Move a component into `components/ui/` once its responsibility is shared.
- Do not wrap every HTML element in a new component. Extract repeated behavior or
  a recurring design decision, not merely a shorter class list.
- Preserve visible focus, native keyboard behavior, meaningful labels, and
  reduced-motion support. New hover animations need a reduced-motion treatment.
  Use `usePrefersReducedMotion` from `lib/use-prefers-reduced-motion` for motion
  decisions in rendered JSX; it keeps the server and initial client render aligned.
- Tailwind Preflight is intentionally disabled. Do not enable a global reset as
  incidental cleanup; older poster pages rely on browser defaults.

## Review and validation

Before opening a PR:

```sh
npm run lint
npm run typecheck
npm run build
npm test
```

Install the browser once with `npx playwright install chromium`. Browser tests
mock newsletter, social, and analytics requests and check desktop/mobile flows.
For visual changes, also compare the affected pages at mobile, tablet, and desktop
widths with Google Fonts loaded. Check font family, size, weight, tracking, line
height, spacing, focus, images, and horizontal overflow. Shared-token changes can
affect every page, including existing CSS Modules, so review all affected uses.

Keep the legacy app as the reference during migration. Do not change production
hosting or the legacy deployment as part of a styling PR.
