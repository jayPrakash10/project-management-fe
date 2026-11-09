import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { themeStorage } from '@/lib/storage';
import { isAccent, isThemeMode, type Accent, type ThemeMode } from '@/lib/theme';
import { ThemeContext, type ThemeContextValue } from './theme-context';

/**
 * Light / dark / system mode combined with an accent palette.
 * The inline script in index.html applies the same values before React loads.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = themeStorage.getMode();
    return isThemeMode(stored) ? stored : 'system';
  });
  const [accent, setAccentState] = useState<Accent>(() => {
    const stored = themeStorage.getAccent();
    return isAccent(stored) ? stored : 'coral';
  });
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = resolvedMode;
    root.dataset.accent = accent;
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode, accent]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      accent,
      setMode: (next) => {
        themeStorage.setMode(next);
        setModeState(next);
      },
      setAccent: (next) => {
        themeStorage.setAccent(next);
        setAccentState(next);
      },
    }),
    [mode, resolvedMode, accent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
