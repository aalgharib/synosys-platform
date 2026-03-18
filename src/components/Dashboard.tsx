import { ArrowRight, Sparkles } from "lucide-react";
import type { Tool } from "../types/platform";

interface DashboardProps {
  tools: Tool[];
  onNavigate: (id: string) => void;
}

export default function Dashboard({ tools, onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8">
      <div className="surface-hero p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Creative <span className="text-primary">Command Center.</span>
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            Welcome back. Select a tool below to start creating high-conversion
            marketing assets.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-slate-950"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                  alt="user"
                />
              ))}
            </div>
            <p className="text-sm text-slate-300">
              Joined by <span className="font-bold text-white">1,200+</span>{" "}
              creators.
            </p>
          </div>
        </div>
        <Sparkles className="absolute bottom-8 right-12 h-32 w-32 text-primary/20" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools
          .filter((tool) => !tool.hidden)
          .map((tool) => (
            <button
              key={tool.id}
              type="button"
              disabled={tool.disabled}
              onClick={() => onNavigate(tool.id)}
              className={`group relative rounded-[2rem] border p-8 text-left transition-all duration-300 ${
                tool.disabled
                  ? "bg-muted/50 border-border opacity-60 grayscale cursor-not-allowed"
                  : "surface-card hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl"
              }`}
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                  tool.id === "youtube"
                    ? "bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                }`}
              >
                {tool.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-card-foreground">{tool.name}</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
              <div
                className={`flex items-center gap-2 text-sm font-bold ${
                  tool.disabled ? "text-muted-foreground" : "text-primary"
                }`}
              >
                {tool.disabled ? "Coming Soon" : "Launch Tool"}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
