"use client";

import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  CaptionOperation,
  TitleOperation,
  VideoComposition,
  ZoomOperation,
} from "../../types/videoEditor";
import {
  computeTimeline,
  getStartTitleDuration,
} from "../../lib/videoEditor/compositionMath";

const ACCENT = "#f59e0b";

const TitleCardBlock: React.FC<{
  op: TitleOperation;
  fps: number;
  durationInFrames: number;
}> = ({ op, fps, durationInFrames }) => {
  const frame = useCurrentFrame();
  const titleIn = spring({ frame, fps, config: { damping: 80, stiffness: 200 }, delay: 5 });
  const lineIn = spring({ frame, fps, config: { damping: 60, stiffness: 150 }, delay: 10 });
  const subIn = spring({ frame, fps, config: { damping: 80, stiffness: 200 }, delay: 15 });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#fff",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            transform: `translateY(${interpolate(titleIn, [0, 1], [40, 0])}px)`,
            opacity: titleIn,
          }}
        >
          {op.text}
        </div>
        <div
          style={{
            width: interpolate(lineIn, [0, 1], [0, 120]),
            height: 3,
            backgroundColor: ACCENT,
            borderRadius: 2,
          }}
        />
        {op.subtitle && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              lineHeight: 1.5,
              transform: `translateY(${interpolate(subIn, [0, 1], [30, 0])}px)`,
              opacity: subIn,
            }}
          >
            {op.subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ op: CaptionOperation; startFrame: number; endFrame: number }> = ({
  op,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const rel = frame - startFrame;
  const enter = spring({ frame: rel, fps, config: { damping: 60, stiffness: 200 } });
  const fadeOut = interpolate(frame, [endFrame - 8, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightTokens = op.highlight
    ? op.highlight.toLowerCase().split(/\s+/)
    : [];
  const words = op.text.split(" ");
  const duration = endFrame - startFrame;
  const wordsPerFrame = words.length / Math.max(duration * 0.3, 1);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 220,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 10px",
          maxWidth: 900,
          opacity: enter * fadeOut,
          transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
        }}
      >
        {words.map((word, i) => {
          const delay = i / wordsPerFrame;
          const wp = spring({
            frame: Math.max(0, rel - delay),
            fps,
            config: { damping: 40, stiffness: 300 },
          });
          const isHL = highlightTokens.some((h) =>
            word.toLowerCase().replace(/[.,!?'"]/g, "").includes(h),
          );
          const fontWeight = op.style === "bold" || isHL ? 800 : 700;
          return (
            <span
              key={`${startFrame}-${i}`}
              style={{
                fontSize: 52,
                fontWeight,
                color: isHL ? ACCENT : "#fff",
                opacity: wp,
                transform: `scale(${interpolate(wp, [0, 1], [0.8, 1])})`,
                textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)",
                lineHeight: 1.3,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Compute the active zoom scale/origin at the current frame by scanning zoom ops.
 * Returns scale=1 when no zoom is active.
 */
function getActiveZoom(
  zooms: ZoomOperation[],
  frame: number,
  fps: number,
  timelineOffsetFrames: number,
): { scale: number; originX: number; originY: number } {
  for (const op of zooms) {
    const startFrame = timelineOffsetFrames + Math.round(op.start * fps);
    const endFrame = timelineOffsetFrames + Math.round(op.end * fps);
    if (frame < startFrame || frame > endFrame) continue;
    const duration = Math.max(endFrame - startFrame, 1);
    const t = (frame - startFrame) / duration;
    // ease-in for first half, hold at peak for second half
    const eased = t < 0.5 ? 1 - Math.pow(1 - t * 2, 2) : 1;
    const scale = 1 + (op.scale - 1) * eased;
    return {
      scale,
      originX: (op.x ?? 0.5) * 100,
      originY: (op.y ?? 0.5) * 100,
    };
  }
  return { scale: 1, originX: 50, originY: 50 };
}

/**
 * Video segment with zoom applied — wraps the OffthreadVideo in a scaled container
 * so zoom actually affects the visible frame (not an empty overlay).
 */
const ZoomableVideo: React.FC<{
  videoUrl: string;
  startFromFrames: number;
  endAtFrames: number;
  zooms: ZoomOperation[];
  timelineOffsetFrames: number;
}> = ({ videoUrl, startFromFrames, endAtFrames, zooms, timelineOffsetFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scale, originX, originY } = getActiveZoom(
    zooms,
    frame,
    fps,
    timelineOffsetFrames,
  );
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${originX}% ${originY}%`,
        overflow: "hidden",
      }}
    >
      <OffthreadVideo
        src={videoUrl}
        startFrom={startFromFrames}
        endAt={endAtFrames}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

export const PreviewComposition: React.FC<{ composition: VideoComposition }> = ({
  composition,
}) => {
  const { fps } = useVideoConfig();
  const startTitleSeconds = getStartTitleDuration(composition);
  const startTitleFrames = Math.round(startTitleSeconds * fps);
  const segments = computeTimeline(composition);

  const startTitles = composition.operations.filter(
    (o): o is TitleOperation => o.type === "title" && o.position === "start",
  );
  const endTitles = composition.operations.filter(
    (o): o is TitleOperation => o.type === "title" && o.position === "end",
  );
  const captions = composition.operations.filter(
    (o): o is CaptionOperation => o.type === "caption",
  );
  const zooms = composition.operations.filter(
    (o): o is ZoomOperation => o.type === "zoom",
  );

  // Compute video segment frame ranges (on the timeline)
  // Precompute segment start frames immutably
  const segmentLengths = segments.map((seg) =>
    Math.round((seg.sourceEnd - seg.sourceStart) * fps),
  );
  const segmentStarts = segmentLengths.reduce<number[]>((acc, _len, i) => {
    acc.push(i === 0 ? startTitleFrames : acc[i - 1] + segmentLengths[i - 1]);
    return acc;
  }, []);
  const videoSegments = segments.map((seg, i) => ({
    ...seg,
    from: segmentStarts[i],
    durationInFrames: segmentLengths[i],
  }));

  const videoEndFrame =
    segmentStarts.length > 0
      ? segmentStarts[segmentStarts.length - 1] + segmentLengths[segmentLengths.length - 1]
      : startTitleFrames;

  // Precompute title card offsets so we don't mutate during render
  const startTitleFramesList = startTitles.map((t) => Math.round(t.duration * fps));
  const startTitleOffsets = startTitleFramesList.reduce<number[]>((acc) => {
    acc.push(
      acc.length === 0
        ? 0
        : acc[acc.length - 1] + startTitleFramesList[acc.length - 1],
    );
    return acc;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Start title cards */}
      {startTitles.map((title, i) => {
        const durFrames = startTitleFramesList[i];
        const from = startTitleOffsets[i];
        return (
          <Sequence key={`start-title-${i}`} from={from} durationInFrames={durFrames}>
            <TitleCardBlock op={title} fps={fps} durationInFrames={durFrames} />
          </Sequence>
        );
      })}

      {/* Video segments — each wrapped in a zoom container so zoom actually scales the video */}
      {videoSegments.map((seg, i) => {
        return (
          <Sequence
            key={`video-${i}`}
            from={seg.from}
            durationInFrames={seg.durationInFrames}
          >
            <ZoomableVideo
              videoUrl={composition.videoUrl}
              startFromFrames={Math.round(seg.sourceStart * fps)}
              endAtFrames={Math.round(seg.sourceEnd * fps)}
              zooms={zooms}
              timelineOffsetFrames={startTitleFrames}
            />
          </Sequence>
        );
      })}

      {/* Captions (timeline-relative, offset after start title) */}
      {captions.map((op, i) => (
        <Caption
          key={`caption-${i}`}
          op={op}
          startFrame={startTitleFrames + Math.round(op.start * fps)}
          endFrame={startTitleFrames + Math.round(op.end * fps)}
        />
      ))}

      {/* End title cards */}
      {endTitles.map((title, i) => {
        const durFrames = Math.round(title.duration * fps);
        return (
          <Sequence
            key={`end-title-${i}`}
            from={videoEndFrame + endTitles.slice(0, i).reduce((s, t) => s + Math.round(t.duration * fps), 0)}
            durationInFrames={durFrames}
          >
            <TitleCardBlock op={title} fps={fps} durationInFrames={durFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
