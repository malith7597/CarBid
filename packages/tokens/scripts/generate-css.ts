/**
 * Generates apps/web/src/styles/tokens.css from the TypeScript token source.
 *
 * Run: `pnpm --filter @carbid/tokens build:css`
 *
 * The generated file is committed so the web app builds without a token build step, but it must
 * never be hand-edited — this script is the only writer. Hand-editing caused two transcription
 * errors during the initial authoring, which is exactly why generation exists.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { cssVariablesFor } from '../src/index';
import { radius } from '../src/layout';

const OUT = resolve(import.meta.dirname, '../../../apps/web/src/styles/tokens.css');

function block(theme: 'light' | 'dark', selector: string, comment: string): string {
  const vars = cssVariablesFor(theme);
  const lines = Object.entries(vars)
    .filter(([, value]) => !value.startsWith('rgba')) // overlay stays a literal, see below
    .map(([name, value]) => `    ${name}: ${value};`)
    .join('\n');
  return `  ${selector} {\n    /* ${comment} */\n${lines}\n`;
}

function generate(): string {
  const light = block(
    'light',
    ':root',
    'Light theme — the DEFAULT. 13 of 18 mobile screens declare bg-background-light dark:bg-background-dark.',
  );
  const dark = block('dark', '.dark', 'Dark theme. The 5 leasing screens are dark-only; the rest opt in via .dark.');

  return `/**
 * CarBid theme variables — GENERATED. Do not edit.
 * Source: packages/tokens/src/colors.ts
 * Regenerate: pnpm --filter @carbid/tokens build:css
 *
 * Values are HSL channel triplets so Tailwind can compose hsl(var(--x) / <alpha-value>),
 * which is what keeps shadcn's /opacity modifiers working.
 */

@layer base {
${light}
    --radius: ${radius.lg / 16}rem; /* ${radius.lg}px — dominant card radius */
  }

${dark}  }
}
`;
}

const css = generate();
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, css, 'utf8');
console.log(`Wrote ${OUT} (${css.length} bytes)`);
