"use client";

import { Player } from "@remotion/player";
import { Film } from "lucide-react";
import { useMemo } from "react";
import type { VideoComposition } from "../../types/videoEditor";
import { getTimelineDuration } from "../../lib/videoEditor/compositionMath";
import { PreviewComposition } from "./PreviewComposition";

interface PreviewPanelProps {
  composition: VideoComposition | null;
}

export default function PreviewPanel({ composition }: PreviewPanelProps) {
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

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-border bg-black">
      <Player
        component={PreviewComposition}
        inputProps={{ composition }}
        durationInFrames={durationInFrames}
        compositionWidth={composition.width}
        compositionHeight={composition.height}
        fps={composition.fps}
        controls
        loop
        style={{ width: "100%", aspectRatio: `${composition.width} / ${composition.height}` }}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
