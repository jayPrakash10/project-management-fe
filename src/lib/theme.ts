/** Theme options. Keep in sync with the inline script in index.html and styles/tokens.css. */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedMode = 'light' | 'dark';
export type Accent = 'coral' | 'indigo' | 'emerald' | 'amber' | 'violet' | 'ocean';

export const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const ACCENTS: { value: Accent; label: string }[] = [
  { value: 'coral', label: 'Coral' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'amber', label: 'Amber' },
  { value: 'violet', label: 'Violet' },
  { value: 'ocean', label: 'Ocean' },
];

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function isAccent(value: unknown): value is Accent {
  return ACCENTS.some((accent) => accent.value === value);
}
