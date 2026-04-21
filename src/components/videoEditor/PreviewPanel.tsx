"use client";

import { Player } from "@remotion/player";
import { Edit3, Film, Sparkles } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { VideoComposition } from "../../types/videoEditor";
import { getTimelineDuration } from "../../lib/videoEditor/compositionMath";
import { PreviewComposition } from "./PreviewComposition";

interface PreviewPanelProps {
  composition: VideoComposition | null;
  /** If set, shows the final rendered MP4 instead of the live composition preview. */
  renderedUrl?: string | null;
}

type ViewMode = "composition" | "rendered";

export default function PreviewPanel({
  composition,
  renderedUrl,
}: PreviewPanelProps) {
  const [mode, setMode] = useState<ViewMode>("composition");

  // When a new render finishes, auto-switch to show it so the user sees
  // the actual exported video (edits baked in).
  /* eslint-disable react-hooks/set-state-in-effect -- auto-switch on new render URL is intentional */
  useEffect(() => {
    if (renderedUrl) setMode("rendered");
  }, [renderedUrl]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const durationInFrames = useMemo(() => {
    if (!composition) return 30;
    const seconds = getTimelineDuration(composition);
    return Math.max(Math.round(seconds * composition.fps), 30);
  }, [composition]);

  if (!composition) {
    return (
      <div className="surface-card flex h-full min-h-[500px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Film size={28} />
        </div>
        <p className="text-sm font-bold text-muted-foreground">Preview appears here</p>
        <p className="text-xs text-muted-foreground">
          Upload a video and chat with Claude to get started
        </p>
      </div>
    );
  }

  const showRendered = mode === "rendered" && renderedUrl;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border">
      {/* View toggle — only appears once a render exists */}
      {renderedUrl && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {showRendered ? "Rendered output" : "Live composition"}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode("composition")}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                mode === "composition"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Edit3 size={12} /> Composition
            </button>
            <button
              type="button"
              onClick={() => setMode("rendered")}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                mode === "rendered"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Sparkles size={12} /> Rendered MP4
            </button>
          </div>
        </div>
      )}

      {/*
        Fit-to-screen strategy for tall (9:16) reel videos:
        - Outer: fixed viewport-based height (70vh, capped at 720px).
          Full column width, black letterbox background.
        - Inner: preserves aspect ratio via height=100% + aspect-ratio.
          max-width: 100% lets it shrink if the column is narrower than the
          aspect-ratio-derived width (browser collapses height to maintain ratio).
      */}
      <div
        className="flex items-center justify-center overflow-hidden bg-black"
        style={{ height: "min(55vh, 560px)" }}
      >
        <div
          style={{
            height: "100%",
            aspectRatio: `${composition.width} / ${composition.height}`,
            maxWidth: "100%",
          }}
        >
          {showRendered ? (
            <video
              key={renderedUrl}
              src={renderedUrl!}
              controls
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <Player
              component={PreviewComposition}
              inputProps={{ composition }}
              durationInFrames={durationInFrames}
              compositionWidth={composition.width}
              compositionHeight={composition.height}
              fps={composition.fps}
              controls
              loop
              style={{ width: "100%", height: "100%" }}
              acknowledgeRemotionLicense
            />
          )}
        </div>
      </div>
    </div>
  );
}
