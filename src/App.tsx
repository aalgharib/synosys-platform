import {
  ChevronRight,
  Grid,
  Home,
  Layout,
  Menu,
  Palette,
  X,
  Youtube,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import Dashboard from "./components/Dashboard";
import PosterCreator from "./components/PosterCreator";
import YoutubeThumbnailCreator from "./components/YoutubeThumbnailCreator";
import type { Branding, Tool } from "./types/platform";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const platformLogoInputRef = useRef<HTMLInputElement | null>(null);
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);
  const currentYear = new Date().getFullYear();

  const [branding, setBranding] = useState<Branding>({
    platformLogo: null,
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
  });

  const tools: Tool[] = [
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
  ];

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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <button
              type="button"
              onClick={() => platformLogoInputRef.current?.click()}
              className="flex items-center gap-3 rounded-2xl p-1 -m-1 transition hover:bg-slate-50"
            >
              {branding.platformLogo ? (
                <img
                  src={branding.platformLogo}
                  alt="Logo"
                  className="h-8 w-auto"
                />
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Palette size={24} />
                  </div>
                  <span className="font-black text-xl tracking-tight">
                    Syno<span className="text-blue-600">Sys</span>
                  </span>
                </>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-grow space-y-1">
            {tools
              .filter((tool) => tool.id === "dashboard" || !tool.hidden)
              .map((tool) => (
                <button
                  key={tool.id}
                  disabled={tool.disabled}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === tool.id
                      ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50"
                  } ${tool.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {tool.icon}
                  <span className="text-sm font-bold">{tool.name}</span>
                </button>
              ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">
                Dashboard
              </span>
              {activeTab !== "dashboard" && (
                <>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className="text-sm font-black text-blue-600 uppercase">
                    {activeTab}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => profilePicInputRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-md overflow-hidden ring-4 ring-blue-50 transition hover:scale-105"
            >
              <img
                src={branding.profilePic}
                alt="User Avatar"
                className="w-full h-full object-cover"
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
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <Dashboard tools={tools} onNavigate={setActiveTab} />
            )}
            {activeTab === "poster" && <PosterCreator />}
            {activeTab === "youtube" && <YoutubeThumbnailCreator />}
          </div>
        </div>
        <footer className="border-t border-slate-200 bg-white/80 px-8 py-4 text-center text-sm text-slate-500">
          Copyright © {currentYear} SynoSys. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
