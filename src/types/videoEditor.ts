// =====================================================
// Video Editor Types & Composition Schema
// =====================================================
// Claude returns VideoComposition JSON. Both the browser
// preview (@remotion/player) and the server renderer
// (ffmpeg) consume the same schema.
// =====================================================

export type CaptionStyle = "normal" | "bold" | "emphasis";

export interface TrimOperation {
  type: "trim";
  /** Keep only this time range from the source video (seconds) */
  start: number;
  end: number;
}

export interface CutOperation {
  type: "cut";
  /** Remove this range from the source video (seconds) */
  start: number;
  end: number;
}

export interface CaptionOperation {
  type: "caption";
  text: string;
  /** Seconds from timeline start (post-trim/cut) */
  start: number;
  end: number;
  style?: CaptionStyle;
  /** Optional word(s) to highlight in accent color */
  highlight?: string;
}

export interface TitleOperation {
  type: "title";
  text: string;
  subtitle?: string;
  /** "start" adds a title card before the video, "end" adds it after */
  position: "start" | "end";
  /** Seconds */
  duration: number;
}

export interface ZoomOperation {
  type: "zoom";
  start: number;
  end: number;
  /** 1.0 = no zoom, 1.5 = 50% zoom in */
  scale: number;
  /** Center point 0-1 (0.5 = center) */
  x?: number;
  y?: number;
}

export type VideoOperation =
  | TrimOperation
  | CutOperation
  | CaptionOperation
  | TitleOperation
  | ZoomOperation;

export interface VideoComposition {
  version: 1;
  /** Public URL to the source video (Vercel Blob) */
  videoUrl: string;
  /** Duration of the source video in seconds */
  videoDuration: number;
  /** Output dimensions (default 1080x1920 for reels) */
  width: number;
  height: number;
  fps: number;
  operations: VideoOperation[];
}

export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WhisperWord[];
}

export interface Transcript {
  text: string;
  segments: WhisperSegment[];
  language?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** If assistant generated a composition update, it's stored here */
  composition?: VideoComposition;
}

export interface VideoProject {
  id: string;
  name: string;
  videoUrl: string | null;
  videoDuration: number;
  transcript: Transcript | null;
  composition: VideoComposition | null;
  messages: ChatMessage[];
  renderedUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

export const emptyComposition = (
  videoUrl: string,
  videoDuration: number,
): VideoComposition => ({
  version: 1,
  videoUrl,
  videoDuration,
  width: 1080,
  height: 1920,
  fps: 30,
  operations: [],
});
