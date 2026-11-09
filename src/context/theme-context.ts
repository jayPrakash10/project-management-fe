import { createContext } from 'react';
import type { Accent, ResolvedMode, ThemeMode } from '@/lib/theme';

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  accent: Accent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
