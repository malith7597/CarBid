# CarBid Design System — Web + React Native

**Version:** 0.1
**Date:** 2026-08-04
**Scope:** shared token architecture, colour palette, typography, component inventory and responsive strategy for two clients — a Vite/React web app and an Expo/React Native app for iOS and Android.
**Sources:** the 18 Stitch mobile screens (`projects/16486941298907743014`), the 19 desktop web translations (`design/web/`), and the requirements in [`REQUIREMENTS.md`](REQUIREMENTS.md).

---

## 1. What this document is for

Two clients must look like one product. That only holds if colour, type, spacing and state
semantics come from a **single source of truth** that neither platform can quietly fork. This
document specifies that source, the constraints that shaped it, and the component inventory each
platform needs.

Everything here is derived from the designs by extraction, not by preference. Where a value was
changed, the reason is stated and the original recorded.

### 1.1 Two clients, one system

| | Web | Mobile |
|---|---|---|
| Framework | Vite + React 19 + TypeScript | Expo (React Native) + TypeScript |
| Styling | Tailwind CSS 3.4 + shadcn/ui | Tailwind CSS 3.4 via **NativeWind v4** |
| Component library | shadcn/ui (Radix primitives) | **React Native Reusables** — see §8.1 |
| Theme mechanism | CSS variables + `.dark` class (§6.1) | NativeWind runtime `dark:` variant (§6.2) |
| Targets | 390px → 1440px, responsive | iOS 15+, Android 8+ |
| Token consumption | generated CSS variables | TypeScript objects, imported directly |

---

## 2. Corrections to earlier findings

Two claims in my earlier analysis were wrong. Both materially affect this system, so they are
recorded here rather than quietly fixed.

**The screens are not dark-only.** I previously reported that all 18 mobile screens are dark. They
are not. **13 of 18 declare `bg-background-light dark:bg-background-dark`** — light is the design's
default, with dark as an opt-in variant. Only the 5 leasing/dealer screens are dark-only. They
*previewed* dark in Stitch, which is what I saw. Consequence: **both themes are first-class and
both must be built.** Neither is an afterthought.

**`#f6f6f8` is a background, not a text colour.** It is the declared `background-light` value. In
the dark theme it doubles as the foreground — a symmetry the original designs used deliberately.

---

## 3. Colour palette

### 3.1 Where it came from

The designs contained **two incompatible token architectures**:

| System | Screens | Shape |
|---|---|---|
| **Auction core** | 13 | Minimal — 3 custom colours (`primary`, `background-light`, `background-dark`); everything else borrowed from Tailwind's built-in `slate` scale |
| **Leasing / dealer** | 5 | A full **Material Design 3** role set — ~50 tokens with `surface-container-*` hierarchy, `on-*` foreground pairs, and a semantic layer |

They reconcile on one fact: **M3's `primary-container` is `#135bec`**, the same blue as the auction
core's `primary`. The M3 set also supplies the semantic layer the auction screens lacked —
`success #10b981`, `warning #f59e0b`, `error #ef4444`.

**Adopted architecture:** M3's *role-based naming discipline*, renamed to the **shadcn convention**
(`x` / `xForeground` pairs). This gives one vocabulary that maps 1:1 onto shadcn's CSS variables on
web while remaining plain data for React Native.

### 3.2 The brand ramp

`blue.600` `#135bec` is the canonical primary — 24 occurrences across 13 screens.

| Step | Hex | Provenance |
|---|---|---|
| `blue.50` | `#eef4ff` | derived — light accent surface |
| `blue.100` | `#dbe1ff` | M3 `primary-fixed` |
| `blue.200` | `#b4c5ff` | M3 `primary` — **the retired leasing primary** |
| `blue.400` | `#5b8dff` | dark-theme accent text + focus ring |
| `blue.600` | **`#135bec`** | **CarBid primary** |
| `blue.700` | `#0f4ecb` | hover / light accent text |
| `blue.800` | `#0052de` | M3 `inverse-primary` |

Cool neutrals, hue-biased toward the blue rather than pure grey:

| Step | Hex | Provenance |
|---|---|---|
| `slate.50` | `#f6f6f8` | declared `background-light` |
| `slate.200` | `#e2e8f0` | light border — `border-slate-200`, 62 uses |
| `slate.400` | `#92a4c9` | dark muted foreground — observed literal |
| `slate.700` | `#324467` | dark border — observed literal |
| `slate.800` | `#192233` | dark card surface — observed literal, 20 uses |
| `slate.900` | `#101622` | declared `background-dark` |
| `slate.950` | `#0d121b` | light foreground — observed literal |

### 3.3 Semantic roles

Full values live in [`packages/tokens/src/colors.ts`](../packages/tokens/src/colors.ts). Summary:

| Role | Light | Dark | Notes |
|---|---|---|---|
| `background` | `#f6f6f8` | `#101622` | both declared in the designs |
| `foreground` | `#0d121b` | `#f6f6f8` | |
| `card` | `#ffffff` | `#192233` | |
| `popover` | `#ffffff` | `#141d2e` | dark popover sits *above* card |
| `primary` | `#135bec` | `#135bec` | **identical in both themes** — brand constant |
| `mutedForeground` | `#5f6e84` | `#92a4c9` | light value corrected, see §3.5 |
| `accent` | `#eef4ff` | `#16243d` | |
| `success` | `#047857` | `#10b981` | |
| `warning` | `#d97706` | `#f59e0b` | |
| `destructive` | `#dc2626` | `#ef4444` | |
| `border` | `#e2e8f0` | `#324467` | decorative separators only |
| `input` | `#7390b7` | `#496497` | control boundaries — corrected, see §3.5 |
| `ring` | `#135bec` | `#5b8dff` | |

### 3.4 Auction state colours

Status must never be carried by the accent hue, or "live" and "selected" become
indistinguishable. Auction states map onto the *semantic* layer, and each carries a **non-colour
affordance** so state is not conveyed by hue alone (WCAG 1.4.1):

| State | Role | Affordance |
|---|---|---|
| `live` | success | animated pulse |
| `endingSoon` | warning | dot |
| `winning` | success | dot |
| `outbid` | destructive | left stripe |
| `reserveMet` / `reserveNotMet` | success / warning | dot |
| `underReview` | warning | pulse |
| `verified` | success | dot |
| `rejected` | destructive | stripe |
| `lost` / `ended` / `draft` | mutedForeground | dot |

### 3.5 Accessibility corrections

The inherited palette had **five real WCAG failures**. Each was solved by walking lightness to
the nearest compliant step, not by picking a new colour by eye:

| Token | Was | Ratio | Now | Ratio |
|---|---|---|---|---|
| light `mutedForeground` | `#64748b` | 4.41 ✗ | `#5f6e84` | **4.80** ✓ |
| light `success` (white text) | `#059669` | 3.77 ✗ | `#047857` | **5.48** ✓ |
| light `destructive` (white text) | `#ef4444` | 3.76 ✗ | `#dc2626` | **4.83** ✓ |
| light `input` boundary | `#e2e8f0` | 1.14 ✗ | `#7390b7` | **3.04** ✓ |
| dark `input` boundary | `#324467` | 1.86 ✗ | `#496497` | **3.06** ✓ |

`border` deliberately stays subtle (1.14 / 1.86). WCAG 1.4.11 requires 3:1 for *UI components and
meaningful graphics* — pure decorative separators are exempt. A form control's boundary is not, so
`input` was split from `border` as its own role. **This split is the reason both exist.**

The full palette now passes **21/21** checks. This is enforced, not asserted:

```bash
pnpm --filter @carbid/tokens verify:contrast   # exits non-zero on regression
```

The script also holds **regression guards** — if someone "tidies" `mutedForeground` back to the
round `slate-500`, the build fails.

---

## 4. Typography

Manrope across both platforms. The named roles and their exact metrics are **verbatim** from the
mobile Material-3 config:

| Role | Size / line-height | Tracking | Weight | Provenance |
|---|---|---|---|---|
| `displayLg` | 40 / 44 | −0.03em | 800 | new — desktop hero figures |
| `displayMd` | 32 / 38 | −0.025em | 800 | new |
| `h1` | 24 / 32 | −0.02em | 700 | **verbatim** |
| `h2` | 20 / 26 | −0.02em | 700 | derived |
| `h3` | 17 / 22 | −0.015em | 700 | derived |
| `notificationTitle` | 14 / 18 | 0 | 700 | **verbatim** |
| `bodyMd` | 13 / 18 | 0 | 500 | **verbatim** — default body size |
| `caption` | 10 / 12 | 0 | 500 | **verbatim** |
| `labelCaps` | 10 / 12 | **+0.1em** | 700 | **verbatim** — uppercase eyebrow |
| `navLabel` | 10 / 12 | 0 | 700 | **verbatim** — tab bar labels |
| `moneyLg/Md/Sm` | 27 / 19 / 15 | −0.02em | 700 | new — see below |

Two things worth noting:

- **This is a heavy-weight system.** Observed distribution was bold 197 / semibold 45 / medium 39 /
  extrabold 26 — `normal` appeared twice in 18 screens. `medium` is therefore the lightest role.
- **Money needs its own role.** Currency, countdowns, VINs and lot IDs use a mono face with
  `tabular-nums` and `white-space: nowrap`. In a bid panel, a price that reflows as digits change
  reads as a price *change*. This is a correctness requirement, not a stylistic one.

**Web only:** headings scale fluidly between the 390px and 1440px targets via `clamp()`, so a 24px
mobile `h1` reaches ~31px on desktop without a breakpoint jump. Mobile keeps fixed metrics.

**Native font loading:** RN needs concrete font files. Use `@expo-google-fonts/manrope`, register
the five weights at launch, and gate render on `useFonts` — otherwise the first paint falls back to
system and reflows.

---

## 5. Spacing, radii, elevation

Semantic spacing names come from the mobile config:

| Token | Value |
|---|---|
| `containerPadding` | 12px |
| `pageMargin` | 16px |
| `stackSm` / `stackMd` / `stackLg` | 12 / 16 / 24px |
| `iconGap` | 16px |
| `tabBarHeight` / `tabBarClearance` | 64 / 96px |

**Radii — correcting an earlier claim.** I previously said 8px, taking it from the Stitch project's
`ROUND_EIGHT` setting. The configs actually declare `DEFAULT 4 / lg 8 / xl 12`, and observed usage
was `rounded-full` 140, **`rounded-xl` 89**, `rounded-lg` 54. **12px is the dominant card radius**,
so `--radius: 0.75rem`.

Elevation is defined once and emitted twice: `box-shadow` strings for web, and
`shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` **plus Android `elevation`** for RN —
iOS and Android need different properties for the same visual result.

---

## 6. Theming — light and dark

**Both themes are first-class on both platforms.** Light is the default (§2), dark is complete, and
every pair in both themes clears WCAG AA. Dark is not a naive inversion — `success`, `destructive`,
`input` and `ring` all take different values per theme precisely so contrast holds on each ground.

### 6.1 Web

| Concern | Implementation |
|---|---|
| Mechanism | `darkMode: 'class'` — `.dark` on `<html>` reassigns the CSS variables |
| Preference states | **three**: `light`, `dark`, `system` |
| Persistence | `localStorage['carbid-theme']`, wrapped in try/catch for blocked storage |
| OS tracking | `matchMedia` listener, active only while the preference is `system` |
| Flash prevention | blocking inline script in `index.html`, before first paint |
| Browser chrome | `<meta name="theme-color">` per scheme, plus `color-scheme` on the root |

Three states rather than two is deliberate. A user who picks *system* wants the app to keep
tracking their OS; one who picks *light* wants it pinned. A two-state switch destroys that
distinction and offers no way back to system once touched — which is why `ThemeToggle` is a
`radiogroup` segmented control, not a switch.

Two details that are easy to get wrong:

- **The inline script must block.** React mounts *after* the browser paints, so resolving the theme
  in a component gives every dark-mode user a white flash on every load. The script in
  `index.html` is dependency-free and synchronous for this reason. Its storage key and resolution
  logic must stay in sync with `ThemeProvider.tsx`.
- **`color-scheme` matters as much as the class.** Without it, browser-rendered UI — scrollbars,
  native selects, date pickers, autofill — stays light on a dark page.

Files: [`src/providers/ThemeProvider.tsx`](../apps/web/src/providers/ThemeProvider.tsx),
[`src/components/ThemeToggle.tsx`](../apps/web/src/components/ThemeToggle.tsx),
[`index.html`](../apps/web/index.html).

### 6.2 React Native

RN has no CSS variables, so the mechanism differs even though the palette does not:

| Concern | Implementation |
|---|---|
| Mechanism | NativeWind's `dark:` variant, driven by its `colorScheme` runtime |
| Preference | `colorScheme.set('light' \| 'dark' \| 'system')` from `nativewind` |
| OS tracking | `Appearance` / `useColorScheme()` — handled by NativeWind when set to `system` |
| Persistence | `AsyncStorage`, restored before the first render |
| Flash prevention | gate the root render until both fonts and the stored preference resolve |
| Native chrome | `StatusBar` style + `NavigationBar` colour must be set per theme |

Both palettes are registered in `apps/mobile/tailwind.config.js` (`<role>` and `<role>-dark`), since
NativeWind resolves the variant at runtime rather than by swapping a variable.

Do not read raw hex in components on either platform — always go through a role. That is the rule
that keeps the two clients from drifting.

---

## 7. Responsive strategy

### 7.1 Breakpoints (web)

| Name | px | Meaning |
|---|---|---|
| `xs` | 390 | Stitch mobile authoring width |
| `sm` | 640 | |
| **`md`** | **768** | **regime shift** — bottom tabs → sidebar rail |
| **`lg`** | **1024** | **regime shift** — modal sheets → persistent rails; bid panel becomes sticky |
| `xl` | 1280 | |
| `2xl` | 1440 | web design target |

Only `md` and `lg` change the app's *shape*. The others adjust proportion.

### 7.2 Layout regimes

Encoded as data in [`layout.ts`](../packages/tokens/src/layout.ts) so both apps and this document
cannot disagree:

| Concern | compact (<768) | medium (768–1023) | expanded (≥1024) |
|---|---|---|---|
| Navigation | bottom tab bar | collapsed icon rail | labelled sidebar rail |
| Filters | modal sheet | drawer | **persistent rail** |
| Bid control | sticky bottom bar | sticky bottom bar | **sticky side panel** |
| Listings | 1–2 col cards | 2–3 col | 3–4 col |
| Tables | stacked cards | horizontal scroll | full table |
| Wizard | progress bar | progress bar | horizontal stepper |

The mobile app always runs the **compact** regime, except tablets, which use **medium**.

### 7.3 React Native has no media queries

This is the key architectural constraint. RN cannot use breakpoints. Behaviour comes from
`useWindowDimensions()` compared against `layoutRegimes`. Do not reach for `Dimensions.get()` — it
does not update on rotation or foldable state change.

---

## 8. Component inventory

### 8.1 shadcn/ui does not work in React Native

**This is the single most important constraint in this document.** shadcn/ui is built on Radix
primitives, which are DOM-only. It cannot be used in the RN app at any cost — there is no adapter.

The mobile app needs a parallel library implementing the same patterns:

| Option | Assessment |
|---|---|
| **React Native Reusables** — *recommended* | A direct port of shadcn's patterns to RN using NativeWind. Same component names, same `cn()` + variant approach, copy-paste model. Lowest cognitive distance from the web app. |
| gluestack-ui v2 | Mature, good a11y, but its own API — two mental models to hold. |
| Tamagui | Excellent performance and a real design-token system, but wants to own styling, which conflicts with sharing a Tailwind preset. |

Choosing React Native Reusables means **one variant vocabulary** (`variant="destructive"`,
`size="sm"`) across both clients even though the underlying primitives differ.

### 8.2 Primitives — available from shadcn / RN Reusables

Needed by the designed screens:

`button` · `input` · `textarea` · `label` · `select` · `checkbox` · `switch` · `radio-group` ·
`slider` · `badge` · `card` · `table` · `tabs` · `dialog` · `sheet`/`drawer` · `dropdown-menu` ·
`popover` · `tooltip` · `separator` · `avatar` · `progress` · `skeleton` · `sonner` (toasts) ·
`form` · `accordion` · `scroll-area` · `breadcrumb` · `alert` · `aspect-ratio` · `command` (search)

Platform notes: `tooltip` has no touch equivalent — use `popover` on mobile. `table` must become
stacked cards in the compact regime. `command` needs a native search screen, not a palette.

### 8.3 Domain components — must be built

These carry CarBid's actual behaviour and exist in no component library. Each is needed by both
platforms, so each belongs in a shared package with two thin presentational adapters.

| Component | Purpose | Screens | Notes |
|---|---|---|---|
| `LotCard` | vehicle summary card | W02, watchlist | favourite toggle, state pill, price |
| `AuctionCountdown` | live HH:MM:SS timer | W02, W04, W05 | **server-authoritative**; must not trust the device clock |
| `BidPanel` | current bid + increments + submit | W04, W18 | sticky rail ≥lg, bottom sheet <lg |
| `BidIncrementChips` | +$10K/+$25K/+$50K/+$100K | W04 | tiers must scale with lot value — see REQUIREMENTS FR-BID-13 |
| `StatusPill` | auction state badge | everywhere | consumes `auctionStateColors`, renders the affordance |
| `Money` | currency display | everywhere | mono, tabular-nums, nowrap, minor-unit integers |
| `PriceRangeSlider` | dual-handle range | W03 | **plain dollars** — never "Millions" |
| `BidHistoryTable` | pseudonymised bid ledger | W04 | table ≥lg, list <lg |
| `FilterRail` | the filter surface | W02, W03 | rail ≥lg, sheet <lg — same state, two shells |
| `WizardStepper` | 4-step sell progress | W08–W11 | stepper ≥lg, progress bar <lg |
| `MediaUploader` | photos, reorder, hero pick | W08 | camera roll + camera on native |
| `DocumentUploader` | PDF/CSV with per-file state | W10, W19 | native needs a document picker |
| `LenderComparison` | side-by-side lender terms | W15 | **table ≥lg, cards <lg** — the biggest desktop win |
| `AmortisationPanel` | live monthly payment | W16 | shared calculation, must match the lender contract |
| `HeadroomMeter` | bid vs approved lease limit | W18 | encodes the three-tier rule (safe / deposit / blocked) |
| `NotificationItem` | typed alert row | W13 | 5 types, deep-linking |
| `SettlementTimeline` | staged progress | W06, W12, W17 | reused for 3 different processes |
| `AgentCard` | leasing agent + presence | W17 | live presence |
| `VinInput` | 17-char VIN + validation | W10 | checksum validation, mono |
| `EmptyState` / `ErrorState` | absent everywhere in the designs | all | REQUIREMENTS §12 flags this as blocking |

### 8.4 What belongs in shared code

Share the **logic**, not the markup:

- ✅ tokens, formatters (money/date/mileage), bid-increment rules, amortisation maths, VIN
  validation, countdown logic, Zod schemas, API client, TanStack Query hooks
- ❌ JSX. Radix and RN primitives do not overlap; a "universal component" layer costs more than
  two honest adapters.

---

## 9. Repository structure

```
CarBid/
├── apps/
│   ├── web/                    Vite + React + shadcn
│   │   ├── components.json     shadcn CLI config
│   │   ├── tailwind.config.ts  extends the shared preset
│   │   └── src/
│   │       ├── index.css       Tailwind entry + base layer
│   │       └── styles/tokens.css   GENERATED — do not edit
│   └── mobile/                 Expo + NativeWind
│       └── tailwind.config.js  extends the same preset, native mode
├── packages/
│   ├── tokens/                 ← single source of truth
│   │   ├── src/{colors,typography,layout,index}.ts
│   │   ├── tailwind-preset.cjs shared by BOTH apps
│   │   └── scripts/{generate-css,verify-contrast}.ts
│   ├── core/                   domain logic, formatters, schemas (shared)
│   └── api/                    typed client + query hooks (shared)
└── docs/
    ├── REQUIREMENTS.md
    ├── DESIGN-SYSTEM.md        this file
    └── STITCH-FIX-PROMPTS.md
```

### 9.1 Why Tailwind 3.4 and not 4

Tailwind v4 is current, and v4's CSS-first `@theme` block is nicer than a JS config. **It cannot be
shared with React Native.** NativeWind v4 pins Tailwind to **3.4.x** and loads the config through
Metro. Pinning both apps to 3.4 with one CJS preset is what makes a single palette serve two
platforms.

Upgrade path: when NativeWind v5 (Tailwind v4 support) is stable, migrate both apps together and
convert the preset into a `@theme` block plus a generated TS export. **Do not upgrade the web app
alone** — that forks the palette, which is the exact failure this architecture prevents.

### 9.2 Why HSL channels, not hex, in the CSS variables

shadcn components lean on opacity modifiers (`bg-primary/90` for hover, `border-border/50`). Those
compose `hsl(var(--primary) / <alpha-value>)`, which only works if the variable holds a **channel
triplet** (`220.1 85.1% 50%`). Storing hex silently breaks every `/opacity` utility in the library —
no error, just no effect. RN gets hex directly, since it gains nothing from HSL.

All conversions were verified to round-trip hex → HSL → hex with **zero drift** across 22 colours.

---

## 10. Setup

```bash
# 1 — workspace
pnpm init && pnpm add -D turbo
# pnpm-workspace.yaml:  packages: ['apps/*', 'packages/*']

# 2 — tokens (build first; both apps import from dist/)
pnpm --filter @carbid/tokens build
pnpm --filter @carbid/tokens verify:contrast

# 3 — web
pnpm create vite apps/web --template react-ts
pnpm --filter web add -D tailwindcss@^3.4 postcss autoprefixer tailwindcss-animate
pnpm --filter web add @carbid/tokens class-variance-authority clsx tailwind-merge lucide-react
pnpm --filter web dlx shadcn@latest init      # answer: yes to CSS variables
pnpm --filter web dlx shadcn@latest add button card input badge table tabs dialog sheet

# 4 — mobile
pnpm create expo apps/mobile --template blank-typescript
pnpm --filter mobile add nativewind@^4 react-native-reanimated react-native-safe-area-context
pnpm --filter mobile add -D tailwindcss@^3.4
pnpm --filter mobile add @carbid/tokens @expo-google-fonts/manrope expo-font
pnpm --filter mobile dlx @react-native-reusables/cli@latest init
```

**Order matters.** `@carbid/tokens` must build before either app — the Tailwind presets import from
`dist/`, so a cold clone with no token build fails at config load with a confusing module error.

### 10.1 Verification gates

| Gate | Command |
|---|---|
| Contrast (21 checks + 3 guards) | `pnpm --filter @carbid/tokens verify:contrast` |
| Token → CSS regeneration is clean | `pnpm --filter @carbid/tokens build:css && git diff --exit-code` |
| Types | `pnpm -r typecheck` |
| Web a11y | axe-core via Playwright, both themes |
| Native a11y | `expo-a11y` + manual VoiceOver/TalkBack on the bid flow |

The second gate matters: it fails if anyone hand-edits the generated CSS.

---

## 11. Open decisions

Blocking, and not mine to make:

1. **Mobile component library** — React Native Reusables is recommended (§8.1) but not yet chosen.
2. **Is the RN app consumer-only?** The dealer console (W19) is a genuinely different product with
   a different actor. Recommendation: web-only for v1.
3. ~~**Theme default and user control.**~~ **RESOLVED** — light default, three-way preference
   (`light` / `dark` / `system`) with `system` tracking the OS, persisted per client. Implemented
   for web in §6.1; the native equivalent in §6.2 is specified but not yet built.
4. **Money representation.** Integer minor units are assumed (REQUIREMENTS NFR-04). Confirm before
   the API contract is fixed — retrofitting this is expensive.
5. **Auction realtime transport** — WebSocket vs SSE vs polling. Shapes `AuctionCountdown` and
   `BidPanel` on both platforms.

Carried over from [`REQUIREMENTS.md`](REQUIREMENTS.md) §11 and still unresolved: the canonical tab
bar (11.3), mileage units km vs miles (11.8), and the four incompatible identifier formats (11.10).
All three affect components specified above.
