/**
 * CarBid colour tokens — single source of truth for web and native.
 *
 * Grounded in the Stitch mobile designs, not invented:
 *  - `primary` #135bec is the auction-core primary (24 occurrences across 13 screens)
 *  - `background.light` #f6f6f8 / `background.dark` #101622 are the declared page grounds
 *  - `success` / `warning` / `error` come from the Material-3 token set the 5 leasing screens carry
 *  - light-mode foreground #0d121b and dark-mode muted #92a4c9 are both observed literals
 *
 * Role names follow the shadcn/ui convention (`x` + `xForeground` pairs) so the web layer maps
 * 1:1 onto its CSS variables, while staying plain data so React Native can consume it directly.
 * React Native has no CSS custom properties — that is why this file is TypeScript, not CSS.
 */

/** Raw brand ramp. Reference these only when building semantic roles below. */
export const palette = {
  // Brand blue. 600 is the canonical #135bec.
  blue: {
    50: '#eef4ff',
    100: '#dbe1ff', // M3 primary-fixed
    200: '#b4c5ff', // M3 primary / primary-fixed-dim (retired leasing primary)
    300: '#8aa9ff',
    400: '#5b8dff',
    500: '#2a6ef0',
    600: '#135bec', // ← CarBid primary
    700: '#0f4ecb',
    800: '#0052de', // M3 inverse-primary
    900: '#00297a', // M3 on-primary
    950: '#00174c', // M3 on-primary-fixed
  },
  /** Cool neutrals, hue-biased toward the brand blue rather than pure grey. */
  slate: {
    0: '#ffffff',
    50: '#f6f6f8', // declared background-light
    100: '#eef0f4',
    200: '#e2e8f0', // light-mode border (border-slate-200, 62 uses)
    300: '#cbd5e1',
    400: '#92a4c9', // dark-mode muted foreground (observed literal)
    500: '#64748b', // light-mode muted foreground (text-slate-500, 100 uses)
    600: '#475569',
    700: '#324467', // dark-mode border (observed literal, 8 uses)
    800: '#192233', // dark-mode card/surface (observed literal, 20 uses)
    850: '#141d2e',
    900: '#101622', // declared background-dark
    950: '#0d121b', // light-mode foreground (observed literal)
  },
  green: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' }, // M3 success
  amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }, // M3 warning
  red: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' }, // M3 error
  /**
   * Contrast-corrected values. Solved, not chosen by eye — each is the nearest step to the
   * design's original colour that clears its WCAG threshold. See `docs/DESIGN-SYSTEM.md`.
   */
  a11y: {
    mutedForegroundLight: '#5f6e84', // slate-500 #64748b only reached 4.41:1 on #f6f6f8
    inputBorderLight: '#7390b7', // slate-200 reached 1.14:1 — fails 1.4.11 for a control boundary
    inputBorderDark: '#496497', // slate-700 reached 1.86:1
  },
} as const;

/** Semantic roles per theme. Consumers must reference these, never `palette` directly. */
export const semanticColors = {
  light: {
    background: palette.slate[50],
    foreground: palette.slate[950],

    card: palette.slate[0],
    cardForeground: palette.slate[950],
    popover: palette.slate[0],
    popoverForeground: palette.slate[950],

    primary: palette.blue[600],
    primaryForeground: palette.slate[0],

    secondary: palette.slate[100],
    secondaryForeground: palette.slate[900],

    muted: palette.slate[100],
    mutedForeground: palette.a11y.mutedForegroundLight,

    accent: palette.blue[50],
    accentForeground: palette.blue[700],

    destructive: palette.red[600],
    destructiveForeground: palette.slate[0],
    success: palette.green[700],
    successForeground: palette.slate[0],
    warning: palette.amber[600],
    warningForeground: palette.slate[950],

    /** Decorative separator only — WCAG 1.4.11 exempts it from the 3:1 rule. */
    border: palette.slate[200],
    /** Control boundary — must clear 3:1. */
    input: palette.a11y.inputBorderLight,
    ring: palette.blue[600],

    /** Auction-specific surfaces that have no shadcn equivalent. */
    surfaceRaised: palette.slate[0],
    surfaceSunken: palette.slate[100],
    overlay: 'rgba(13, 18, 27, 0.55)',
  },
  dark: {
    background: palette.slate[900],
    foreground: palette.slate[50],

    card: palette.slate[800],
    cardForeground: palette.slate[50],
    popover: palette.slate[850],
    popoverForeground: palette.slate[50],

    primary: palette.blue[600],
    primaryForeground: palette.slate[0],

    secondary: palette.slate[800],
    secondaryForeground: palette.slate[50],

    muted: palette.slate[800],
    mutedForeground: palette.slate[400],

    // Solid, not translucent: a translucent accent cannot be expressed as HSL channels, which
    // would break every `bg-accent/50`-style opacity modifier shadcn components rely on.
    accent: '#16243d',
    accentForeground: palette.blue[400],

    destructive: palette.red[500],
    destructiveForeground: palette.slate[0],
    success: palette.green[500],
    successForeground: palette.slate[950],
    warning: palette.amber[500],
    warningForeground: palette.slate[950],

    /** Decorative separator only. */
    border: palette.slate[700],
    /** Control boundary — must clear 3:1. */
    input: palette.a11y.inputBorderDark,
    ring: palette.blue[400],

    surfaceRaised: '#1f2b40',
    surfaceSunken: '#0d131f',
    overlay: 'rgba(0, 0, 0, 0.66)',
  },
} as const;

/**
 * Auction state colours. Kept separate from `primary` on purpose: the accent hue must never
 * double as a status signal, or "live" and "selected" become indistinguishable.
 *
 * Every state also carries a non-colour affordance (`dot`, `pulse`, `stripe`) so status is not
 * conveyed by hue alone — required for WCAG 1.4.1.
 */
export const auctionStateColors = {
  live: { role: 'success', affordance: 'pulse' },
  endingSoon: { role: 'warning', affordance: 'dot' },
  winning: { role: 'success', affordance: 'dot' },
  outbid: { role: 'destructive', affordance: 'stripe' },
  reserveNotMet: { role: 'warning', affordance: 'dot' },
  reserveMet: { role: 'success', affordance: 'dot' },
  won: { role: 'success', affordance: 'dot' },
  lost: { role: 'mutedForeground', affordance: 'dot' },
  pendingApproval: { role: 'warning', affordance: 'dot' },
  underReview: { role: 'warning', affordance: 'pulse' },
  verified: { role: 'success', affordance: 'dot' },
  rejected: { role: 'destructive', affordance: 'stripe' },
  draft: { role: 'mutedForeground', affordance: 'dot' },
  ended: { role: 'mutedForeground', affordance: 'dot' },
} as const;

export type ThemeName = keyof typeof semanticColors;
export type ColorRole = keyof typeof semanticColors.light;
export type AuctionState = keyof typeof auctionStateColors;
