/**
 * CarBid spacing, radii, elevation and breakpoint tokens.
 *
 * The semantic spacing names (pageMargin, containerPadding, stackSm/Md/Lg, iconGap) and the radius
 * ramp are taken from the mobile Tailwind config. Radius note: the config declares
 * DEFAULT 4 / lg 8 / xl 12, and actual usage was rounded-full 140x, rounded-xl 89x, rounded-lg 54x
 * — so **xl (12px) is the dominant card radius**, not 8px.
 */

/** 4px base unit. Numeric (px) so React Native consumes it directly. */
export const space = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** Semantic spacing from the mobile config — prefer these in layout code. */
export const semanticSpace = {
  containerPadding: space[3], // 12px
  pageMargin: space[4], // 16px
  stackSm: space[3], // 12px
  stackMd: space[4], // 16px
  stackLg: space[6], // 24px
  iconGap: space[4], // 16px
  /** Bottom tab bar height + safe area allowance. Mobile content must clear this. */
  tabBarHeight: 64,
  tabBarClearance: 96,
  /** Sticky desktop rails offset from the top bar. */
  stickyOffset: space[4],
} as const;

export const radius = {
  none: 0,
  sm: 4, // config DEFAULT
  md: 8, // config lg
  lg: 12, // config xl — dominant card radius
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * Elevation. Web uses box-shadow strings; React Native needs shadowColor/Offset/Opacity/Radius
 * plus Android `elevation`, so both forms are provided from one definition.
 */
export const elevation = {
  none: { web: 'none', native: { elevation: 0 } },
  sm: {
    web: '0 1px 2px rgba(13,18,27,.06), 0 1px 3px rgba(13,18,27,.10)',
    native: {
      shadowColor: '#0d121b',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  md: {
    web: '0 2px 4px rgba(13,18,27,.06), 0 8px 16px -6px rgba(13,18,27,.14)',
    native: {
      shadowColor: '#0d121b',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  lg: {
    web: '0 4px 8px rgba(13,18,27,.07), 0 18px 36px -12px rgba(13,18,27,.22)',
    native: {
      shadowColor: '#0d121b',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 10,
    },
  },
} as const;

/**
 * Breakpoints. `xs` 390 is the Stitch mobile authoring width; `2xl` 1440 is the web design target.
 *
 * The two that carry real layout meaning are marked — they are where the app changes shape, not
 * merely its proportions.
 */
export const breakpoints = {
  xs: 390, // Stitch mobile authoring width
  sm: 640,
  md: 768, // ← REGIME SHIFT: bottom tabs → sidebar rail
  lg: 1024, // ← REGIME SHIFT: modal sheets → persistent rails, bid panel becomes sticky
  xl: 1280,
  '2xl': 1440, // web design target
} as const;

/**
 * Layout regimes. Encodes the mobile→desktop transformations as data so both apps and the docs
 * stay in agreement about what changes where.
 */
export const layoutRegimes = {
  compact: {
    upTo: breakpoints.md - 1,
    navigation: 'bottom-tab-bar',
    filters: 'modal-sheet',
    bidControl: 'sticky-bottom-bar',
    listing: '1-2-column-cards',
    tables: 'stacked-cards',
    wizard: 'progress-bar',
  },
  medium: {
    from: breakpoints.md,
    upTo: breakpoints.lg - 1,
    navigation: 'collapsed-icon-rail',
    filters: 'drawer',
    bidControl: 'sticky-bottom-bar',
    listing: '2-3-column-cards',
    tables: 'horizontal-scroll',
    wizard: 'progress-bar',
  },
  expanded: {
    from: breakpoints.lg,
    navigation: 'labelled-sidebar-rail',
    filters: 'persistent-rail',
    bidControl: 'sticky-side-panel',
    listing: '3-4-column-cards',
    tables: 'full-table',
    wizard: 'horizontal-stepper',
  },
} as const;

/** Minimum hit target. 44 on iOS (HIG), 48 on Android (Material) — take the larger. */
export const a11y = {
  minTouchTarget: 48,
  minTouchTargetIOS: 44,
  focusRingWidth: 2,
  focusRingOffset: 2,
} as const;

export const duration = { fast: 120, normal: 200, slow: 320 } as const;
export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0, 1)',
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
} as const;
