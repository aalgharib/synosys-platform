import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from "../lib/theme";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themeOrder: ThemeMode[] = ["light", "dark", "system"];

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Start with the same neutral defaults on server and first client render so
  // hydration matches. The inline theme-init script in app/layout.tsx has already
  // set the correct CSS class on <html>, so there's no visual flash — only React
  // state needs to be synced in the first effect.
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [hydrated, setHydrated] = useState<boolean>(false);

  const resolvedTheme = useMemo(
    () => resolveTheme(theme, systemTheme),
    [systemTheme, theme],
  );

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const currentIndex = themeOrder.indexOf(currentTheme);
      return themeOrder[(currentIndex + 1) % themeOrder.length];
    });
  }, []);

  // On first mount, hydrate the real theme from localStorage + system.
  // The set-state-in-effect pattern is intentional here: the server doesn't
  // have access to localStorage or window.matchMedia, so we use neutral
  // defaults for SSR and then sync the real values after hydration.
  /* eslint-disable react-hooks/set-state-in-effect -- SSR hydration sync */
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setThemeState(stored);
    }
    setSystemTheme(getSystemTheme());
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Apply theme to <html> and persist to localStorage once hydrated.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    applyTheme(theme, systemTheme);
    window.localStorage.setItem("synosys-theme", theme);
  }, [hydrated, systemTheme, theme]);

  // Watch system theme changes.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      cycleTheme,
    }),
    [cycleTheme, resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
