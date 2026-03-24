import {
  AlignLeft,
  AlignRight,
  Type,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  availableFontFamilies,
  defaultThumbnailConfig,
  defaultThumbnailImages,
} from "../defaults";
import { useImageExport } from "../hooks/useImageExport";
import type {
  ImageConfig,
  ThumbnailConfig,
  ThumbnailDraft,
  ThumbnailLayoutSide,
} from "../types/platform";

interface YoutubeThumbnailCreatorProps {
  draft?: ThumbnailDraft | null;
}

const buildThumbnailConfig = (
  draft?: ThumbnailDraft | null,
): ThumbnailConfig => ({
  ...defaultThumbnailConfig,
  ...draft?.config,
});

const buildThumbnailImages = (draft?: ThumbnailDraft | null): ImageConfig => ({
  ...defaultThumbnailImages,
  ...draft?.images,
});

export default function YoutubeThumbnailCreator({
  draft,
}: YoutubeThumbnailCreatorProps) {
  const [config, setConfig] = useState<ThumbnailConfig>(() =>
    buildThumbnailConfig(draft),
  );
  const [images, setImages] = useState<ImageConfig>(() =>
    buildThumbnailImages(draft),
  );

  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const { exportElement } = useImageExport();
  const displayedTextX =
    config.layoutSide === "person-left" ? config.textPos.x : 100 - config.textPos.x;

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

  const setLayoutSide = (layoutSide: ThumbnailLayoutSide) => {
    setConfig((previous) => ({
      ...previous,
      layoutSide,
    }));
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !thumbRef.current) {
        return;
      }

      const rect = thumbRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.min(Math.max(x, 5), 95);
      const storedX =
        config.layoutSide === "person-left" ? clampedX : 100 - clampedX;

      setConfig((previous) => ({
        ...previous,
        textPos: {
          x: storedX,
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
  }, [config.layoutSide, isDragging]);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/70 pb-2">
              <Upload size={16} className="text-red-500" /> Media & Layout
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">
                    Brand Logo
                  </label>
                  <input
                    type="file"
                    onChange={(event) => handleImageUpload(event, "logo")}
                    className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-red-500/10 file:text-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <User size={10} /> Person Cutout
                  </label>
                  <input
                    type="file"
                    onChange={(event) => handleImageUpload(event, "person")}
                    className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-red-500/10 file:text-red-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Background Image
                </label>
                <input
                  type="file"
                  onChange={(event) => handleImageUpload(event, "bg")}
                  className="text-[10px] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-950 file:text-white"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/70">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Logo Position
                </span>
                <div className="flex bg-card rounded-lg p-1 shadow-sm border border-border">
                  <button
                    onClick={() =>
                      setConfig((previous) => ({
                        ...previous,
                        logoPosition: "left",
                      }))
                    }
                    className={`p-1.5 rounded-md transition-all ${
                      config.logoPosition === "left"
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
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
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <AlignRight size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/70">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Layout Side
                </span>
                <div className="flex bg-card rounded-lg p-1 shadow-sm border border-border">
                  <button
                    type="button"
                    onClick={() => setLayoutSide("person-left")}
                    className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                      config.layoutSide === "person-left"
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Person Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutSide("person-right")}
                    className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                      config.layoutSide === "person-right"
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Person Right
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/70 pb-2">
              <Type size={16} className="text-red-500" /> Typography
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                className="input-base rounded-xl bg-muted/40 px-3 py-2.5 font-bold uppercase"
              />
              <input
                type="text"
                name="glowHook"
                value={config.glowHook}
                onChange={handleInputChange}
                className="input-base rounded-xl bg-muted/40 px-3 py-2.5 font-black uppercase italic"
                style={{ color: config.accentColor }}
              />
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                  className="input-base rounded-xl bg-muted/40 px-3 py-2.5 text-sm"
                >
                  {availableFontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                  Text Align
                </label>
                <div className="flex bg-muted/40 rounded-xl p-1 border border-border">
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
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
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
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
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
                        ? "bg-red-500 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Right
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {config.mainFontSize}px
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {config.glowFontSize}px
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {config.glowIntensity}px
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
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
                  <p className="text-[10px] text-muted-foreground mt-1">
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
            className="button-primary sticky bottom-0 w-full py-4 font-bold shadow-lg active:scale-95"
          >
            {isExporting ? "Exporting..." : "Download Thumbnail"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center lg:col-span-7 lg:sticky lg:top-8">
        <div className="w-full">
          <div className="shadow-2xl rounded-2xl overflow-hidden bg-black">
            <div
              ref={thumbRef}
              className="w-full aspect-video relative bg-slate-950 bg-cover bg-center overflow-hidden"
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
                <div
                  className={`absolute bottom-0 z-20 h-[95%] ${
                    config.layoutSide === "person-left" ? "left-0" : "right-0"
                  }`}
                >
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
                  left: `${displayedTextX}%`,
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
