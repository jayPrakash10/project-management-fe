/**
 * Safe wrappers around localStorage. Storage can be unavailable (private mode,
 * blocked site data), so every access is guarded and failures fall back to null.
 */

const KEYS = {
  token: 'taskflow.token',
  themeMode: 'taskflow.theme.mode',
  themeAccent: 'taskflow.theme.accent',
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the value simply won't persist.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean up.
  }
}

export const tokenStorage = {
  get: () => read(KEYS.token),
  set: (token: string) => write(KEYS.token, token),
  clear: () => remove(KEYS.token),
};

export const themeStorage = {
  getMode: () => read(KEYS.themeMode),
  setMode: (mode: string) => write(KEYS.themeMode, mode),
  getAccent: () => read(KEYS.themeAccent),
  setAccent: (accent: string) => write(KEYS.themeAccent, accent),
};
