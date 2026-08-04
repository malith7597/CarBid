import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Theme control for the CarBid web app.
 *
 * Three states, not two. "system" is a distinct choice from "light" — a user who picks system wants
 * the app to keep tracking their OS, whereas one who picks light wants it pinned. Collapsing them
 * loses that intent, and is the most common mistake in theme toggles.
 *
 * Light is the default, matching the design: 13 of 18 mobile screens declare
 * `bg-background-light dark:bg-background-dark`.
 */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What is actually painted, after resolving "system" against the OS. */
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'carbid-theme';

interface ThemeContextValue {
  /** What the user chose. */
  readonly preference: ThemePreference;
  /** What is on screen right now. */
  readonly resolved: ResolvedTheme;
  readonly setPreference: (preference: ThemePreference) => void;
  /** Flips between light and dark, leaving "system" behind deliberately. */
  readonly toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private browsing or blocked storage — fall through to the default.
  }
  return 'system';
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return prefersDark() ? 'dark' : 'light';
  return preference;
}

/**
 * Applies the theme to the document.
 *
 * `color-scheme` is set alongside the class so browser-rendered UI — scrollbars, native selects,
 * date pickers, form autofill — matches. Without it those stay light on a dark page.
 */
function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly defaultPreference?: ThemePreference;
}

export function ThemeProvider({ children, defaultPreference }: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => defaultPreference ?? readStoredPreference(),
  );
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(preference));

  const setPreference = useCallback((next: ThemePreference): void => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the theme still applies for this session.
    }
  }, []);

  // Apply on mount and whenever the preference changes.
  useEffect(() => {
    const next = resolve(preference);
    setResolved(next);
    applyTheme(next);
  }, [preference]);

  // Follow the OS while, and only while, the preference is "system".
  useEffect(() => {
    if (preference !== 'system') return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      const next: ResolvedTheme = event.matches ? 'dark' : 'light';
      setResolved(next);
      applyTheme(next);
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [preference]);

  const toggle = useCallback((): void => {
    setPreference(resolve(preference) === 'dark' ? 'light' : 'dark');
  }, [preference, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return context;
}
