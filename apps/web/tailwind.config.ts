import type { Config } from 'tailwindcss';
import carbidPreset from '@carbid/tokens/tailwind-preset.cjs';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Web Tailwind config. All colour/type/spacing tokens come from the shared preset so the web app
 * and the React Native app cannot drift. Anything added here must be web-only by nature.
 */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // shadcn components are copied into src/components/ui, already covered above.
  ],
  presets: [carbidPreset({ platform: 'web' })],
  theme: {
    extend: {
      // Fluid heading sizes — web only. Mobile keeps the fixed metrics from the design.
      fontSize: {
        'fluid-h1': ['clamp(1.5rem, 0.9rem + 1.1vw, 1.95rem)', { lineHeight: '1.25', fontWeight: '700' }],
        'fluid-h2': ['clamp(1.25rem, 0.95rem + 0.6vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '700' }],
        'fluid-display': ['clamp(1.75rem, 1rem + 2vw, 2.375rem)', { lineHeight: '1.1', fontWeight: '800' }],
      },
      // shadcn's Radix-driven animations need these; they have no native counterpart.
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // Layout primitives the desktop screens depend on.
      gridTemplateColumns: {
        'browse': 'minmax(0,1fr)', // compact
        'browse-rail': '214px minmax(0,1fr)', // lg+: persistent filter rail
        'detail': 'minmax(0,1fr) 336px', // lg+: sticky bid panel
        'checkout': 'minmax(0,1fr) 336px',
        'app-shell': '198px minmax(0,1fr)', // md+: sidebar nav
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
