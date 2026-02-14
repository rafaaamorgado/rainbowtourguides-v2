---
doc_id: 04-ui-system
owner: Product + Engineering (TBD)
reviewers:
  - Cofounders (TBD)
status: Draft (AS-IS)
last_updated: 2026-02-14
as_is_snapshot_date: 2026-02-14
---

# Rainbow Tour Guides v2 UI System (AS-IS)

## 1) UI principles (as evidenced by current UI/copy)

1. Safety and trust are foregrounded.
- Repeated trust language: "Verified", "Safe, inclusive, authentic", "vetted locals", and confirmation-oriented flows across marketing and booking surfaces.

2. LGBTQ+ inclusion is explicit, not implicit.
- Core copy consistently references LGBTQ+ travelers and queer-friendly experiences on public pages and CTAs.

3. Warm premium aesthetic over utilitarian dashboards.
- Editorial display typography, soft/warm surfaces, gradients, and rounded corners are used across consumer and dashboard surfaces.

4. Action-first dashboards.
- Traveler/guide/admin areas prioritize quick status scanning and direct actions (tabs, badges, sticky action cards, request buttons).

5. Progressive disclosure for detail-heavy tasks.
- Primary pages keep top-level summaries, with deeper details in dedicated pages, sticky side panels, and modals.

6. State clarity is built into UI.
- Systematically uses loading/empty/error/status states (`Skeleton`, `EmptyState`, `ErrorState`, status badges, approval/review banners).

## 2) Token source of truth

### 2.1 Where tokens live

1. Global CSS variables (semantic tokens): `app/globals.css`
- `:root` and `.dark` define semantic color and radius values.

2. Tailwind theme mappings and fixed palette extensions: `tailwind.config.ts`
- Semantic classes (`bg-background`, `text-foreground`, etc.) map to CSS variables.
- Fixed brand/palette values are defined directly in Tailwind `extend.colors`.

3. App fonts wired in root layout: `app/layout.tsx`
- `--font-manrope` and `--font-display` are registered and consumed via Tailwind font families.

### 2.2 Color tokens (actual values)

Semantic variables in `app/globals.css`:

| Token | Light | Dark |
|---|---|---|
| `--background` | `40 20% 98%` | `240 10% 3.9%` |
| `--foreground` | `240 10% 3.9%` | `0 0% 98%` |
| `--card` | `40 20% 99%` | `240 10% 3.9%` |
| `--card-foreground` | `240 10% 3.9%` | `0 0% 98%` |
| `--popover` | `40 20% 99%` | `240 10% 3.9%` |
| `--popover-foreground` | `240 10% 3.9%` | `0 0% 98%` |
| `--primary` | `0 84% 60%` | `0 84% 60%` |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` |
| `--secondary` | `40 10% 95%` | `240 3.7% 15.9%` |
| `--secondary-foreground` | `240 5.9% 10%` | `0 0% 98%` |
| `--muted` | `40 10% 95%` | `240 3.7% 15.9%` |
| `--muted-foreground` | `240 3.8% 46.1%` | `240 5% 64.9%` |
| `--accent` | `316 73% 67%` | `316 73% 67%` |
| `--accent-foreground` | `0 0% 100%` | `0 0% 100%` |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` |
| `--destructive-foreground` | `0 0% 100%` | `0 85.7% 97.3%` |
| `--border` | `40 8% 88%` | `240 3.7% 15.9%` |
| `--input` | `40 8% 88%` | `240 3.7% 15.9%` |
| `--ring` | `0 84% 60%` | `0 84% 60%` |

Surface variables:
- `--surface-warm: 40 25% 96%`
- `--surface-pride-amber: 40 85% 94%`
- `--surface-pride-lilac: 280 60% 95%`
- `--surface-pride-mint: 155 50% 94%`

Fixed Tailwind palette extensions in `tailwind.config.ts`:
- `brand.DEFAULT: #ff3a3a`, `brand.dark: #c92a2a`, `brand.soft: #ffe4e4`
- `ink.DEFAULT: #111827`, `ink.soft: #4b5563`
- `panel.light: #ffffff`, `panel.dark: #020617`
- `pride.amber: #fcd79b`, `pride.lilac: #e2d2ff`, `pride.mint: #c9f2df`

### 2.3 Typography tokens

Configured families (`tailwind.config.ts` + `app/layout.tsx`):
- `font-sans` / `font-body`: `var(--font-body, var(--font-manrope))` + Tailwind sans fallback
- `font-display` / `font-serif`: `var(--font-display)` + `Georgia, serif`
- `font-mono`: `var(--font-geist-mono)` + Tailwind mono fallback

AS-IS usage pattern:
- Display/headlines: `font-display` (Fraunces)
- Body/UI text: default sans body stack (Manrope)

### 2.4 Spacing tokens

AS-IS:
- No custom numeric spacing scale is defined in Tailwind theme.
- Project uses Tailwind default spacing scale directly (`p-4`, `gap-6`, `py-16`, etc.).
- Container token is customized:
  - `center: true`
  - `padding: 2rem`
  - `2xl: 1400px`

### 2.5 Radii tokens

- `--radius: 0.75rem` (`app/globals.css`)
- Mapped in Tailwind:
  - `rounded-lg = var(--radius)`
  - `rounded-md = calc(var(--radius) - 2px)`
  - `rounded-sm = calc(var(--radius) - 4px)`
- Additional explicit sizes:
  - `2xl: 1.5rem`, `3xl: 2rem`, `4xl: 2.5rem`

### 2.6 Shadow tokens

Custom shadows in `tailwind.config.ts`:
- `shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.05)`
- `shadow-float: 0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)`
- `shadow-warm-sm: 0 1px 3px 0 rgba(20, 15, 10, 0.06)`
- `shadow-warm-md: 0 4px 16px -2px rgba(20, 15, 10, 0.08)`
- `shadow-warm-lg: 0 12px 40px -8px rgba(20, 15, 10, 0.12)`
- `shadow-editorial: 0 24px 60px -20px rgba(20, 15, 10, 0.15)`

## 3) Theming (AS-IS)

### 3.1 Current mechanism

1. Tailwind dark mode strategy is class-based.
- `darkMode: ['class']` in `tailwind.config.ts`.

2. Theme values are CSS-variable driven for semantic tokens.
- `.dark` overrides semantic variables in `app/globals.css`.

3. No runtime theme switcher is wired in app shell.
- No `ThemeProvider`/`next-themes`/`useTheme` implementation found in active app shell.

### 3.2 Practical behavior today

1. Semantic-token-based components can adapt when `.dark` exists.
2. Many surfaces also use hardcoded utility colors (`bg-white`, `bg-slate-50`, `border-slate-200`), so dark mode coverage is partial.

### 3.3 Safe extension path (fits current architecture)

1. Add any new semantic token to both `:root` and `.dark` in `app/globals.css`.
2. Map it in `tailwind.config.ts` under `theme.extend.colors` (or relevant token group).
3. Consume it via semantic classes (`bg-*`, `text-*`, `border-*`) instead of per-component hex/slate values.
4. If adding theme switching, keep the current class strategy and toggle `.dark` on `<html>`.

## 4) Component rules (AS-IS)

### 4.1 Library conventions

1. `components.json` indicates shadcn settings (`style: new-york`, `cssVariables: true`) with Tailwind + global CSS.
2. `components/ui/*` is a compatibility layer:
- Many primitives wrap HeroUI (`Button`, `Input`, `Textarea`, `Select`, `Card`, `Avatar`, etc.).
- Some remain shadcn/radix-style (`Form`, `Table`, `Tabs`, `Popover`, `Calendar`, `Label`, `Alert`).
3. Feature code sometimes imports HeroUI directly for advanced APIs (especially `Modal`, `addToast`, dropdowns).
4. `cn()` (`clsx` + `tailwind-merge`) is the standard class merge helper.

### 4.2 Buttons

AS-IS rules:
1. Use `@/components/ui/button` by default.
2. Available project-facing variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
3. Wrapper maps variants to HeroUI internally (`outline -> bordered`, `default -> solid`, etc.).
4. `asChild` is present for backward compatibility but documented as ignored in wrapper comments.

### 4.3 Forms

AS-IS rules:
1. Standard field primitives: `Input`, `Textarea`, `Select`, `DatePicker`, `TimeInput`, `Checkbox`, `Switch` from `components/ui`.
2. Form state commonly uses React Hook Form + `components/ui/form` (`FormField`, `FormItem`, `FormLabel`, `FormMessage`).
3. Labels/captions frequently use uppercase micro-label style (`text-xs`, `uppercase`, `tracking-wider`) in booking/filter forms.
4. Select supports both simplified `options` API and shadcn-style composition compatibility.

### 4.4 Cards

AS-IS rules:
1. Use `Card`, `CardHeader`, `CardContent`/`CardBody`, `CardFooter` from `@/components/ui/card`.
2. Base card style defaults to `border border-border`; page-level components add radius/shadow per surface.

### 4.5 Modals

AS-IS rules:
1. Transactional/feature modals commonly use HeroUI `Modal` directly (`CancelBookingModal`, booking mobile sheet, availability success, media crop).
2. Confirm dialogs also use custom `@/components/ui/alert-dialog` implementation (overlay + content render).
3. Modal styling patterns: rounded large corners, soft borders, and explicit action buttons in footer.

### 4.6 Toasts

AS-IS rules:
1. Root provider: HeroUI `ToastProvider` in `app/providers.tsx`.
2. Most newer flows trigger toasts via HeroUI `addToast`.
3. Legacy custom toast (`components/ui/toast.tsx`) still exists and is used in some paths.

### 4.7 Tables

AS-IS rules:
1. Use semantic table wrappers from `@/components/ui/table`.
2. Admin lists follow consistent pattern: rounded container + header row + inline actions/badges.

### 4.8 Naming conventions (current state)

1. UI primitives mostly use kebab-case filenames with PascalCase exports (e.g., `button.tsx` -> `Button`).
2. Existing exceptions include PascalCase filenames such as `components/ui/CityCard.tsx` and `components/cards/GuideCard.tsx`.
3. Status and domain-specific display rules are centralized where available (e.g., `lib/booking-status.ts`).

### 4.9 Do / Don’t (AS-IS guardrails)

Do:
1. Prefer `@/components/ui/*` wrappers before direct HeroUI imports.
2. Use semantic token classes (`bg-background`, `text-foreground`, `border-border`) for theme-aware surfaces.
3. Use `cn()` for class composition and overrides.
4. Use existing status helpers (`getStatusColor`, `getStatusLabel`) for booking statuses.
5. Include explicit loading/empty/error/status states for data-driven surfaces.

Don’t:
1. Assume shadcn `asChild` behavior works through `Button` wrapper (it is explicitly marked ignored).
2. Mix new screen-level components with one-off hardcoded palettes when token classes already exist.
3. Create a third toast pattern; keep to existing two pathways unless consolidation is intentional.
4. Re-implement tables/forms from scratch when current wrappers already cover accessibility/state hooks.

## 5) Core page/layout patterns (AS-IS)

### 5.1 Global shell

1. Root app shell is fixed-header + content + conditional footer.
2. Dashboard routes (`/traveler/*`, `/guide/*`, `/admin/*`) hide the public footer.
3. Traveler/guide/admin layouts use fixed left sidebars (`lg:pl-64`) and max-width content containers.

### 5.2 Visitor browsing (cities / city / guide)

1. `/cities`
- Hero heading + supporting copy + search bar + city image-card grid.
- Cards use cinematic image overlays and destination metadata.

2. `/cities/[slug]`
- Two major states:
  - Existing city: `CityHero` + `CityFilters` (search/theme/duration) + guide card grid.
  - Missing city: `CityComingSoon` retention page with notify CTA + alternate city exploration.

3. `/guides`
- Hero/search at top, then curated sections (`FilteredView`, top-rated guides, new guides, new destinations, popular destinations).
- Uses repeated content pattern: section heading + support copy + responsive card grid.

4. `/guides/[slug]`
- 3-column desktop split: primary content (`GuideHero`, about, gallery, reviews) + sticky booking side card.
- Mobile includes fixed bottom booking CTA opening a full-width bottom modal sheet.

### 5.3 Traveler booking flow UI

1. Request entry point
- Booking form in guide profile side card (`components/guide/booking-card.tsx`): duration/date/time/travelers/location/notes + price breakdown.

2. Booking list
- `/traveler/bookings` uses tabbed list (`All`, `Upcoming`, `Pending`, `Past`) with status badges and row-level actions.
- Cancel action uses confirm dialog.

3. Booking detail
- `/traveler/bookings/[id]` uses two-column content + sticky action card.
- Shows tour metadata, contact block, and message action when status allows.

4. Payment success
- `/traveler/bookings/success` confirms payment status with summary card + next actions.

### 5.4 Guide dashboard / requests

1. `/guide/dashboard`
- Status banner (pending/draft/rejected/approved) + KPI stat cards + tabbed bookings timeline.

2. `/guide/bookings`
- Tabbed buckets (`Requests`, `Upcoming`, `Past`, `Cancelled`) with inline request actions.
- Pending request cards expose `Accept` and `Decline` directly.

3. `/guide/bookings/[id]`
- Detailed request view + sticky action card.
- Action card switches between accept/decline actions and messaging CTA based on status.

### 5.5 Admin surfaces

1. Layout
- Left admin sidebar + sticky top search bar in layout shell.

2. `/admin`
- Stat cards grid + placeholder secondary panels.

3. `/admin/guides`
- Tab-filtered guide verification table with status badges and review/public-profile actions.

4. `/admin/guides/[id]`
- Detailed review page with sectioned data blocks, approve/reject, suspend/restore controls.

5. `/admin/bookings`
- Table view with inline status override control and CSV export action.

6. `/admin/users`
- User table + action dropdown.

7. Placeholder screens
- `/admin/reviews`, `/admin/content/blog` are empty-state shells.

## 6) Accessibility baseline (AS-IS + gaps)

### 6.1 Implemented baseline

1. Global skip link to main content exists in root layout.
2. Reduced-motion media query is implemented globally.
3. Form helper primitives (`components/ui/form.tsx`) wire `aria-invalid` and description/message relationships.
4. Mobile nav toggle in site header includes `aria-label` and `aria-expanded`.
5. Many inputs/selects/date controls expose `aria-label`/`aria-labelledby` pathways.
6. Semantic table markup is used in admin table components.

### 6.2 Observed gaps

1. Custom `AlertDialog` is visual-only and does not implement full dialog accessibility behavior (no explicit `role="dialog"`, `aria-modal`, focus trap, or keyboard escape handling).
2. `Button` compatibility note says `asChild` is ignored, but many call sites still use `asChild` with links; this can produce invalid nested interactive semantics.
3. Toast behavior is split between HeroUI toasts and a custom toast component; aria-live/announcer behavior is not centralized in one pattern.
4. Dark mode token definitions exist, but many pages hardcode light-only utility colors (`bg-white`, `bg-slate-*`), so dark theme contrast/completeness is inconsistent.
5. Some icon-only controls rely on `title`/visual context instead of explicit `aria-label`.

## 7) “Done means” UI checklist (AS-IS)

1. Uses existing `@/components/ui/*` primitives unless a documented exception is required.
2. Uses semantic token classes where applicable (`background/foreground/border/input/ring` families).
3. Matches existing typography system (`font-display` for display, sans/body for UI text).
4. Preserves responsive behavior across mobile and desktop for the target surface.
5. Includes explicit loading/empty/error states for async data.
6. Uses existing status badges/helpers for booking/guide status visuals.
7. Uses existing spacing/radius/shadow language (rounded-xl/2xl/3xl, warm/editorial shadows) rather than ad hoc styling.
8. Keeps actions in consistent placement (header CTA, card footer CTA, sticky action card where pattern exists).
9. Verifies keyboard interaction for forms, menus, tabs, and modal/drawer flows used by the screen.
10. Verifies labels and ARIA wiring for all interactive controls.
11. Avoids introducing new one-off toast/modal systems.
12. Does not regress dashboard shell behavior (sidebar + content offsets + footer hiding rules).
13. If adding tokens, updates both `:root` and `.dark`, plus Tailwind mappings.
14. If using direct HeroUI imports, confirms no equivalent project wrapper already exists.
15. Keeps copy tone aligned with current product voice (safe, inclusive, clear, action-oriented).

## 8) Evidence index (file paths)

### Token + theme source
- `tailwind.config.ts`
- `app/globals.css`
- `components.json`
- `app/layout.tsx`

### UI primitive layer
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/card.tsx`
- `components/ui/form.tsx`
- `components/ui/table.tsx`
- `components/ui/tabs.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/toast.tsx`
- `components/ui/badge.tsx`
- `components/ui/date-picker.tsx`
- `components/ui/calendar.tsx`
- `components/ui/README-COMPONENTS.md`

### App providers and shell
- `app/providers.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `components/conditional-footer.tsx`
- `app/traveler/layout.tsx`
- `app/guide/layout.tsx`
- `app/admin/layout.tsx`
- `app/traveler/sidebar.tsx`
- `app/guide/sidebar.tsx`
- `app/admin/sidebar.tsx`
- `components/shells/SidebarNav.tsx`

### Visitor surfaces
- `app/cities/page.tsx`
- `app/cities/cities-content.tsx`
- `app/cities/[slug]/page.tsx`
- `components/city/city-hero.tsx`
- `components/city/city-filters.tsx`
- `components/city/city-coming-soon.tsx`
- `app/guides/page.tsx`
- `app/guides/[slug]/page.tsx`
- `components/guide/booking-card.tsx`
- `components/cards/GuideCard.tsx`
- `components/city/guide-card.tsx`

### Traveler booking flow
- `app/traveler/bookings/page.tsx`
- `app/traveler/bookings/[id]/page.tsx`
- `app/traveler/bookings/success/page.tsx`
- `components/booking/CancelBookingModal.tsx`
- `components/booking/BookingDetailsCard.tsx`
- `components/bookings/BookingStatusBadge.tsx`
- `lib/booking-status.ts`

### Guide dashboard and requests
- `app/guide/dashboard/page.tsx`
- `app/guide/bookings/page.tsx`
- `app/guide/bookings/[id]/page.tsx`
- `app/guide/messages/page.tsx`

### Admin surfaces
- `app/admin/page.tsx`
- `app/admin/guides/page.tsx`
- `app/admin/guides/[id]/page.tsx`
- `app/admin/bookings/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/reviews/page.tsx`
- `app/admin/content/blog/page.tsx`
- `components/admin/AdminGuidesTable.tsx`
- `components/admin/AdminGuideReview.tsx`
- `components/admin/BookingStatusOverride.tsx`
- `components/admin/AdminSearchBar.tsx`
- `components/admin/UserActions.tsx`
- `components/admin/ExportCsvButton.tsx`

### Existing style/system docs found
- `README.md`
- `app/cities/[slug]/README.md`
- `app/guides/README.md`
- `app/guides/[slug]/README.md`
- `app/guide/PAGE-README.md`
- `app/guide/README.md`
- `app/guide/onboarding/README.md`
- `app/traveler/PAGE-README.md`
- `app/traveler/README.md`
- `components/home/README-HERO-SEARCH.md`
