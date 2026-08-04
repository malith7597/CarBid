/**
 * CarBid typography tokens.
 *
 * The named roles (h1, bodyMd, caption, labelCaps, navLabel, notificationTitle) and their exact
 * metrics are lifted verbatim from the Material-3 Tailwind config embedded in the leasing screens.
 * The remaining roles fill gaps the mobile designs left but desktop needs — display sizes for
 * hero figures and a `money` role for tabular currency.
 *
 * Sizes are unitless numbers (px) so React Native can use them directly; the web layer converts
 * to rem in tailwind.config.
 */

export const fontFamily = {
  /** Manrope is the product typeface across all 18 screens. */
  sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  /** Monospace is used for money, VINs, lot IDs and countdowns so digits align. */
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const;

/** React Native needs concrete PostScript-ish names; Expo registers these at load. */
export const nativeFontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Type roles. `size` and `lineHeight` in px, `tracking` in em.
 *
 * Observed weight distribution across the mobile screens was bold 197 / semibold 45 / medium 39 /
 * extrabold 26 — this is a heavy-weight system by design, so `medium` is the lightest role here.
 */
export const typeScale = {
  /** Desktop-only hero figures (current bid, winning price). Not present in mobile designs. */
  displayLg: { size: 40, lineHeight: 44, tracking: -0.03, weight: fontWeight.extrabold },
  displayMd: { size: 32, lineHeight: 38, tracking: -0.025, weight: fontWeight.extrabold },

  /** Verbatim from the mobile config. */
  h1: { size: 24, lineHeight: 32, tracking: -0.02, weight: fontWeight.bold },
  h2: { size: 20, lineHeight: 26, tracking: -0.02, weight: fontWeight.bold },
  h3: { size: 17, lineHeight: 22, tracking: -0.015, weight: fontWeight.bold },
  h4: { size: 15, lineHeight: 20, tracking: -0.01, weight: fontWeight.bold },

  /** Verbatim: notification-title 14/18/700. */
  notificationTitle: { size: 14, lineHeight: 18, tracking: 0, weight: fontWeight.bold },
  /** Verbatim: body-md 13px / 1.4 / 500. Default body size on mobile. */
  bodyMd: { size: 13, lineHeight: 18, tracking: 0, weight: fontWeight.medium },
  bodySm: { size: 12, lineHeight: 16, tracking: 0, weight: fontWeight.medium },
  /** Verbatim: caption 10/12/500. */
  caption: { size: 10, lineHeight: 12, tracking: 0, weight: fontWeight.medium },
  /** Verbatim: label-caps 10/12/700 with +0.1em — the uppercase eyebrow style. */
  labelCaps: { size: 10, lineHeight: 12, tracking: 0.1, weight: fontWeight.bold },
  /** Verbatim: nav-label 10/12/700 — bottom tab bar labels. */
  navLabel: { size: 10, lineHeight: 12, tracking: 0, weight: fontWeight.bold },

  /** Currency and countdowns. Always pair with tabular-nums. */
  moneyLg: { size: 27, lineHeight: 30, tracking: -0.02, weight: fontWeight.bold },
  moneyMd: { size: 19, lineHeight: 24, tracking: -0.02, weight: fontWeight.bold },
  moneySm: { size: 15, lineHeight: 20, tracking: -0.02, weight: fontWeight.bold },
} as const;

/**
 * Web-only fluid overrides. Mobile keeps fixed metrics; the web app scales headings between the
 * 390px and 1440px targets so a 24px mobile h1 becomes ~31px on desktop without a breakpoint jump.
 */
export const fluidType = {
  h1: 'clamp(1.5rem, 0.9rem + 1.1vw, 1.95rem)',
  h2: 'clamp(1.25rem, 0.95rem + 0.6vw, 1.5rem)',
  displayMd: 'clamp(1.75rem, 1rem + 2vw, 2.375rem)',
  displayLg: 'clamp(2rem, 1rem + 3vw, 3rem)',
} as const;

export type TypeRole = keyof typeof typeScale;
