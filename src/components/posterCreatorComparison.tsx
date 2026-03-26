import { BadgeCheck } from "lucide-react";
import type { ChangeEvent, CSSProperties } from "react";
import type {
  ComparisonBulletItem,
  ComparisonIconId,
  PosterConfig,
  PosterImages,
} from "../types/platform";
import {
  colorWithAlpha,
  comparisonIconMap,
  comparisonIconOptions,
  type ComparisonSide,
} from "./posterCreatorComparisonUtils";

const splitComparisonHeadline = (headline: string) => {
  const words = headline.trim().split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return { leading: headline, accent: "" };
  }

  return {
    leading: words.slice(0, -1).join(" "),
    accent: words.at(-1) ?? "",
  };
};

interface ComparisonBulletEditorProps {
  bullets: ComparisonBulletItem[];
  side: ComparisonSide;
  iconColor: string;
  onAdd: () => void;
  onRemove: (bulletId: string) => void;
  onTextChange: (bulletId: string, text: string) => void;
  onIconChange: (bulletId: string, icon: ComparisonIconId) => void;
  onUpload: (bulletId: string, event: ChangeEvent<HTMLInputElement>) => void;
  onResetCustomIcon: (bulletId: string) => void;
}

export function ComparisonBulletEditor({
  bullets,
  side,
  iconColor,
  onAdd,
  onRemove,
  onTextChange,
  onIconChange,
  onUpload,
  onResetCustomIcon,
}: ComparisonBulletEditorProps) {
  const title = side === "left" ? "Left Panel Bullets" : "Right Panel Bullets";

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit copy, swap the Lucide icon, or upload a custom icon for each row.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="button-secondary px-4 py-2 text-xs font-bold"
        >
          Add Row
        </button>
      </div>

      {bullets.map((bullet, index) => {
        const Icon = comparisonIconMap[bullet.icon] ?? BadgeCheck;

        return (
          <div
            key={bullet.id}
            className="rounded-2xl border border-border bg-background/80 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.26em] text-muted-foreground">
                Row {index + 1}
              </p>
              <button
                type="button"
                onClick={() => onRemove(bullet.id)}
                disabled={bullets.length <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </div>

            <input
              type="text"
              value={bullet.text}
              onChange={(event) => onTextChange(bullet.id, event.target.value)}
              className="input-base rounded-lg px-3 py-2 text-sm"
              placeholder="Bullet text"
            />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Icon
                </label>
                <select
                  value={bullet.icon}
                  onChange={(event) =>
                    onIconChange(bullet.id, event.target.value as ComparisonIconId)
                  }
                  className="input-base rounded-lg px-3 py-2 text-sm bg-card"
                >
                  {comparisonIconOptions.map((iconOption) => (
                    <option key={iconOption.id} value={iconOption.id}>
                      {iconOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-2">
                {bullet.customIcon ? (
                  <img
                    src={bullet.customIcon}
                    alt=""
                    className="h-8 w-8 rounded-md object-contain"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-md"
                    style={{ backgroundColor: colorWithAlpha(iconColor, 0.16) }}
                  >
                    <Icon size={18} style={{ color: iconColor }} />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Custom Icon
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onUpload(bullet.id, event)}
                    className="text-[11px] block w-full file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-2 file:py-1"
                  />
                </div>
                {bullet.customIcon && (
                  <button
                    type="button"
                    onClick={() => onResetCustomIcon(bullet.id)}
                    className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:bg-accent/60"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ComparisonPosterPreviewProps {
  config: PosterConfig;
  images: PosterImages;
  layout: {
    headlineWidth: number;
    messageWidth: number;
    footerWidth: number;
  };
  sharedTextStyle: CSSProperties;
  dragTarget: "headline" | "message" | "footer" | "logo" | null;
  setDragTarget: (target: "headline" | "message" | "footer" | "logo") => void;
}

export function ComparisonPosterPreview({
  config,
  images,
  layout,
  sharedTextStyle,
  dragTarget,
  setDragTarget,
}: ComparisonPosterPreviewProps) {
  const { leading, accent } = splitComparisonHeadline(config.comparisonHeadline);
  const textGlowBlur = config.comparisonTextGlowIntensity;
  const depthOffset = config.comparisonTextDepth;
  const depthColor = `rgba(0, 0, 0, ${config.comparisonTextDepthOpacity / 100})`;
  const buildTextShadow = (
    glowColor: string,
    glowMultiplier = 1,
    depthMultiplier = 1,
  ) =>
    [
      `${Math.max(depthOffset * depthMultiplier, 0)}px ${Math.max(
        depthOffset * depthMultiplier,
        0,
      )}px 0 ${depthColor}`,
      `0 0 ${Math.max(textGlowBlur * glowMultiplier, 0)}px ${colorWithAlpha(
        glowColor,
        0.42,
      )}`,
      `0 8px 18px rgba(0,0,0,0.22)`,
    ].join(", ");
  const dividerOpacity =
    config.comparisonDividerStyle === "solid"
      ? 0.72
      : config.comparisonDividerStyle === "glow"
        ? 0.9
        : 0.42;
  const dividerShadow =
    config.comparisonDividerStyle === "glow"
      ? `0 0 18px ${colorWithAlpha(config.comparisonDividerColor, 0.42)}`
      : "none";
  const dividerColor = colorWithAlpha(config.comparisonDividerColor, dividerOpacity);
  const dividerX = `${config.comparisonDividerX}%`;
  const leftWidth = `${config.comparisonDividerX}%`;
  const rightWidth = `${100 - config.comparisonDividerX}%`;
  const panelBottom = `${config.comparisonPanelBottomInset}%`;
  const showDividers = config.comparisonShowDividers;

  const renderBulletList = (
    bullets: ComparisonBulletItem[],
    side: ComparisonSide,
  ) => (
    <div
      className="mt-8 flex flex-col"
      style={{ gap: `${config.comparisonRowGap}px` }}
    >
      {bullets.map((bullet) => {
        const Icon = comparisonIconMap[bullet.icon] ?? BadgeCheck;
        const iconColor =
          side === "left"
            ? config.comparisonLeftIconColor
            : config.comparisonRightIconColor;

        return (
          <div key={bullet.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center justify-center">
                {bullet.customIcon ? (
                  <img
                    src={bullet.customIcon}
                    alt=""
                    className="object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.26)]"
                    style={{
                      width: `${config.comparisonIconSize}px`,
                      height: `${config.comparisonIconSize}px`,
                    }}
                  />
                ) : (
                  <Icon
                    size={config.comparisonIconSize}
                    style={{
                      color: iconColor,
                      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.26))",
                    }}
                  />
                )}
              </div>
              <p
                className="font-bold leading-tight"
                style={{
                  color: config.comparisonTextColor,
                  fontSize: `${config.comparisonBulletSize}px`,
                  textShadow: buildTextShadow(config.comparisonTextGlowColor, 0.45, 0.75),
                }}
              >
                {bullet.text}
              </p>
            </div>
            {showDividers && (
              <div
                className="h-px w-full"
                style={{
                  backgroundColor: dividerColor,
                  boxShadow: dividerShadow,
                }}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 22%, transparent 72%, rgba(0,0,0,0.18) 100%)",
        }}
      ></div>
      <div
        className="absolute inset-x-0 top-0 z-10 h-[26%]"
        style={{
          background: `linear-gradient(180deg, ${colorWithAlpha(
            config.backgroundColor,
            0.72,
          )} 0%, ${colorWithAlpha(config.backgroundColor, 0.38)} 100%)`,
        }}
      ></div>
      {config.comparisonShowLeftGlow && (
        <div
          className="absolute z-20 rounded-full blur-3xl"
          style={{
            left: `${config.comparisonLeftGlowX}%`,
            top: `${config.comparisonLeftGlowY}%`,
            width: `${config.comparisonLeftGlowSize}%`,
            height: `${config.comparisonLeftGlowSize}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: colorWithAlpha(
              config.comparisonLeftGlowColor,
              config.comparisonLeftGlowOpacity / 100,
            ),
          }}
        ></div>
      )}
      {config.comparisonShowRightGlow && (
        <div
          className="absolute z-20 rounded-full blur-3xl"
          style={{
            left: `${config.comparisonRightGlowX}%`,
            top: `${config.comparisonRightGlowY}%`,
            width: `${config.comparisonRightGlowSize}%`,
            height: `${config.comparisonRightGlowSize}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: colorWithAlpha(
              config.comparisonRightGlowColor,
              config.comparisonRightGlowOpacity / 100,
            ),
          }}
        ></div>
      )}
      {config.comparisonShowLeftPanel && (
        <div
          className="absolute left-0 top-[26%] z-10"
          style={{
            width: leftWidth,
            bottom: panelBottom,
            background: `linear-gradient(180deg, ${colorWithAlpha(
              config.comparisonLeftPanelColor,
              config.comparisonLeftPanelOpacity / 100,
            )} 0%, ${colorWithAlpha(
              config.comparisonLeftPanelColor,
              Math.max(config.comparisonLeftPanelOpacity / 100 - 0.12, 0),
            )} 100%)`,
          }}
        >
          {images.comparisonLeftBg && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${images.comparisonLeftBg}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "screen",
                opacity: 0.42,
              }}
            ></div>
          )}
        </div>
      )}
      {config.comparisonShowRightPanel && (
        <div
          className="absolute right-0 top-[26%] z-10"
          style={{
            width: rightWidth,
            bottom: panelBottom,
            background: `linear-gradient(180deg, ${colorWithAlpha(
              config.comparisonRightPanelColor,
              config.comparisonRightPanelOpacity / 100,
            )} 0%, ${colorWithAlpha(
              config.comparisonRightPanelColor,
              Math.max(config.comparisonRightPanelOpacity / 100 - 0.12, 0),
            )} 100%)`,
          }}
        >
          {images.comparisonRightBg && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${images.comparisonRightBg}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "screen",
                opacity: 0.42,
              }}
            ></div>
          )}
        </div>
      )}
      {config.comparisonShowSupportPanel && (
        <div
          className="absolute inset-x-0 bottom-0 z-10 h-[24%]"
          style={{
            background: `linear-gradient(180deg, ${colorWithAlpha(
              config.comparisonSupportPanelColor,
              Math.max(config.comparisonSupportPanelOpacity / 100 - 0.42, 0),
            )} 0%, ${colorWithAlpha(
              config.comparisonSupportPanelColor,
              config.comparisonSupportPanelOpacity / 100,
            )} 100%)`,
          }}
        >
          {images.comparisonSupportBg && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${images.comparisonSupportBg}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "screen",
                opacity: 0.36,
              }}
            ></div>
          )}
        </div>
      )}
      {showDividers && (
        <>
          <div
            className="absolute top-[26%] z-20 w-px -translate-x-1/2"
            style={{
              left: dividerX,
              bottom: panelBottom,
              backgroundColor: dividerColor,
              boxShadow: dividerShadow,
            }}
          ></div>
          <div
            className="absolute inset-x-[8%] top-[12.5%] z-20 h-px"
            style={{ backgroundColor: dividerColor, boxShadow: dividerShadow }}
          ></div>
          <div
            className="absolute inset-x-[8%] top-[62.8%] z-20 h-px"
            style={{ backgroundColor: dividerColor, boxShadow: dividerShadow }}
          ></div>
          <div
            className="absolute inset-x-[8%] bottom-[14.8%] z-20 h-px"
            style={{ backgroundColor: dividerColor, boxShadow: dividerShadow }}
          ></div>
        </>
      )}
      <div
        className="absolute left-[14%] top-[8%] z-20 h-20 w-20 rounded-full blur-3xl"
        style={{ backgroundColor: colorWithAlpha(config.comparisonLeftPanelColor, 0.28) }}
      ></div>
      <div
        className="absolute right-[14%] top-[8%] z-20 h-20 w-20 rounded-full blur-3xl"
        style={{ backgroundColor: colorWithAlpha(config.comparisonRightPanelColor, 0.28) }}
      ></div>
      <div
        className="absolute left-1/2 top-[6.5%] z-20 h-14 w-[28%] -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: colorWithAlpha(config.accentColor, 0.34) }}
      ></div>

      <div
        onMouseDown={(event) => {
          event.stopPropagation();
          setDragTarget("headline");
        }}
        className={`absolute z-30 cursor-move rounded-2xl px-3 py-2 ${
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
          className="font-black tracking-tight leading-none"
          style={{
            color: config.comparisonHeadlineColor,
            fontSize: `${config.comparisonHeadlineSize}px`,
            textShadow: buildTextShadow(config.comparisonTextGlowColor, 1.3, 1.15),
          }}
        >
          {leading}
          {accent ? (
            <>
              {" "}
              <span style={{ color: config.accentColor }}>{accent}</span>
            </>
          ) : null}
        </h2>
      </div>

      <div className="absolute inset-x-[7%] top-[29.5%] bottom-[34.5%] z-30 pointer-events-none">
        <div
          className="absolute top-0 bottom-0"
          style={{ left: 0, width: `calc(${leftWidth} - 2.5%)` }}
        >
          <div className="text-center">
            <h3
              className="font-black italic"
              style={{
                color: config.comparisonTextColor,
                fontSize: `${config.comparisonTitleSize}px`,
                textShadow: buildTextShadow(config.comparisonTextGlowColor, 0.85),
              }}
            >
              {config.comparisonLeftTitle}
            </h3>
            {showDividers && (
              <div
                className="mx-auto mt-2 h-px w-[64%]"
                style={{
                  backgroundColor: dividerColor,
                  boxShadow: dividerShadow,
                }}
              ></div>
            )}
          </div>
          {renderBulletList(config.comparisonLeftBullets, "left")}
        </div>

        <div
          className="absolute top-0 bottom-0"
          style={{ right: 0, width: `calc(${rightWidth} - 2.5%)` }}
        >
          <div className="text-center">
            <h3
              className="font-black italic"
              style={{
                color: config.comparisonTextColor,
                fontSize: `${config.comparisonTitleSize}px`,
                textShadow: buildTextShadow(config.comparisonTextGlowColor, 0.85),
              }}
            >
              {config.comparisonRightTitle}
            </h3>
            {showDividers && (
              <div
                className="mx-auto mt-2 h-px w-[64%]"
                style={{
                  backgroundColor: dividerColor,
                  boxShadow: dividerShadow,
                }}
              ></div>
            )}
          </div>
          {renderBulletList(config.comparisonRightBullets, "right")}
        </div>
      </div>

      <div
        onMouseDown={(event) => {
          event.stopPropagation();
          setDragTarget("message");
        }}
        className={`absolute z-30 cursor-move rounded-2xl px-4 py-3 ${
          dragTarget === "message"
            ? "ring-2 ring-blue-400/70 bg-black/10"
            : "hover:bg-black/10"
        }`}
        style={{
          width: `${layout.messageWidth}%`,
          left: `${config.messagePos.x}%`,
          top: `${config.messagePos.y}%`,
          transform: "translate(-50%, 0)",
          ...sharedTextStyle,
        }}
      >
        {config.comparisonShowSupportBackplate && (
          <div
            className="absolute left-1/2 top-1/2 -z-10 rounded-full"
            style={{
              width: `${config.comparisonSupportBackplateWidth}%`,
              height: `${config.comparisonSupportBackplateHeight * 10}px`,
              transform: "translate(-50%, -50%)",
              backgroundColor: colorWithAlpha(
                config.comparisonSupportBackplateColor,
                config.comparisonSupportBackplateOpacity / 100,
              ),
              filter: `blur(${config.comparisonSupportBackplateBlur}px)`,
            }}
          ></div>
        )}
        <p
          className="font-black italic leading-none"
          style={{
            color: config.comparisonTextColor,
            fontSize: `${config.comparisonSupportSize}px`,
            textShadow: buildTextShadow(config.comparisonTextGlowColor, 1.05, 1),
          }}
        >
          {config.comparisonSupportText}
        </p>
      </div>

      <div
        onMouseDown={(event) => {
          event.stopPropagation();
          setDragTarget("footer");
        }}
        className={`absolute z-30 cursor-move rounded-3xl px-4 py-3 ${
          dragTarget === "footer"
            ? "ring-2 ring-blue-400/70 bg-black/10"
            : "hover:bg-black/10"
        }`}
        style={{
          width: `${layout.footerWidth}%`,
          left: `${config.footerPos.x}%`,
          top: `${config.footerPos.y}%`,
          transform: "translate(-50%, 0)",
          ...sharedTextStyle,
        }}
      >
        <p
          className="font-black tracking-tight leading-none"
          style={{
            color: config.comparisonTextColor,
            fontSize: `${config.comparisonWebsiteSize}px`,
            textShadow: buildTextShadow(config.comparisonTextGlowColor, 1.1, 1.05),
          }}
        >
          {config.comparisonWebsiteText}
        </p>
        <p
          className="mt-2 font-bold"
          style={{
            color: config.comparisonMutedTextColor,
            fontSize: `${config.comparisonBusinessNameSize}px`,
            textShadow: buildTextShadow(config.comparisonTextGlowColor, 0.4, 0.65),
          }}
        >
          {config.comparisonBusinessName}
        </p>
      </div>

      <div
        onMouseDown={(event) => {
          event.stopPropagation();
          setDragTarget("logo");
        }}
        className={`absolute z-30 cursor-move rounded-2xl px-3 py-2 ${
          dragTarget === "logo"
            ? "ring-2 ring-blue-400/70 bg-black/10"
            : "hover:bg-black/10"
        }`}
        style={{
          left: `${config.logoPos.x}%`,
          top: `${config.logoPos.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {images.logo ? (
          <img
            src={images.logo}
            alt="Business logo"
            className="w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
            style={{ height: `${config.logoSize}px` }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.28em]"
            style={{
              height: `${config.logoSize}px`,
              minWidth: `${config.logoSize * 1.6}px`,
              color: config.comparisonTextColor,
              borderColor: colorWithAlpha(config.comparisonDividerColor, 0.4),
              backgroundColor: colorWithAlpha(config.comparisonSupportPanelColor, 0.38),
            }}
          >
            Business Logo
          </div>
        )}
      </div>
    </>
  );
}
