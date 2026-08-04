/**
 * WCAG contrast gate. Run in CI: `pnpm --filter @carbid/tokens verify:contrast`.
 *
 * This exists because the palette inherited from the Stitch designs had five real failures
 * (light muted text at 4.41:1, light success and destructive buttons at ~3.7:1, and input borders
 * at 1.14:1 / 1.86:1). They were corrected — this script stops them coming back.
 *
 * Exits non-zero on any failure so a regression blocks the build.
 */

import { semanticColors, palette } from '../src/colors';

interface ContrastCheck {
  readonly label: string;
  readonly foreground: string;
  readonly background: string;
  /** 4.5 for body text (WCAG 1.4.3 AA), 3.0 for UI component boundaries (1.4.11). */
  readonly minimum: number;
}

function relativeLuminance(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) throw new Error(`relativeLuminance: expected 6-digit hex, received "${hex}"`);
  const channels = [m[1], m[2], m[3]]
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  return Math.round(ratio * 100) / 100;
}

const light = semanticColors.light;
const dark = semanticColors.dark;

const checks: readonly ContrastCheck[] = [
  // ── Light theme ──
  { label: 'light: body on background', foreground: light.foreground, background: light.background, minimum: 4.5 },
  { label: 'light: muted on background', foreground: light.mutedForeground, background: light.background, minimum: 4.5 },
  { label: 'light: muted on card', foreground: light.mutedForeground, background: light.card, minimum: 4.5 },
  { label: 'light: primary button', foreground: light.primaryForeground, background: light.primary, minimum: 4.5 },
  { label: 'light: success button', foreground: light.successForeground, background: light.success, minimum: 4.5 },
  { label: 'light: destructive button', foreground: light.destructiveForeground, background: light.destructive, minimum: 4.5 },
  { label: 'light: warning surface', foreground: light.warningForeground, background: light.warning, minimum: 4.5 },
  { label: 'light: accent text', foreground: light.accentForeground, background: light.accent, minimum: 4.5 },
  { label: 'light: input boundary', foreground: light.input, background: light.background, minimum: 3.0 },
  { label: 'light: focus ring', foreground: light.ring, background: light.background, minimum: 3.0 },

  // ── Dark theme ──
  { label: 'dark: body on background', foreground: dark.foreground, background: dark.background, minimum: 4.5 },
  { label: 'dark: muted on background', foreground: dark.mutedForeground, background: dark.background, minimum: 4.5 },
  { label: 'dark: muted on card', foreground: dark.mutedForeground, background: dark.card, minimum: 4.5 },
  { label: 'dark: body on raised surface', foreground: dark.foreground, background: dark.surfaceRaised, minimum: 4.5 },
  { label: 'dark: primary button', foreground: dark.primaryForeground, background: dark.primary, minimum: 4.5 },
  { label: 'dark: success pill', foreground: dark.success, background: dark.background, minimum: 4.5 },
  { label: 'dark: warning pill', foreground: dark.warning, background: dark.background, minimum: 4.5 },
  { label: 'dark: destructive pill', foreground: dark.destructive, background: dark.background, minimum: 4.5 },
  { label: 'dark: accent text', foreground: dark.accentForeground, background: dark.accent, minimum: 4.5 },
  { label: 'dark: input boundary', foreground: dark.input, background: dark.background, minimum: 3.0 },
  { label: 'dark: focus ring', foreground: dark.ring, background: dark.background, minimum: 3.0 },
];

/**
 * Regression guards. These specific values were solved to clear their thresholds; if someone
 * "tidies" them back to the round Tailwind equivalents, the palette silently fails again.
 */
const regressionGuards: readonly { readonly label: string; readonly actual: string; readonly forbidden: string }[] = [
  { label: 'light mutedForeground must not revert to slate-500', actual: light.mutedForeground, forbidden: palette.slate[500] },
  { label: 'light input must not revert to slate-200', actual: light.input, forbidden: palette.slate[200] },
  { label: 'dark input must not revert to slate-700', actual: dark.input, forbidden: palette.slate[700] },
];

function main(): void {
  const failures: string[] = [];

  console.log('WCAG 2.2 contrast gate\n');
  for (const check of checks) {
    const ratio = contrastRatio(check.foreground, check.background);
    const pass = ratio >= check.minimum;
    if (!pass) {
      failures.push(`${check.label}: ${ratio}:1 (needs ${check.minimum}:1)`);
    }
    console.log(
      `  ${pass ? 'PASS' : 'FAIL'}  ${check.label.padEnd(34)} ${String(ratio).padStart(6)}:1  (min ${check.minimum})`,
    );
  }

  console.log('\nRegression guards\n');
  for (const guard of regressionGuards) {
    const pass = guard.actual.toLowerCase() !== guard.forbidden.toLowerCase();
    if (!pass) failures.push(guard.label);
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${guard.label}`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} contrast failure(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`\nAll ${checks.length} contrast checks and ${regressionGuards.length} guards passed.`);
}

main();
