import { LaptopMinimal, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { ThemeMode } from "../lib/theme";

const themeOptions: Array<{
  label: string;
  mode: ThemeMode;
  icon: typeof SunMedium;
}> = [
  { label: "Light", mode: "light", icon: SunMedium },
  { label: "Dark", mode: "dark", icon: MoonStar },
  { label: "System", mode: "system", icon: LaptopMinimal },
];

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-border/80 bg-card/90 p-1 text-card-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {themeOptions.map(({ label, mode, icon: Icon }) => {
        const isActive = theme === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            aria-pressed={isActive}
            aria-label={`Switch theme to ${label.toLowerCase()}`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
      <span className="sr-only">Resolved theme: {resolvedTheme}</span>
    </div>
  );
}
