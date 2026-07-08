---
version: alpha
name: Mio möbler

colors:
  # Monochrome chrome — true neutral grayscale (chroma 0). Black is the single
  # accent: it carries primary, ring, and the accent tonal step. `sale` (warm
  # red-orange) is reserved for discounted prices and rea; `destructive` stays
  # red for form errors. Light mode only — no dark variant.
  background: "oklch(0.99 0 0)"
  foreground: "oklch(0.18 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.18 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.18 0 0)"
  primary: "oklch(0.18 0 0)"
  primary-foreground: "oklch(0.99 0 0)"
  secondary: "oklch(0.95 0 0)"
  secondary-foreground: "oklch(0.25 0 0)"
  muted: "oklch(0.96 0 0)"
  muted-foreground: "oklch(0.50 0 0)"
  accent: "oklch(0.95 0 0)"
  accent-foreground: "oklch(0.20 0 0)"
  destructive: "oklch(0.55 0.22 27)"
  destructive-foreground: "oklch(0.99 0 0)"
  sale: "oklch(0.58 0.19 38)"
  sale-foreground: "oklch(0.99 0 0)"
  border: "oklch(0.90 0 0)"
  input: "oklch(0.90 0 0)"
  ring: "oklch(0.20 0 0)"

# Bulldog sets all titles and headings; Source Sans Pro sets body and supporting
# text. No monospace family. A global letter-spacing of -0.02em (-2%) applies to
# every type token. Titles and headings use sentence case: only the first letter
# is uppercase, the rest is lowercase. Exposed as --font-heading / --font-body
# CSS variables.
fonts:
  heading: "Bulldog"
  body: "Source Sans Pro"

typography:
  display-hero:
    fontFamily: Bulldog
    fontSize: "clamp(3rem, 9vw, 6rem)"
    fontWeight: "700"
    lineHeight: "0.85"
    letterSpacing: "-0.02em"
    textTransform: none
  display-lg:
    fontFamily: Bulldog
    fontSize: "clamp(2rem, 6vw, 4rem)"
    fontWeight: "700"
    lineHeight: "0.85"
    letterSpacing: "-0.02em"
    textTransform: none
  display-md:
    fontFamily: Bulldog
    fontSize: "clamp(1.5rem, 4vw, 2.5rem)"
    fontWeight: "700"
    lineHeight: "0.85"
    letterSpacing: "-0.02em"
    textTransform: none
  display-sm:
    fontFamily: Bulldog
    fontSize: "clamp(1.25rem, 3vw, 2rem)"
    fontWeight: "700"
    lineHeight: "0.85"
    letterSpacing: "-0.02em"
    textTransform: none
  h1:
    fontFamily: Bulldog
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: "400"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Bulldog
    fontSize: "1.875rem"
    fontWeight: "400"
    lineHeight: "2.25rem"
    letterSpacing: "-0.02em"
  h3:
    fontFamily: Bulldog
    fontSize: "1.5rem"
    fontWeight: "400"
    lineHeight: "2rem"
    letterSpacing: "-0.02em"
  h4:
    fontFamily: Bulldog
    fontSize: "1.25rem"
    fontWeight: "400"
    lineHeight: "1.75rem"
    letterSpacing: "-0.02em"
  lead:
    fontFamily: Source Sans Pro
    fontSize: "1.25rem"
    fontWeight: "400"
    lineHeight: "1.75rem"
    letterSpacing: "-0.02em"
  body:
    fontFamily: Source Sans Pro
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.5rem"
    letterSpacing: "-0.02em"
  small:
    fontFamily: Source Sans Pro
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.25rem"
    letterSpacing: "-0.02em"
  caption:
    fontFamily: Source Sans Pro
    fontSize: "0.75rem"
    fontWeight: "400"
    lineHeight: "1rem"
    letterSpacing: "-0.02em"
  eyebrow:
    fontFamily: Source Sans Pro
    fontSize: "0.75rem"
    fontWeight: "400"
    lineHeight: "1rem"
    letterSpacing: "-0.02em"
    textTransform: uppercase

# Stram radie. Buttons get a fixed 4px corner; inputs and everything else
# (cards, containers, badges, images) are square (0). The sm–2xl scale below is
# kept for future use but no component references it by default.
rounded:
  sm: "0.625rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
  button: "0.25rem"
  input: "0"

"rounded-desktop":
  sm: "1rem"
  md: "1.25rem"
  lg: "1.875rem"
  xl: "2.5rem"
  "2xl": "3.75rem"

spacing:
  unit: "0.25rem"   # 4px base grid — every value is a multiple of this
  # Foundational scale — 4px steps. Use the nearest step; never arbitrary values.
  scale:
    "4": "0.25rem"
    "8": "0.5rem"
    "12": "0.75rem"
    "16": "1rem"
    "24": "1.5rem"
    "32": "2rem"
    "40": "2.5rem"
    "48": "3rem"
    "64": "4rem"
    "80": "5rem"
    "96": "6rem"
    "128": "8rem"
  # Semantic tokens — layout-level gaps, each maps onto a step in the scale above.
  # screen-edge is responsive via grid.margin (8px mobile → 24px desktop); the
  # value here is the desktop target.
  between-cards: "0.75rem"
  between-chips: "0.25rem"
  screen-edge: "1.5rem"
  component-default: "1rem"
  between-text: "0.5rem"
  text-to-component: "1rem"
  content-to-button: "1.5rem"
  between-sections: "3rem"
  hero: "6rem"

# Custom Tailwind breakpoints (min-width). Base (no prefix) covers 320–479px.
# Columns and the radius scale both switch at md (768px).
breakpoints:
  sm: "480px"
  md: "768px"
  lg: "992px"
  xl: "1200px"
  "2xl": "1440px"
  "3xl": "1920px"   # matches the grid max-width — content caps here, margins grow beyond

# 12-col desktop / 6-col mobile, centred at max 1920px — content stays fixed and
# the side margins grow once the viewport exceeds the cap. Margin (page edge
# padding) is two-step: 8px mobile, 24px from md up. Gutter scales per breakpoint.
grid:
  max-width: "1920px"
  columns-mobile: 6
  columns-desktop: 12
  margin:           # horizontal page padding
    base: "8px"     # px-2   (320–767)
    md: "24px"      # px-6   (768+)
  gutter:           # column gap
    base: "12px"    # gap-3
    md: "16px"      # gap-4
    lg: "28px"      # gap-7
    xl: "32px"      # gap-8

# Snappy-first motion. All durations stay under 400ms. ease-spring adds a
# slight overshoot for interactive, gesture-driven elements.
motion:
  duration-fast: "150ms"
  duration-base: "250ms"
  duration-slow: "350ms"
  ease-default: "cubic-bezier(0.4, 0, 0.2, 1)"
  ease-spring: "cubic-bezier(0.175, 0.885, 0.32, 1.1)"

# One size ladder for all controls (buttons + inputs). A default button and a
# default input share the 2.5rem height so they align in a row. Heights are the
# contract; implement via each component's `size` variant — don't duplicate per pixel.
control-sizes:
  sm:
    height: "2rem"      # 32px — h-8
    paddingX: "0.75rem" # px-3
  default:
    height: "2.5rem"    # 40px — h-10
    paddingX: "1rem"    # px-4
  lg:
    height: "3rem"      # 48px — h-12
    paddingX: "1.5rem"  # px-6

# Focus ring shown on :focus-visible for every interactive element. A 2px ring in
# the ring color, offset 2px from the element so it reads on any surface.
focus-ring:
  width: "2px"
  offset: "2px"
  color: "{colors.ring}"

# Interaction states come from opacity, not extra color tokens — one rule holds on
# every fill and every intent. (See tokens.md → Lightness model.)
states:
  hover: "90%"      # fill opacity on hover — e.g. bg-primary/90
  active: "80%"     # fill opacity on press
  disabled: "50%"   # opacity-50, plus not-allowed cursor

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.button}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.button}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "0"
    padding: "1.5rem"
  badge:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "0"
    padding: "0.25rem 0.5rem"
  input:
    backgroundColor: "{colors.background}"
    borderColor: "{colors.border}"
    rounded: "{rounded.input}"
    focusRing: "{colors.ring}"
---

# Mio möbler — Design System

## Overview

A complete, machine-readable design token snapshot (YAML above) — colors, fonts, typography, radius, spacing, breakpoints, grid, motion, and component tokens. The values are framework-agnostic; this foundation wires them up with Tailwind CSS v4 and Bulldog + Source Sans Pro, but the tokens port to any stack.

This is the Mio möbler adaptation of the oh.design foundation: a monochrome furniture e-commerce system where black is the single accent, with one reserved warm color for sale pricing.

All token values live in this file (YAML above). The implementation lives in `app/globals.css` — populate it from this file. Per-concern docs (`tokens.md`, `radius.md`, `typography.md`, `spacing.md`) document the rationale and rules; they do not repeat values.

**When you change a token value: update the YAML above, then update `app/globals.css`.**

---

## Colors

Monochrome chrome built in oklch. The neutrals are a **true grayscale** (chroma 0) so nothing imposes a tint — surfaces, text, and borders are pure gray steps from near-white to near-black. **Black is the only accent**: it carries `primary` (all primary buttons and selected states), `ring`, and the neutral `accent` step.

Two colors break the grayscale, each with a single job:
- **`sale`** (`oklch(0.58 0.19 38)`, from `#D34308`) — reserved for discounted prices and rea. Do not use it for general emphasis.
- **`destructive`** — red, reserved for form errors and destructive actions.

**Light mode only** — there is no dark variant. Semantic, role-based naming: `background`, `foreground`, `card`, `primary`, `muted`, `accent`, `sale`, `destructive`, `border`, `ring` — plus `-foreground` variants for text on colored surfaces.

See `tokens.md` for the CSS structure, Tailwind mapping, and allowed classes.

---

## Typography

Two font families (`fonts` above): **Bulldog** for all titles and headings (Display tier + h1–h4), **Source Sans Pro** for body and supporting text (lead, body, small, caption, eyebrow). No monospace family. Exposed as `--font-heading` / `--font-body` CSS variables — no hardcoded font stacks in components.

A global **letter-spacing of -0.02em (-2%)** applies to every type token, including the Display and eyebrow tiers.

The scale has three tiers: Display (bold, fluid clamp — heroes and campaign moments), Heading (normal weight, editorial), and Text variants (lead, body, small, caption, eyebrow).

Titlar och rubriker ska inte skrivas i CAPS. Använd vanlig meningskapitalisering: första bokstaven versal, resten gemener.

Always use `<Heading>`, `<Text>`, `<Eyebrow>` — never raw HTML tags with manual classes. See `typography.md` for the component API, scale rationale, and rules.

---

## Layout

12-column grid on desktop, 6-column on mobile, centred at **max 1920px** — the content width is fixed and the side margins grow once the viewport exceeds the cap. Breakpoints are the foundation defaults plus an extra-large step (sm 480 / md 768 / lg 992 / xl 1200 / 2xl 1440 / 3xl 1920); the `3xl` step matches the max-width so you can target the point where the content stops growing. Columns switch from 6 to 12 at md.

The page side margin is **two-step: 8px on mobile, 24px from md up** (not the foundation's five-step ramp). See `grid.md` for the `col-span` math and per-row patterns.

Spacing has two layers: a foundational 4px scale (`spacing.scale`) and semantic tokens (`spacing.between-*` etc.) for section, block, and layout-level gaps. Component padding is the component's own concern — never use semantic tokens inside components. See `spacing.md` for the full two-layer system.

---

## Elevation & Depth

No shadow scale is currently defined. Depth is communicated through oklch lightness contrast between `background`, `card`, and `muted` surfaces.

When elevation is needed beyond surface contrast, use `backdrop-filter: blur()` rather than `box-shadow`.

---

## Motion

Snappy first — most interactions should feel immediate. Three duration tokens (`duration-fast` 150ms, `duration-base` 250ms, `duration-slow` 350ms) and two easing tokens (`ease-default` for standard transitions, `ease-spring` for interactive, gesture-driven elements with a slight overshoot). All durations stay under 400ms.

Animate only `transform` and `opacity`, never layout properties. Always honor `prefers-reduced-motion`. See `motion.md` for principles and `transitions.md` for page and overlay patterns.

---

## Shapes

Deliberately square. **Buttons** carry a fixed **4px** corner; **inputs** and everything else (cards, containers, badges, images) are **square (0)**. The `sm`–`2xl` radius scale is kept in the YAML for future use, but no component references it by default — reach for it only when a specific surface calls for rounding.

See `radius.md` for per-component values and the nesting rule.

---

## Components

The `components` block above gives ready-to-use token values per element (background, text, radius, padding), all referencing the tokens above.

Controls (buttons, inputs) follow one size ladder — `sm` 32px / `default` 40px / `lg` 48px (see `control-sizes` above). A default button and a default input share the 40px height so they line up in a form row.

Typography components (`<Heading>`, `<Text>`, `<Eyebrow>`) are custom text components, not generic primitives. See `styleguide.md` for the full component inventory and style guide structure.

Interaction is driven by tokens, not per-component colors: states come from opacity (`states` — hover 90%, active 80%, disabled 50%), and every interactive element shows the `focus-ring` on `:focus-visible`. Never remove a focus outline without a visible replacement.

Icons use **Lucide** (`lucide-react`). Size icons via the component's `size` prop, not `w-/h-` utility classes.

---

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Token classes: `text-foreground`, `bg-card` | Hardcode: `#hex`, `oklch()`, `rgb()` |
| `bg-sale` only on discounted prices / rea | `bg-sale` for general emphasis |
| `<Heading>`, `<Text>`, `<Eyebrow>` components | Raw `<h1>`, `<p>` with manual classes |
| `col-span-*` with explicit column math | `grid-cols-2` or `grid-cols-3` in 12-col layout |
| Step through breakpoints (1→2→3) | Jump from 1 to 3 items per row |
| `rounded-button` on buttons, square elsewhere | Arbitrary `rounded-[7px]` |
| Size icons via the `size` prop | `className="w-5 h-5"` for icon sizing |
| Nearest 4px spacing step | Arbitrary `p-[13px]` |
| Ask before building if unsure | Guess and improvise |
