/**
 * Shared Tailwind preset — consumed by BOTH apps/web and apps/mobile.
 *
 * Why CommonJS and Tailwind v3.4: NativeWind v4 pins Tailwind CSS to v3.4.x and loads the config
 * through Metro, which needs CJS. Tailwind v4's CSS-first `@theme` block cannot be shared with
 * React Native at all. Pinning both apps to v3.4 with this preset is what makes one palette serve
 * two platforms. See docs/DESIGN-SYSTEM.md § "Why Tailwind 3.4" for the upgrade path.
 *
 * Colours resolve differently per platform on purpose:
 *   web    → hsl(var(--token)) so themes swap by toggling a class, and `/opacity` modifiers work
 *   native → literal hex, because React Native has no CSS custom properties
 */

const { semanticColors } = require('./dist/colors.js');
const { typeScale, fontFamily, nativeFontFamily } = require('./dist/typography.js');
const { space, radius, breakpoints, semanticSpace } = require('./dist/layout.js');

/** Roles that exist in both themes and therefore become CSS variables on web. */
const ROLES = Object.keys(semanticColors.light);

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** `hsl(var(--primary) / <alpha-value>)` — keeps opacity modifiers working. */
function webColors() {
  const out = {};
  for (const role of ROLES) {
    out[role] = `hsl(var(--${kebab(role)}) / <alpha-value>)`;
  }
  return out;
}

/** Literal hex for the given theme — RN resolves at build time, not runtime. */
function nativeColors(theme) {
  const out = {};
  for (const role of ROLES) {
    out[role] = semanticColors[theme][role];
  }
  return out;
}

/** px numbers → rem strings for web; RN keeps the raw numbers. */
function remScale(scale) {
  const out = {};
  for (const [k, v] of Object.entries(scale)) {
    out[k] = typeof v === 'number' ? (v === 0 ? '0px' : `${v / 16}rem`) : v;
  }
  return out;
}

function fontSizeScale({ web }) {
  const out = {};
  for (const [role, t] of Object.entries(typeScale)) {
    const key = kebab(role);
    out[key] = web
      ? [
          `${t.size / 16}rem`,
          { lineHeight: `${t.lineHeight / 16}rem`, letterSpacing: `${t.tracking}em`, fontWeight: t.weight },
        ]
      : [t.size, { lineHeight: t.lineHeight, letterSpacing: t.tracking, fontWeight: t.weight }];
  }
  return out;
}

/**
 * @param {{ platform: 'web' | 'native', theme?: 'light' | 'dark' }} options
 */
module.exports = function carbidPreset({ platform = 'web', theme = 'light' } = {}) {
  const isWeb = platform === 'web';

  return {
    darkMode: 'class', // matches the mobile designs' own `darkMode: "class"`
    theme: {
      // Breakpoints are web-only; RN uses layoutRegimes + useWindowDimensions instead.
      ...(isWeb
        ? {
            screens: Object.fromEntries(
              Object.entries(breakpoints).map(([k, v]) => [k, `${v}px`]),
            ),
          }
        : {}),
      extend: {
        colors: isWeb ? webColors() : nativeColors(theme),
        fontFamily: isWeb
          ? { sans: fontFamily.sans, mono: fontFamily.mono }
          : {
              sans: [nativeFontFamily.regular],
              medium: [nativeFontFamily.medium],
              semibold: [nativeFontFamily.semibold],
              bold: [nativeFontFamily.bold],
              extrabold: [nativeFontFamily.extrabold],
              mono: [nativeFontFamily.mono],
            },
        fontSize: fontSizeScale({ web: isWeb }),
        spacing: {
          ...(isWeb ? remScale(space) : space),
          ...(isWeb ? remScale(semanticSpace) : semanticSpace),
        },
        borderRadius: isWeb ? remScale(radius) : radius,
        keyframes: {
          /** The `live` auction affordance — a pulse, so state is not colour-only. */
          'pulse-ring': {
            '0%': { opacity: '1', transform: 'scale(0.9)' },
            '70%': { opacity: '0', transform: 'scale(1.9)' },
            '100%': { opacity: '0', transform: 'scale(1.9)' },
          },
        },
        animation: { 'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2,0,0,1) infinite' },
      },
    },
  };
};
