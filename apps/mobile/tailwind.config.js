/**
 * React Native (Expo + NativeWind v4) Tailwind config.
 *
 * Two differences from the web config, both forced by the platform:
 *  1. Colours are literal hex, not `hsl(var(--token))` — React Native has no CSS variables.
 *  2. No `screens`. RN has no media queries; breakpoint behaviour comes from
 *     `layoutRegimes` + `useWindowDimensions`. See docs/DESIGN-SYSTEM.md § Responsive strategy.
 *
 * Theme switching therefore cannot work by swapping a CSS variable. NativeWind's `dark:` variant
 * handles it via its own runtime, which is why both palettes are registered below.
 */

const carbidPreset = require('@carbid/tokens/tailwind-preset.cjs');
const { semanticColors } = require('@carbid/tokens/dist/colors.js');

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * NativeWind resolves `dark:` at runtime, so each role needs both values registered.
 * Light is the base value; dark is exposed as `<role>-dark` for the few places a manual
 * override beats the variant.
 */
function dualThemeColors() {
  const out = {};
  for (const role of Object.keys(semanticColors.light)) {
    out[kebab(role)] = semanticColors.light[role];
    out[`${kebab(role)}-dark`] = semanticColors.dark[role];
  }
  return out;
}

module.exports = {
  darkMode: 'class',
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset'), carbidPreset({ platform: 'native', theme: 'light' })],
  theme: {
    extend: {
      colors: dualThemeColors(),
    },
  },
  plugins: [],
};
