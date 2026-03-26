import { Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  availableFontFamilies,
  defaultPosterConfigByVariant,
  defaultPosterElementsByVariant,
  defaultPosterImagesByVariant,
  defaultPosterVariant,
  horizontalPosterElementDefinitions,
  horizontalPosterElementOrder,
  posterStarterPresets,
  posterVariantDefinitions,
} from "../defaults";
import { useImageExport } from "../hooks/useImageExport";
import type {
  PosterConfig,
  PosterDraft,
  PosterElementId,
  PosterElementState,
  PosterImages,
  PosterTextAlign,
  PosterVariant,
} from "../types/platform";

type PosterDragTarget = "headline" | "message" | "footer" | null;

interface PosterCreatorProps {
  draft?: PosterDraft | null;
}

const resolvePosterVariant = (draft?: PosterDraft | null): PosterVariant =>
  draft?.variant ?? defaultPosterVariant;

const buildPosterConfig = (
  variant: PosterVariant,
  draft?: PosterDraft | null,
): PosterConfig => ({
  ...defaultPosterConfigByVariant[variant],
  ...draft?.config,
});

const buildPosterImages = (
  variant: PosterVariant,
  draft?: PosterDraft | null,
): PosterImages => ({
  ...defaultPosterImagesByVariant[variant],
  ...draft?.images,
});

const buildPosterElements = (
  variant: PosterVariant,
  overrides?: Partial<Record<PosterElementId, Partial<PosterElementState>>>,
) =>
  Object.entries(defaultPosterElementsByVariant[variant]).reduce<
    Partial<Record<PosterElementId, PosterElementState>>
  >((elements, [elementId, state]) => {
    const typedElementId = elementId as PosterElementId;
    const baseState = state as PosterElementState;

    elements[typedElementId] = {
      ...baseState,
      ...overrides?.[typedElementId],
    };

    return elements;
  }, {});

const getSharedVariantConfig = (config: PosterConfig): Partial<PosterConfig> => ({
  accentColor: config.accentColor,
  opacity: config.opacity,
  topLine1: config.topLine1,
  topLine2: config.topLine2,
  middleLine1: config.middleLine1,
  middleLine2: config.middleLine2,
  xBadgeText: config.xBadgeText,
  xInfoPanelEyebrow: config.xInfoPanelEyebrow,
  xInfoPanelTitle: config.xInfoPanelTitle,
  xInfoPanelBody: config.xInfoPanelBody,
  footerName: config.footerName,
  footerTagline: config.footerTagline,
  footerEmail: config.footerEmail,
  footerPhone: config.footerPhone,
  footerWeb: config.footerWeb,
  fontFamily: config.fontFamily,
  textAlign: config.textAlign,
});

const getBrandingConfig = (config: PosterConfig): Partial<PosterConfig> => ({
  accentColor: config.accentColor,
  opacity: config.opacity,
  footerName: config.footerName,
  footerTagline: config.footerTagline,
  footerEmail: config.footerEmail,
  footerPhone: config.footerPhone,
  footerWeb: config.footerWeb,
  fontFamily: config.fontFamily,
  textAlign: config.textAlign,
});

const buildVariantImages = (
  variant: PosterVariant,
  currentImages: PosterImages,
  overrides?: Partial<PosterImages>,
): PosterImages => ({
  ...defaultPosterImagesByVariant[variant],
  logo: currentImages.logo || defaultPosterImagesByVariant[variant].logo,
  qr: currentImages.qr || defaultPosterImagesByVariant[variant].qr,
  ...overrides,
});

export default function PosterCreator({ draft }: PosterCreatorProps) {
  const initialVariant = resolvePosterVariant(draft);
  const [variant, setVariant] = useState<PosterVariant>(initialVariant);
  const [config, setConfig] = useState<PosterConfig>(() =>
    buildPosterConfig(initialVariant, draft),
  );
  const [images, setImages] = useState<PosterImages>(() =>
    buildPosterImages(initialVariant, draft),
  );
  const [elements, setElements] = useState<
    Partial<Record<PosterElementId, PosterElementState>>
  >(() => buildPosterElements(initialVariant, draft?.elements));
  const [selectedElementId, setSelectedElementId] =
    useState<PosterElementId | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [dragTarget, setDragTarget] = useState<PosterDragTarget>(null);
  const posterRef = useRef<HTMLDivElement | null>(null);
  const { exportElement } = useImageExport();

  const layout = posterVariantDefinitions[variant];
  const presets = posterStarterPresets.filter(
    (preset) => preset.variant === variant,
  );
  const isHorizontalX = variant === "x-horizontal";
  const selectedElement = selectedElementId ? elements[selectedElementId] : null;
  const selectedElementDefinition =
    selectedElementId && isHorizontalX
      ? horizontalPosterElementDefinitions[selectedElementId]
      : null;

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setActivePresetId(null);
    setConfig((previous) => ({
      ...previous,
      [name]: name === "opacity" || name.endsWith("Size") ? Number(value) : value,
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

      setActivePresetId(null);
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
    const bounds = layout.dragBounds[target];
    const nextPosition = {
      x: Math.min(Math.max(x, bounds.xMin), bounds.xMax),
      y: Math.min(Math.max(y, bounds.yMin), bounds.yMax),
    };

    setActivePresetId(null);
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

  const selectElement = (elementId: PosterElementId) => {
    if (!isHorizontalX) {
      return;
    }

    setSelectedElementId(elementId);
  };

  const updateElementVisibility = (elementId: PosterElementId, visible: boolean) => {
    if (!isHorizontalX) {
      return;
    }

    setElements((previous) => {
      const target = previous[elementId];

      if (!target) {
        return previous;
      }

      return {
        ...previous,
        [elementId]: {
          ...target,
          visible,
        },
      };
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
  }, [dragTarget, layout]);

  const handleVariantChange = (nextVariant: PosterVariant) => {
    if (nextVariant === variant) {
      return;
    }

    setVariant(nextVariant);
    setActivePresetId(null);
    setSelectedElementId(null);
    setConfig({
      ...defaultPosterConfigByVariant[nextVariant],
      ...getSharedVariantConfig(config),
      textAlign: defaultPosterConfigByVariant[nextVariant].textAlign,
    });
    setImages(buildVariantImages(nextVariant, images));
    setElements(buildPosterElements(nextVariant));
  };

  const handlePresetApply = (presetId: string) => {
    const preset = posterStarterPresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setVariant(preset.variant);
    setActivePresetId(preset.id);
    setSelectedElementId(null);
    setConfig({
      ...defaultPosterConfigByVariant[preset.variant],
      ...getBrandingConfig(config),
      ...preset.config,
      textAlign: defaultPosterConfigByVariant[preset.variant].textAlign,
    });
    setImages(buildVariantImages(preset.variant, images, preset.images));
    setElements(
      buildPosterElements(
        preset.variant,
        preset.variant === variant ? elements : preset.elements,
      ),
    );
  };

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

  const exportFilename =
    variant === "x-horizontal"
      ? "SynoSys-X-Horizontal-Poster"
      : "SynoSys-Poster";

  const messageVisible = !isHorizontalX || elements["message-card"]?.visible;
  const footerVisible = !isHorizontalX || elements["footer-card"]?.visible;
  const qrVisible = !isHorizontalX || elements["qr-card"]?.visible;
  const accentPanelVisible = isHorizontalX && elements["accent-panel"]?.visible;
  const badgeVisible = isHorizontalX && elements.badge?.visible;
  const infoPanelVisible = isHorizontalX && elements["info-panel"]?.visible;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-card p-6 rounded-3xl shadow-xl border border-border space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Poster Creator</h2>
          <p className="text-muted-foreground text-sm">
            Build in the same editor, then switch between vertical Facebook /
            Instagram and horizontal X-ready layouts.
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary mt-3">
            {draft?.title ?? layout.label}
          </p>
        </div>

        <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Poster Mode
            </h3>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
              {layout.platformLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(
              Object.keys(posterVariantDefinitions) as PosterVariant[]
            ).map((optionId) => {
              const option = posterVariantDefinitions[optionId];

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVariantChange(option.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    variant === option.id
                      ? "border-primary/20 bg-primary/10"
                      : "bg-card hover:bg-accent/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-foreground">
                      {option.shortLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {option.platformLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Switching modes keeps your content and brand styling, then swaps in
            layout defaults sized for the selected platform.
          </p>
        </div>

        <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Starter Presets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetApply(preset.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  activePresetId === preset.id
                    ? "border-primary/20 bg-primary/10"
                    : "bg-card hover:bg-accent/60"
                }`}
              >
                <p className="font-bold text-foreground">{preset.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {isHorizontalX && (
          <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
            <div>
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                X Layout Elements
              </h3>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Click a visible card on the poster or pick it here, then remove
                or restore optional X-only elements without touching the vertical
                templates.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {horizontalPosterElementOrder.map((elementId) => {
                const state = elements[elementId];
                const definition = horizontalPosterElementDefinitions[elementId];

                if (!state) {
                  return null;
                }

                return (
                  <button
                    key={elementId}
                    type="button"
                    onClick={() => setSelectedElementId(elementId)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selectedElementId === elementId
                        ? "border-primary/20 bg-primary/10"
                        : state.visible
                          ? "bg-card hover:bg-accent/60"
                          : "border-dashed bg-background/70 hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">
                        {definition.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {state.visible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {definition.description}
                    </p>
                  </button>
                );
              })}
            </div>
            {selectedElement && selectedElementDefinition && (
              <div className="rounded-2xl border border-border bg-card/80 p-4 space-y-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Selected Element
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    {selectedElementDefinition.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedElementDefinition.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedElement.visible && selectedElement.removable && (
                    <button
                      type="button"
                      onClick={() =>
                        selectedElementId &&
                        updateElementVisibility(selectedElementId, false)
                      }
                      className="button-secondary px-4 py-3 text-sm font-bold"
                    >
                      <Trash2 size={16} />
                      Remove Selected
                    </button>
                  )}
                  {!selectedElement.visible && (
                    <button
                      type="button"
                      onClick={() =>
                        selectedElementId &&
                        updateElementVisibility(selectedElementId, true)
                      }
                      className="button-secondary px-4 py-3 text-sm font-bold"
                    >
                      Restore Selected
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedElementId(null)}
                    className="button-secondary px-4 py-3 text-sm font-bold"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isHorizontalX && (
          <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
            <div>
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                X Right-Side Copy
              </h3>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Edit the top badge and right-side card text independently from
                the main message card.
              </p>
            </div>
            <input
              type="text"
              name="xBadgeText"
              value={config.xBadgeText}
              onChange={handleInputChange}
              placeholder="Top badge text"
              className="input-base rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="xInfoPanelEyebrow"
              value={config.xInfoPanelEyebrow}
              onChange={handleInputChange}
              placeholder="Side card label"
              className="input-base rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="xInfoPanelTitle"
              value={config.xInfoPanelTitle}
              onChange={handleInputChange}
              placeholder="Side card headline"
              className="input-base rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              name="xInfoPanelBody"
              value={config.xInfoPanelBody}
              onChange={handleInputChange}
              placeholder="Side card supporting text"
              rows={2}
              className="input-base rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Asset Uploads
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                Logo
              </label>
              <input
                type="file"
                onChange={(event) => handleImageUpload(event, "logo")}
                className="text-xs block w-full file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-2 file:py-1"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">
                QR Code
              </label>
              <input
                type="file"
                onChange={(event) => handleImageUpload(event, "qr")}
                className="text-xs block w-full file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-2 file:py-1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              Background Image
            </label>
            <input
              type="file"
              onChange={(event) => handleImageUpload(event, "bg")}
              className="text-xs block w-full file:bg-slate-950 file:text-white file:border-0 file:rounded-md file:px-2 file:py-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Content & Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
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
              <label className="block text-xs font-bold text-foreground mb-1">
                Dim Overlay
              </label>
              <input
                type="range"
                name="opacity"
                min="0"
                max="100"
                value={config.opacity}
                onChange={handleInputChange}
                className="w-full mt-3 accent-primary"
              />
            </div>
          </div>
          <input
            type="text"
            name="topLine1"
            value={config.topLine1}
            onChange={handleInputChange}
            placeholder="Headline 1"
            className="input-base rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="topLine2"
            value={config.topLine2}
            onChange={handleInputChange}
            placeholder="Headline 2"
            className="input-base rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            name="middleLine1"
            value={config.middleLine1}
            onChange={handleInputChange}
            placeholder="Main Message"
            rows={2}
            className="input-base rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="middleLine2"
            value={config.middleLine2}
            onChange={handleInputChange}
            placeholder="Accent Message"
            className="input-base rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Typography & Layout
          </h3>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Font Family
            </label>
            <select
              name="fontFamily"
              value={config.fontFamily}
              onChange={(event) => {
                setActivePresetId(null);
                setConfig((previous) => ({
                  ...previous,
                  fontFamily: event.target.value,
                }));
              }}
              className="input-base rounded-lg px-3 py-2 text-sm bg-card"
            >
              {availableFontFamilies.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Text Align
            </label>
            <div className="flex bg-card rounded-xl p-1 border border-border">
              {(["left", "center", "right"] as PosterTextAlign[]).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => {
                    setActivePresetId(null);
                    setConfig((previous) => ({ ...previous, textAlign: align }));
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    config.textAlign === align
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {align[0].toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Headline Size
              </label>
              <input
                type="range"
                name="topLine1Size"
                min="24"
                max="64"
                value={config.topLine1Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {config.topLine1Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Subheadline Size
              </label>
              <input
                type="range"
                name="topLine2Size"
                min="18"
                max="42"
                value={config.topLine2Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {config.topLine2Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Body Size
              </label>
              <input
                type="range"
                name="middleLine1Size"
                min="12"
                max="28"
                value={config.middleLine1Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {config.middleLine1Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Accent Line Size
              </label>
              <input
                type="range"
                name="middleLine2Size"
                min="16"
                max="36"
                value={config.middleLine2Size}
                onChange={handleInputChange}
                className="w-full mt-2 accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {config.middleLine2Size}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Footer Title Size
              </label>
              <input
                type="range"
                name="footerNameSize"
                min="14"
                max="32"
                value={config.footerNameSize}
                onChange={handleInputChange}
                className="w-full mt-2 accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {config.footerNameSize}px
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Footer Meta Size
              </label>
              <input
                type="range"
                name="footerMetaSize"
                min="8"
                max="18"
                value={config.footerMetaSize}
                onChange={handleInputChange}
                className="w-full mt-2 accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {config.footerMetaSize}px
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Drag the headline, message box, and footer box directly on the live
            poster preview.
          </p>
        </div>

        <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Footer Details
          </h3>
          <input
            type="text"
            name="footerName"
            value={config.footerName}
            onChange={handleInputChange}
            className="input-base rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="footerTagline"
            value={config.footerTagline}
            onChange={handleInputChange}
            className="input-base rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              name="footerEmail"
              value={config.footerEmail}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] text-foreground"
            />
            <input
              type="text"
              name="footerPhone"
              value={config.footerPhone}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] text-foreground"
            />
            <input
              type="text"
              name="footerWeb"
              value={config.footerWeb}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] text-foreground"
            />
          </div>
        </div>

        <button
          onClick={() =>
            exportElement(posterRef, exportFilename, setIsExporting)
          }
          disabled={isExporting}
          className="button-primary sticky bottom-0 w-full py-4 font-bold shadow-lg"
        >
          <Download size={20} />
          {isExporting ? "Generating..." : "Download PNG"}
        </button>
      </div>

      <div className="flex items-center justify-center lg:sticky lg:top-8">
        <div
          ref={posterRef}
          onMouseDown={() => isHorizontalX && setSelectedElementId(null)}
          className="w-full bg-slate-950 relative overflow-hidden shadow-2xl rounded-[24px]"
          style={{
            maxWidth: `${layout.previewMaxWidth}px`,
            aspectRatio: `${layout.canvas.width} / ${layout.canvas.height}`,
            backgroundImage: `url('${images.bg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0 z-0 bg-slate-950"
            style={{
              backgroundColor: `rgba(15, 23, 42, ${config.opacity / 100})`,
            }}
          ></div>
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]"></div>

          {accentPanelVisible && (
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
                selectElement("accent-panel");
              }}
              className={`absolute inset-y-0 right-0 z-10 w-[34%] cursor-pointer transition ${
                selectedElementId === "accent-panel"
                  ? "ring-2 ring-blue-400/70 ring-inset"
                  : ""
              }`}
            >
              <div className="absolute inset-y-0 right-0 w-full bg-[linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.42))]"></div>
              <div className="absolute right-[26%] top-[12%] h-[68%] w-px bg-white/10"></div>
              <div
                className="absolute right-[8%] top-[18%] h-[34%] w-[18%] rounded-full blur-3xl"
                style={{ backgroundColor: `${config.accentColor}33` }}
              ></div>
              <div
                className="absolute right-[12%] bottom-[12%] h-[28%] w-[16%] rounded-full blur-[72px]"
                style={{ backgroundColor: `${config.accentColor}1A` }}
              ></div>
            </div>
          )}

          {infoPanelVisible && (
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
                selectElement("info-panel");
              }}
              className={`absolute right-[7%] top-[18%] z-20 w-[21%] min-w-[150px] cursor-pointer rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-md transition ${
                selectedElementId === "info-panel"
                  ? "ring-2 ring-blue-400/70"
                  : "hover:ring-1 hover:ring-white/20"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-white/[0.55]">
                {config.xInfoPanelEyebrow}
              </p>
              <p className="mt-3 text-sm font-bold leading-tight text-white">
                {config.xInfoPanelTitle}
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-white/[0.72]">
                {config.xInfoPanelBody}
              </p>
            </div>
          )}

          <div className="absolute top-8 left-8 z-20">
            <img
              src={images.logo}
              alt="Logo"
              className="w-auto object-contain bg-card/5 p-1 rounded-md"
              style={{ height: `${layout.logoHeight}px` }}
            />
          </div>

          {badgeVisible && (
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
                selectElement("badge");
              }}
              className={`absolute top-8 right-8 z-20 cursor-pointer rounded-full border border-white/20 bg-card/10 px-3 py-1 text-[9px] uppercase tracking-widest font-bold text-white backdrop-blur-md transition ${
                selectedElementId === "badge"
                  ? "ring-2 ring-blue-400/70"
                  : "hover:ring-1 hover:ring-white/20"
              }`}
            >
              {config.xBadgeText}
            </div>
          )}

          <div
            onMouseDown={(event) => {
              event.stopPropagation();
              setDragTarget("headline");
            }}
            className={`absolute z-20 cursor-move rounded-2xl px-3 py-2 ${
              dragTarget === "headline"
                ? "ring-2 ring-blue-400/70 bg-black/10"
                : "hover:bg-black/10"
            }`}
            style={{
              width: `${layout.headlineWidth}%`,
              left: `${config.headlinePos.x}%`,
              top: `${config.headlinePos.y}%`,
              transform: "translate(-50%, 0)",
              ...sharedTextStyle,
            }}
          >
            <h2
              className={`font-extrabold tracking-tight uppercase ${
                isHorizontalX ? "leading-[1.02]" : "leading-[1.05]"
              }`}
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

          {messageVisible && (
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
                selectElement("message-card");
                setDragTarget("message");
              }}
              className={`absolute z-20 cursor-move rounded-[20px] border p-5 shadow-xl transition ${
                isHorizontalX
                  ? "border-white/10 bg-black/[0.18] backdrop-blur-md"
                  : "border-white/10 bg-black/25 backdrop-blur-sm"
              } ${
                dragTarget === "message"
                  ? "ring-2 ring-blue-400/70"
                  : selectedElementId === "message-card"
                    ? "ring-2 ring-blue-400/[0.45]"
                    : "hover:ring-1 hover:ring-white/20"
              }`}
              style={{
                width: `${layout.messageWidth}%`,
                left: `${config.messagePos.x}%`,
                top: `${config.messagePos.y}%`,
                transform: "translate(-50%, 0)",
                ...sharedTextStyle,
              }}
            >
              <p
                className={`font-medium leading-relaxed ${
                  isHorizontalX ? "text-white/[0.88]" : "text-white/90"
                }`}
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
          )}

          {footerVisible && (
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
                selectElement("footer-card");
                setDragTarget("footer");
              }}
              className={`absolute z-20 cursor-move rounded-[20px] border p-4 shadow-xl transition ${
                isHorizontalX
                  ? "border-white/10 bg-card/[0.08] backdrop-blur-md"
                  : "border-white/10 bg-card/10 backdrop-blur-md"
              } ${
                dragTarget === "footer"
                  ? "ring-2 ring-blue-400/70"
                  : selectedElementId === "footer-card"
                    ? "ring-2 ring-blue-400/[0.45]"
                    : "hover:ring-1 hover:ring-white/20"
              }`}
              style={{
                width: `${layout.footerWidth}%`,
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
                className={`mt-1 font-medium uppercase tracking-wider ${
                  isHorizontalX ? "text-white/[0.68]" : "text-white/70"
                }`}
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
          )}

          {qrVisible && (
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
                selectElement("qr-card");
              }}
              className={`absolute right-5 bottom-5 z-20 cursor-pointer rounded-lg bg-card p-1.5 shadow-2xl transition ${
                selectedElementId === "qr-card"
                  ? "ring-2 ring-blue-400/70"
                  : isHorizontalX
                    ? "hover:ring-1 hover:ring-white/20"
                    : ""
              }`}
            >
              <img
                src={images.qr}
                alt="QR"
                className="rounded-md"
                style={{ width: `${layout.qrSize}px`, height: `${layout.qrSize}px` }}
              />
              <div className="text-[6px] text-center mt-1 font-bold text-slate-900 uppercase">
                {layout.qrCaption}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
