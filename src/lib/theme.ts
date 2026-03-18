export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "synosys-theme";

const isBrowser = typeof window !== "undefined";

export const getSystemTheme = (): ResolvedTheme => {
  if (!isBrowser) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

export const getStoredTheme = (): ThemeMode | null => {
  if (!isBrowser) {
    return null;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  return isThemeMode(storedValue) ? storedValue : null;
};

export const resolveTheme = (
  theme: ThemeMode,
  systemTheme: ResolvedTheme = getSystemTheme(),
): ResolvedTheme => (theme === "system" ? systemTheme : theme);

export const applyTheme = (
  theme: ThemeMode,
  systemTheme: ResolvedTheme = getSystemTheme(),
) => {
  const resolvedTheme = resolveTheme(theme, systemTheme);

  if (typeof document === "undefined") {
    return resolvedTheme;
  }

  const root = document.documentElement;

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
};
