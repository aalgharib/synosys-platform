import {
  BriefcaseBusiness,
  ChevronRight,
  Home,
  Layout,
  Menu,
  Target,
  X,
  Youtube,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import BrandLogo from "./components/BrandLogo";
import CampaignStudio from "./components/CampaignStudio";
import Dashboard from "./components/Dashboard";
import LeadTracker from "./components/LeadTracker";
import PosterCreator from "./components/PosterCreator";
import ThemeToggle from "./components/ThemeToggle";
import YoutubeThumbnailCreator from "./components/YoutubeThumbnailCreator";
import { ThemeProvider } from "./context/ThemeContext";
import { defaultBranding } from "./defaults";
import { platformRepository } from "./repositories/platformRepository";
import type {
  BrandKit,
  Branding,
  CampaignRecord,
  LeadRecord,
  PosterDraft,
  ThumbnailDraft,
  Tool,
} from "./types/platform";

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

  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [brandKits, setBrandKits] = useState<BrandKit[]>(() =>
    platformRepository.listBrandKits(),
  );
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() =>
    platformRepository.listCampaigns(),
  );
  const [leads, setLeads] = useState<LeadRecord[]>(() =>
    platformRepository.listLeads(),
  );
  const [posterDraft, setPosterDraft] = useState<PosterDraft | null>(null);
  const [thumbnailDraft, setThumbnailDraft] = useState<ThumbnailDraft | null>(
    null,
  );

  useEffect(() => {
    platformRepository.saveBrandKits(brandKits);
  }, [brandKits]);

  useEffect(() => {
    platformRepository.saveCampaigns(campaigns);
  }, [campaigns]);

  useEffect(() => {
    platformRepository.saveLeads(leads);
  }, [leads]);

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
        id: "campaigns",
        name: "Campaign Studio",
        icon: <BriefcaseBusiness size={20} />,
        description:
          "Build campaign packs, manage brand kits, and prepare grouped assets.",
        color: "blue",
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
        icon: <Target size={20} />,
        description:
          "Track campaign-linked leads, statuses, and booking outcomes.",
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

  const handleOpenPosterDraft = (draft: PosterDraft) => {
    setPosterDraft(draft);
    setActiveTab("poster");
  };

  const handleOpenThumbnailDraft = (draft: ThumbnailDraft) => {
    setThumbnailDraft(draft);
    setActiveTab("youtube");
  };

  const usingThemeAwareDefaultLogo =
    !branding.platformLogo || defaultThemeAwareLogos.has(branding.platformLogo);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-sidebar/95 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => platformLogoInputRef.current?.click()}
              className="rounded-2xl p-1 transition hover:bg-accent/60"
              aria-label="Upload platform logo"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  S
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-muted-foreground lg:hidden"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            {tools
              .filter((tool) => tool.id === "dashboard" || !tool.hidden)
              .map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  disabled={tool.disabled}
                  onClick={() => setActiveTab(tool.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                    activeTab === tool.id
                      ? "border border-primary/15 bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent/60"
                  } ${tool.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                      activeTab === tool.id
                        ? "border-primary/20 bg-card text-primary"
                        : "border-transparent bg-transparent text-muted-foreground"
                    }`}
                  >
                    {tool.icon}
                  </span>
                  <span className="text-left text-sm font-bold">{tool.name}</span>
                </button>
              ))}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-[2rem] border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-lg font-bold text-foreground">Appearance</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Switch between light, dark, and system themes.
              </p>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg bg-muted p-2 text-foreground lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">
                Dashboard
              </span>
              {activeTab !== "dashboard" && (
                <>
                  <ChevronRight size={14} className="text-border" />
                  <span className="text-sm font-black uppercase text-primary">
                    {activeTab}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => profilePicInputRef.current?.click()}
            className="h-10 w-10 overflow-hidden rounded-xl border-2 border-white bg-muted shadow-md ring-4 ring-primary/10 transition hover:scale-105"
          >
            <img
              src={branding.profilePic}
              alt="User Avatar"
              className="h-full w-full object-cover"
            />
          </button>
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
            {activeTab === "campaigns" && (
              <CampaignStudio
                brandKits={brandKits}
                campaigns={campaigns}
                onSaveBrandKits={setBrandKits}
                onSaveCampaigns={setCampaigns}
                onOpenPosterDraft={handleOpenPosterDraft}
                onOpenThumbnailDraft={handleOpenThumbnailDraft}
                onOpenLeadTracker={() => setActiveTab("leads")}
              />
            )}
            {activeTab === "poster" && (
              <PosterCreator
                key={posterDraft?.id ?? "poster-default"}
                draft={posterDraft}
              />
            )}
            {activeTab === "youtube" && (
              <YoutubeThumbnailCreator
                key={thumbnailDraft?.id ?? "thumbnail-default"}
                draft={thumbnailDraft}
              />
            )}
            {activeTab === "leads" && (
              <LeadTracker
                campaigns={campaigns}
                leads={leads}
                onSaveLeads={setLeads}
              />
            )}
          </div>
        </div>

        <footer className="border-t border-border bg-background/80 px-8 py-4 text-center text-sm text-muted-foreground">
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
