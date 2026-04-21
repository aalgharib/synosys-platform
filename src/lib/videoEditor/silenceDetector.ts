import type {
  CutOperation,
  Transcript,
  VideoComposition,
} from "../../types/videoEditor";

/**
 * Analyze transcript gaps and produce cut operations for silent stretches.
 *
 * Whisper returns segments with start/end timestamps. The gap between
 * segment[i].end and segment[i+1].start is dead air (pauses, breathing,
 * filler). We also check the tail before the first segment and after the last.
 *
 * Gaps below `minGapSeconds` are kept (natural pacing). Anything above that
 * threshold gets cut out.
 *
 * Returns NEW cut operations — existing cuts on the composition are preserved.
 */
export function detectSilenceCuts(
  transcript: Transcript,
  videoDuration: number,
  options: { minGapSeconds?: number; edgePadSeconds?: number } = {},
): CutOperation[] {
  const { minGapSeconds = 0.6, edgePadSeconds = 0.15 } = options;
  const cuts: CutOperation[] = [];

  const segments = [...transcript.segments].sort((a, b) => a.start - b.start);
  if (segments.length === 0) return cuts;

  // Pre-first silence (from 0 to first segment start)
  const firstStart = segments[0].start;
  if (firstStart > minGapSeconds) {
    cuts.push({
      type: "cut",
      start: 0,
      end: Math.max(0, firstStart - edgePadSeconds),
    });
  }

  // Inter-segment gaps
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    const gap = next.start - current.end;
    if (gap > minGapSeconds) {
      cuts.push({
        type: "cut",
        start: current.end + edgePadSeconds,
        end: Math.max(current.end + edgePadSeconds + 0.05, next.start - edgePadSeconds),
      });
    }
  }

  // Post-last silence
  const lastEnd = segments[segments.length - 1].end;
  if (videoDuration - lastEnd > minGapSeconds) {
    cuts.push({
      type: "cut",
      start: Math.min(videoDuration - 0.05, lastEnd + edgePadSeconds),
      end: videoDuration,
    });
  }

  return cuts;
}

/**
 * Merge new cuts into an existing composition without duplicating.
 * Keeps all non-cut operations unchanged.
 */
export function mergeCuts(
  composition: VideoComposition,
  newCuts: CutOperation[],
): VideoComposition {
  const existingOps = composition.operations;

  // Deduplicate by (start, end) tuple
  const seen = new Set<string>();
  const merged: VideoComposition["operations"] = [];

  [...existingOps, ...newCuts].forEach((op) => {
    if (op.type === "cut") {
      const key = `${op.start.toFixed(2)}-${op.end.toFixed(2)}`;
      if (seen.has(key)) return;
      seen.add(key);
    }
    merged.push(op);
  });

  return { ...composition, operations: merged };
}

/**
 * How much time (seconds) is saved by cutting these silences.
 */
export function totalSilenceDuration(cuts: CutOperation[]): number {
  return cuts.reduce((sum, c) => sum + (c.end - c.start), 0);
}
