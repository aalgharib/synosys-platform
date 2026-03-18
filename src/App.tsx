import {
  ChevronRight,
  Grid,
  Home,
  Layout,
  Menu,
  MoonStar,
  Sparkles,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import BrandLogo from "./components/BrandLogo";
import Dashboard from "./components/Dashboard";
import PosterCreator from "./components/PosterCreator";
import ThemeToggle from "./components/ThemeToggle";
import YoutubeThumbnailCreator from "./components/YoutubeThumbnailCreator";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { defaultBranding } from "./defaults";
import type { Branding, Tool } from "./types/platform";

const defaultThemeAwareLogos = new Set([
  "/branding/platform-logo.png",
  "/branding/poster-logo.png",
]);

function AppShell() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const platformLogoInputRef = useRef<HTMLInputElement | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);
  const currentYear = new Date().getFullYear();
  const { resolvedTheme, theme } = useTheme();

  const [branding, setBranding] = useState<Branding>(defaultBranding);

  const tools: Tool[] = useMemo(
    () => [
      {
        id: "dashboard",
        name: "Home",
        icon: <Home size={20} />,
        description: "Overview & tools",
        color: "slate",
        hidden: true,
      },
      {
        id: "poster",
        name: "Poster Creator",
        icon: <Layout size={20} />,
        description:
          "Generate high-quality marketing flyers and social graphics in seconds.",
        color: "blue",
      },
      {
        id: "youtube",
        name: "YouTube Creator",
        icon: <Youtube size={20} />,
        description:
          "Hook viewers with high-CTR thumbnails featuring glowing text.",
        color: "red",
      },
      {
        id: "leads",
        name: "Lead Tracker",
        icon: <Grid size={20} />,
        description: "Integrated CRM and pipeline management for your projects.",
        disabled: true,
        color: "emerald",
      },
    ],
    [],
  );

  const handleBrandingUpload = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof Branding,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;

      if (!result) {
        return;
      }

      setBranding((previous) => ({
        ...previous,
        [key]: result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const usingThemeAwareDefaultLogo =
    !branding.platformLogo || defaultThemeAwareLogos.has(branding.platformLogo);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`surface-panel fixed inset-y-0 left-0 z-50 w-72 border-r border-border/80 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => platformLogoInputRef.current?.click()}
              className="flex items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-accent/60"
            >
              {usingThemeAwareDefaultLogo ? (
                <BrandLogo alt="SynoSys platform logo" className="h-10 w-auto" />
              ) : branding.platformLogo ? (
                <img
                  src={branding.platformLogo}
                  alt="Custom platform logo"
                  className="h-10 w-auto rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">S</div>
              )}
              <div>
                <p className="text-base font-black tracking-tight text-foreground">
                  SynoSys Platform
                </p>
                <p className="text-sm text-muted-foreground">
                  {theme === "system"
                    ? `System • ${resolvedTheme}`
                    : `${theme[0].toUpperCase()}${theme.slice(1)} mode`}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground lg:hidden"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mb-6 rounded-3xl border border-border/80 bg-muted/40 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Appearance</p>
                <p className="text-sm text-muted-foreground">
                  Theme changes update UI tokens and the default logo instantly.
                </p>
              </div>
              <MoonStar className="mt-0.5 h-5 w-5 text-primary" />
            </div>
            <ThemeToggle />
          </div>

          <nav className="flex-grow space-y-2">
            {tools
              .filter((tool) => tool.id === "dashboard" || !tool.hidden)
              .map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  disabled={tool.disabled}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                    activeTab === tool.id
                      ? "border-primary/30 bg-primary/10 text-foreground shadow-sm"
                      : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-accent/60 hover:text-accent-foreground"
                  } ${tool.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/70">
                      {tool.icon}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </button>
              ))}
          </nav>

          <div className="surface-card mt-6 space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Live theme sample
            </div>
            <p className="text-sm text-muted-foreground">
              Verify page background, text, cards, buttons, inputs, and branding
              tokens in both light and dark mode.
            </p>
            <div className="flex items-center gap-2">
              <button type="button" className="button-primary text-sm">
                Primary button
              </button>
              <button type="button" className="button-secondary text-sm">
                Secondary
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={`Resolved ${resolvedTheme} theme`}
              className="input-base text-sm"
            />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-border bg-card p-2 text-foreground transition hover:bg-accent lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">Dashboard</span>
              {activeTab !== "dashboard" && (
                <>
                  <ChevronRight size={14} className="text-muted-foreground" />
                  <span className="text-sm font-black uppercase tracking-wide text-primary">
                    {activeTab}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => platformLogoInputRef.current?.click()}
              className="button-secondary hidden text-sm md:inline-flex"
            >
              <Upload className="h-4 w-4" />
              Upload logo
            </button>
            <button
              type="button"
              onClick={() => profilePicInputRef.current?.click()}
              className="h-11 w-11 overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-4 ring-primary/10 transition hover:scale-105"
            >
              <img
                src={branding.profilePic}
                alt="User Avatar"
                className="h-full w-full object-cover"
              />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <input
            ref={platformLogoInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => handleBrandingUpload(event, "platformLogo")}
            className="hidden"
          />
          <input
            ref={profilePicInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => handleBrandingUpload(event, "profilePic")}
            className="hidden"
          />
          <div className="mx-auto max-w-7xl">
            {activeTab === "dashboard" && (
              <Dashboard tools={tools} onNavigate={setActiveTab} />
            )}
            {activeTab === "poster" && <PosterCreator />}
            {activeTab === "youtube" && <YoutubeThumbnailCreator />}
          </div>
        </div>

        <footer className="border-t border-border/80 bg-background/80 px-8 py-4 text-center text-sm text-muted-foreground">
          Copyright (c) {currentYear} SynoSys. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
