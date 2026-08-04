import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
  readonly Icon: typeof Sun;
}

const OPTIONS: readonly ThemeOption[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

/**
 * Three-way theme control.
 *
 * A segmented control rather than a two-state switch, because "system" is a real choice the user
 * can otherwise never get back to once they've touched a toggle.
 *
 * Uses `radiogroup` semantics: these are three mutually exclusive options, which is what a screen
 * reader should hear. A row of buttons would announce them as unrelated actions.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isSelected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(
              // 40px is below the 48px minimum for a primary target, but this is a low-stakes
              // preference control in a header, not a bidding action. Labels carry via title/aria.
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
