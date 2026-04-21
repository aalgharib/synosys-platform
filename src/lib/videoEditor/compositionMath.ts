import type { VideoComposition, VideoOperation } from "../../types/videoEditor";

/**
 * Compute the effective timeline (after trim/cut operations).
 * Returns an array of [sourceStart, sourceEnd] clip segments
 * that should play in order.
 */
export const computeTimeline = (
  composition: VideoComposition,
): Array<{ sourceStart: number; sourceEnd: number }> => {
  const trim = composition.operations.find((o) => o.type === "trim");
  const cuts = composition.operations.filter((o) => o.type === "cut");

  let rangeStart = 0;
  let rangeEnd = composition.videoDuration;

  if (trim) {
    rangeStart = trim.start;
    rangeEnd = trim.end;
  }

  if (cuts.length === 0) {
    return [{ sourceStart: rangeStart, sourceEnd: rangeEnd }];
  }

  // Sort cuts by start and subtract them from the kept range
  const sortedCuts = [...cuts]
    .filter((c) => c.end > rangeStart && c.start < rangeEnd)
    .sort((a, b) => a.start - b.start);

  const segments: Array<{ sourceStart: number; sourceEnd: number }> = [];
  let cursor = rangeStart;

  for (const cut of sortedCuts) {
    const cutStart = Math.max(cut.start, rangeStart);
    const cutEnd = Math.min(cut.end, rangeEnd);
    if (cursor < cutStart) {
      segments.push({ sourceStart: cursor, sourceEnd: cutStart });
    }
    cursor = Math.max(cursor, cutEnd);
  }

  if (cursor < rangeEnd) {
    segments.push({ sourceStart: cursor, sourceEnd: rangeEnd });
  }

  return segments;
};

/**
 * Get total timeline duration in seconds (after trim/cuts + title cards).
 */
export const getTimelineDuration = (composition: VideoComposition): number => {
  const segments = computeTimeline(composition);
  const videoDuration = segments.reduce(
    (sum, seg) => sum + (seg.sourceEnd - seg.sourceStart),
    0,
  );
  const titleDuration = composition.operations
    .filter((o): o is Extract<VideoOperation, { type: "title" }> => o.type === "title")
    .reduce((sum, t) => sum + t.duration, 0);
  return videoDuration + titleDuration;
};

/**
 * Sum of title card durations at the start.
 */
export const getStartTitleDuration = (composition: VideoComposition): number => {
  return composition.operations
    .filter(
      (o): o is Extract<VideoOperation, { type: "title" }> =>
        o.type === "title" && o.position === "start",
    )
    .reduce((sum, t) => sum + t.duration, 0);
};
