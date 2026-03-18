import {
  AlignLeft,
  AlignRight,
  Type,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useImageExport } from "../hooks/useImageExport";
import type { ImageConfig, ThumbnailConfig } from "../types/platform";

export default function YoutubeThumbnailCreator() {
  const [config, setConfig] = useState<ThumbnailConfig>({
    accentColor: "#FF0000",
    backgroundColor: "#020617",
    opacity: 40,
    mainHook: "THE ULTIMATE AI",
    glowHook: "SECRET",
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    glowIntensity: 20,
    mainFontSize: 72,
    glowFontSize: 96,
    logoPosition: "left",
    textAlign: "right",
    textPos: { x: 75, y: 50 },
  });

  const [images, setImages] = useState<ImageConfig>({
    logo: "https://placehold.co/400x100/FFFFFF/031630?text=SynoSys",
    bg: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1280&q=80",
    person: null,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const { exportElement } = useImageExport();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setConfig((previous) => ({
      ...previous,
      [name]:
        name === "opacity" ||
        name === "glowIntensity" ||
        name === "mainFontSize" ||
        name === "glowFontSize"
          ? Number(value)
          : value,
    }));
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof ImageConfig,
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

      setImages((previous) => ({
        ...previous,
        [key]: result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = () => setIsDragging(true);

  const getResponsiveFontSize = (size: number, mobileRatio: number) =>
    `clamp(${Math.max(24, Math.round(size * mobileRatio))}px, 6vw, ${size}px)`;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !thumbRef.current) {
        return;
      }

      const rect = thumbRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setConfig((previous) => ({
        ...previous,
        textPos: {
          x: Math.min(Math.max(x, 5), 95),
          y: Math.min(Math.max(y, 5), 95),
        },
      }));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Upload size={16} className="text-red-600" /> Media & Layout
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Brand Logo
                  </label>
                  <input
                    type="file"
                    onChange={(event) => handleImageUpload(event, "logo")}
                    className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-red-50 file:text-red-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                    <User size={10} /> Person Cutout
                  </label>
                  <input
                    type="file"
                    onChange={(event) => handleImageUpload(event, "person")}
                    className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-red-50 file:text-red-700"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  Background Image
                </label>
                <input
                  type="file"
                  onChange={(event) => handleImageUpload(event, "bg")}
                  className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-900 file:text-white"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">
                  Logo Position
                </span>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                  <button
                    onClick={() =>
                      setConfig((previous) => ({
                        ...previous,
                        logoPosition: "left",
                      }))
                    }
                    className={`p-1.5 rounded-md transition-all ${
                      config.logoPosition === "left"
                        ? "bg-red-600 text-white"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setConfig((previous) => ({
                        ...previous,
                        logoPosition: "right",
                      }))
                    }
                    className={`p-1.5 rounded-md transition-all ${
                      config.logoPosition === "right"
                        ? "bg-red-600 text-white"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <AlignRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Type size={16} className="text-red-600" /> Typography
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    name="accentColor"
                    value={config.accentColor}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    name="backgroundColor"
                    value={config.backgroundColor}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
              <input
                type="text"
                name="mainHook"
                value={config.mainHook}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold uppercase"
              />
              <input
                type="text"
                name="glowHook"
                value={config.glowHook}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-black uppercase italic"
                style={{ color: config.accentColor }}
              />
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Font Family
                </label>
                <select
                  name="fontFamily"
                  value={config.fontFamily}
                  onChange={(event) =>
                    setConfig((previous) => ({
                      ...previous,
                      fontFamily: event.target.value,
                    }))
                  }
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm"
                >
                  <option value='"Space Grotesk", system-ui, sans-serif'>
                    Space Grotesk
                  </option>
                  <option value="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif">
                    Impact
                  </option>
                  <option value="'Arial Black', Gadget, sans-serif">
                    Arial Black
                  </option>
                  <option value="'Trebuchet MS', sans-serif">
                    Trebuchet
                  </option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Text Align
                </label>
                <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((previous) => ({
                        ...previous,
                        textAlign: "left",
                      }))
                    }
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                      config.textAlign === "left"
                        ? "bg-red-600 text-white"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((previous) => ({
                        ...previous,
                        textAlign: "center",
                      }))
                    }
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                      config.textAlign === "center"
                        ? "bg-red-600 text-white"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((previous) => ({
                        ...previous,
                        textAlign: "right",
                      }))
                    }
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                      config.textAlign === "right"
                        ? "bg-red-600 text-white"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Right
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Main Font Size
                  </label>
                  <input
                    type="range"
                    name="mainFontSize"
                    min="36"
                    max="120"
                    value={config.mainFontSize}
                    onChange={handleInputChange}
                    className="w-full mt-2 accent-red-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {config.mainFontSize}px
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Glow Font Size
                  </label>
                  <input
                    type="range"
                    name="glowFontSize"
                    min="48"
                    max="160"
                    value={config.glowFontSize}
                    onChange={handleInputChange}
                    className="w-full mt-2 accent-red-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {config.glowFontSize}px
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Glow Amount
                  </label>
                  <input
                    type="range"
                    name="glowIntensity"
                    min="0"
                    max="60"
                    value={config.glowIntensity}
                    onChange={handleInputChange}
                    className="w-full mt-2 accent-red-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {config.glowIntensity}px
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Dim Overlay
                  </label>
                  <input
                    type="range"
                    name="opacity"
                    min="0"
                    max="100"
                    value={config.opacity}
                    onChange={handleInputChange}
                    className="w-full mt-2 accent-red-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {config.opacity}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={() =>
              exportElement(thumbRef, "YT-Thumbnail", setIsExporting)
            }
            disabled={isExporting}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95"
          >
            {isExporting ? "Exporting..." : "Download Thumbnail"}
          </button>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="sticky top-8">
          <div className="shadow-2xl rounded-2xl overflow-hidden bg-black">
            <div
              ref={thumbRef}
              className="w-full aspect-video relative bg-slate-900 bg-cover bg-center overflow-hidden"
              style={{
                backgroundColor: config.backgroundColor,
                backgroundImage: `url('${images.bg}')`,
              }}
            >
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${config.opacity / 100})`,
                }}
              ></div>
              <div
                className={`absolute top-6 z-30 ${
                  config.logoPosition === "left" ? "left-6" : "right-6"
                }`}
              >
                <img
                  src={images.logo}
                  alt="Logo"
                  className="h-8 md:h-12 w-auto object-contain"
                />
              </div>
              {images.person && (
                <div className="absolute bottom-0 left-0 z-20 h-[95%]">
                  <img
                    src={images.person}
                    alt="Presenter"
                    className="h-full w-auto object-contain"
                  />
                </div>
              )}
              <div
                onMouseDown={handleMouseDown}
                className={`absolute z-40 cursor-move p-4 ${
                  isDragging ? "ring-2 ring-red-500/50 rounded-xl bg-black/10" : ""
                }`}
                style={{
                  left: `${config.textPos.x}%`,
                  top: `${config.textPos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div style={{ textAlign: config.textAlign }}>
                  <div
                    className="font-black leading-[0.9] text-white uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    style={{
                      fontFamily: config.fontFamily,
                      fontSize: getResponsiveFontSize(config.mainFontSize, 0.45),
                    }}
                  >
                    {config.mainHook}
                  </div>
                  <div
                    className="font-black leading-none uppercase italic"
                    style={{
                      fontFamily: config.fontFamily,
                      fontSize: getResponsiveFontSize(config.glowFontSize, 0.5),
                      color: config.accentColor,
                      textShadow: `0 0 ${config.glowIntensity}px ${config.accentColor}`,
                    }}
                  >
                    {config.glowHook}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
