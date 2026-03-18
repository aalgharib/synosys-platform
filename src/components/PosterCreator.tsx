import { Download } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { defaultPosterConfig, defaultPosterImages } from "../defaults";
import { useImageExport } from "../hooks/useImageExport";
import type {
  PosterConfig,
  PosterImages,
  PosterTextAlign,
} from "../types/platform";
type PosterDragTarget = "headline" | "message" | "footer" | null;

export default function PosterCreator() {
  const [config, setConfig] = useState<PosterConfig>(defaultPosterConfig);

  const [images, setImages] = useState<PosterImages>(defaultPosterImages);

  const [isExporting, setIsExporting] = useState(false);
  const [dragTarget, setDragTarget] = useState<PosterDragTarget>(null);
  const posterRef = useRef<HTMLDivElement | null>(null);
  const { exportElement } = useImageExport();

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setConfig((previous) => ({
      ...previous,
      [name]:
        name === "opacity" ||
        name.endsWith("Size")
          ? Number(value)
          : value,
    }));
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof PosterImages,
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

  const updatePosition = (
    target: Exclude<PosterDragTarget, null>,
    x: number,
    y: number,
  ) => {
    const nextPosition = {
      x: Math.min(Math.max(x, 18), 82),
      y: Math.min(Math.max(y, 8), 82),
    };

    setConfig((previous) => {
      if (target === "headline") {
        return { ...previous, headlinePos: nextPosition };
      }

      if (target === "message") {
        return { ...previous, messagePos: nextPosition };
      }

      return { ...previous, footerPos: nextPosition };
    });
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragTarget || !posterRef.current) {
        return;
      }

      const rect = posterRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      updatePosition(dragTarget, x, y);
    };

    const handleMouseUp = () => setDragTarget(null);

    if (dragTarget) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragTarget]);

  const renderAccentText = () => {
    const words = config.middleLine2.split(" ");

    if (words.length <= 3) {
      return (
        <span style={{ color: config.accentColor }}>{config.middleLine2}</span>
      );
    }

    const mainPart = words.slice(0, words.length - 3).join(" ");
    const accentPart = words.slice(words.length - 3).join(" ");

    return (
      <>
        {mainPart} <span style={{ color: config.accentColor }}>{accentPart}</span>
      </>
    );
  };

  const sharedTextStyle = {
    fontFamily: config.fontFamily,
    textAlign: config.textAlign as PosterTextAlign,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Poster Creator</h2>
          <p className="text-slate-500 text-sm">
            Update text, typography, and drag the text boxes on the canvas.
          </p>
        </div>

        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Asset Uploads
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Logo
              </label>
              <input
                type="file"
                onChange={(event) => handleImageUpload(event, "logo")}
                className="text-xs block w-full file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-2 file:py-1"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                QR Code
              </label>
              <input
                type="file"
                onChange={(event) => handleImageUpload(event, "qr")}
                className="text-xs block w-full file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-2 file:py-1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Background Image
            </label>
            <input
              type="file"
              onChange={(event) => handleImageUpload(event, "bg")}
              className="text-xs block w-full file:bg-slate-900 file:text-white file:border-0 file:rounded-md file:px-2 file:py-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Content & Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accent
              </label>
              <input
                type="color"
                name="accentColor"
                value={config.accentColor}
                onChange={handleInputChange}
                className="w-full h-10 rounded-lg cursor-pointer border-0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dim Overlay
              </label>
              <input
                type="range"
                name="opacity"
                min="0"
                max="100"
                value={config.opacity}
                onChange={handleInputChange}
                className="w-full mt-3 accent-blue-600"
              />
            </div>
          </div>
          <input
            type="text"
            name="topLine1"
            value={config.topLine1}
            onChange={handleInputChange}
            placeholder="Headline 1"
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="text"
            name="topLine2"
            value={config.topLine2}
            onChange={handleInputChange}
            placeholder="Headline 2"
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
          <textarea
            name="middleLine1"
            value={config.middleLine1}
            onChange={handleInputChange}
            placeholder="Main Message"
            rows={2}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="text"
            name="middleLine2"
            value={config.middleLine2}
            onChange={handleInputChange}
            placeholder="Accent Message"
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Typography & Layout
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
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
              <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
              <option value="Georgia, serif">Georgia</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Text Align
            </label>
            <div className="flex bg-white rounded-xl p-1 border border-slate-200">
              {(["left", "center", "right"] as PosterTextAlign[]).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() =>
                    setConfig((previous) => ({ ...previous, textAlign: align }))
                  }
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    config.textAlign === align
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {align[0].toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Headline Size
              </label>
              <input
                type="range"
                name="topLine1Size"
                min="24"
                max="64"
                value={config.topLine1Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {config.topLine1Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subheadline Size
              </label>
              <input
                type="range"
                name="topLine2Size"
                min="18"
                max="42"
                value={config.topLine2Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {config.topLine2Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Body Size
              </label>
              <input
                type="range"
                name="middleLine1Size"
                min="12"
                max="28"
                value={config.middleLine1Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {config.middleLine1Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accent Line Size
              </label>
              <input
                type="range"
                name="middleLine2Size"
                min="16"
                max="36"
                value={config.middleLine2Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {config.middleLine2Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Footer Title Size
              </label>
              <input
                type="range"
                name="footerNameSize"
                min="14"
                max="32"
                value={config.footerNameSize}
                onChange={handleInputChange}
                className="w-full mt-2 accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {config.footerNameSize}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Footer Meta Size
              </label>
              <input
                type="range"
                name="footerMetaSize"
                min="8"
                max="18"
                value={config.footerMetaSize}
                onChange={handleInputChange}
                className="w-full mt-2 accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {config.footerMetaSize}px
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Drag the headline, message box, and footer box directly on the poster
            preview.
          </p>
        </div>

        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Footer Details
          </h3>
          <input
            type="text"
            name="footerName"
            value={config.footerName}
            onChange={handleInputChange}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="text"
            name="footerTagline"
            value={config.footerTagline}
            onChange={handleInputChange}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              name="footerEmail"
              value={config.footerEmail}
              onChange={handleInputChange}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-[10px]"
            />
            <input
              type="text"
              name="footerPhone"
              value={config.footerPhone}
              onChange={handleInputChange}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-[10px]"
            />
            <input
              type="text"
              name="footerWeb"
              value={config.footerWeb}
              onChange={handleInputChange}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-[10px]"
            />
          </div>
        </div>

        <button
          onClick={() =>
            exportElement(posterRef, "SynoSys-Poster", setIsExporting)
          }
          disabled={isExporting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 sticky bottom-0"
        >
          <Download size={20} />
          {isExporting ? "Generating..." : "Download PNG"}
        </button>
      </div>

      <div className="flex items-center justify-center lg:sticky lg:top-8">
        <div
          ref={posterRef}
          className="w-full max-w-[480px] aspect-[4/5] bg-slate-900 relative overflow-hidden shadow-2xl rounded-[24px]"
          style={{
            backgroundImage: `url('${images.bg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0 z-0 bg-slate-900"
            style={{
              backgroundColor: `rgba(15, 23, 42, ${config.opacity / 100})`,
            }}
          ></div>
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]"></div>

          <div className="absolute top-8 left-8 z-20">
            <img
              src={images.logo}
              alt="Logo"
              className="h-10 w-auto object-contain bg-white/5 p-1 rounded-md"
            />
          </div>

          <div className="absolute top-8 right-8 z-20 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-bold text-white">
            AI Powered
          </div>

          <div
            onMouseDown={() => setDragTarget("headline")}
            className={`absolute z-20 w-[78%] cursor-move rounded-2xl px-3 py-2 ${
              dragTarget === "headline"
                ? "ring-2 ring-blue-400/70 bg-black/10"
                : "hover:bg-black/10"
            }`}
            style={{
              left: `${config.headlinePos.x}%`,
              top: `${config.headlinePos.y}%`,
              transform: "translate(-50%, 0)",
              ...sharedTextStyle,
            }}
          >
            <h2
              className="font-extrabold leading-[1.05] tracking-tight uppercase"
              style={{
                color: config.accentColor,
                fontSize: `${config.topLine1Size}px`,
              }}
            >
              {config.topLine1}
            </h2>
            <h3
              className="font-extrabold leading-[1.05] tracking-tight uppercase opacity-95 text-white"
              style={{ fontSize: `${config.topLine2Size}px` }}
            >
              {config.topLine2}
            </h3>
          </div>

          <div
            onMouseDown={() => setDragTarget("message")}
            className={`absolute z-20 w-[82%] cursor-move rounded-[18px] border border-white/10 bg-black/25 backdrop-blur-sm p-5 shadow-xl ${
              dragTarget === "message"
                ? "ring-2 ring-blue-400/70"
                : "hover:ring-1 hover:ring-white/20"
            }`}
            style={{
              left: `${config.messagePos.x}%`,
              top: `${config.messagePos.y}%`,
              transform: "translate(-50%, 0)",
              ...sharedTextStyle,
            }}
          >
            <p
              className="font-medium leading-relaxed text-white/90"
              style={{ fontSize: `${config.middleLine1Size}px` }}
            >
              {config.middleLine1}
            </p>
            <p
              className="mt-2 font-bold leading-tight text-white"
              style={{ fontSize: `${config.middleLine2Size}px` }}
            >
              {renderAccentText()}
            </p>
          </div>

          <div
            onMouseDown={() => setDragTarget("footer")}
            className={`absolute z-20 w-[62%] cursor-move rounded-[18px] border border-white/10 bg-white/10 backdrop-blur-md p-4 shadow-xl ${
              dragTarget === "footer"
                ? "ring-2 ring-blue-400/70"
                : "hover:ring-1 hover:ring-white/20"
            }`}
            style={{
              left: `${config.footerPos.x}%`,
              top: `${config.footerPos.y}%`,
              transform: "translate(-50%, 0)",
              ...sharedTextStyle,
            }}
          >
            <div
              className="font-extrabold tracking-tight text-white"
              style={{ fontSize: `${config.footerNameSize}px` }}
            >
              {config.footerName}
            </div>
            <div
              className="mt-1 text-white/70 font-medium uppercase tracking-wider"
              style={{ fontSize: `${Math.max(config.footerMetaSize - 1, 8)}px` }}
            >
              {config.footerTagline}
            </div>
            <div
              className="mt-2 space-y-0.5 font-semibold text-white/80"
              style={{ fontSize: `${config.footerMetaSize}px` }}
            >
              <div>Email: {config.footerEmail}</div>
              <div>Call: {config.footerPhone}</div>
              <div>Web: {config.footerWeb}</div>
            </div>
          </div>

          <div className="absolute right-5 bottom-5 z-20 bg-white p-1.5 rounded-lg shadow-2xl">
            <img src={images.qr} alt="QR" className="w-16 h-16 rounded-md" />
            <div className="text-[6px] text-center mt-1 font-bold text-slate-800 uppercase">
              Scan to Start
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
