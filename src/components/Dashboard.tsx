import { ArrowRight, Sparkles } from "lucide-react";
import type { Tool } from "../types/platform";

interface DashboardProps {
  tools: Tool[];
  onNavigate: (id: string) => void;
}

export default function Dashboard({ tools, onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Creative <span className="text-blue-500">Command Center.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Welcome back. Select a tool below to start creating
            high-conversion marketing assets.
          </p>
          <div className="flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-900"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                  alt="user"
                />
              ))}
            </div>
            <p className="text-sm text-slate-400 self-center">
              Joined by <span className="text-white font-bold">1,200+</span>{" "}
              creators.
            </p>
          </div>
        </div>
        <Sparkles className="absolute bottom-8 right-12 text-blue-500/20 w-32 h-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools
          .filter((tool) => !tool.hidden)
          .map((tool) => (
            <button
              key={tool.id}
              disabled={tool.disabled}
              onClick={() => onNavigate(tool.id)}
              className={`group relative text-left p-8 rounded-[2rem] border transition-all duration-300 ${
                tool.disabled
                  ? "bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed"
                  : "bg-white border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  tool.id === "youtube"
                    ? "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                    : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                }`}
              >
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {tool.description}
              </p>
              <div
                className={`flex items-center gap-2 text-sm font-bold ${
                  tool.disabled ? "text-slate-400" : "text-blue-600"
                }`}
              >
                {tool.disabled ? "Coming Soon" : "Launch Tool"}{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
