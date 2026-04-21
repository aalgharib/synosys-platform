"use client";

import {
  AlertCircle,
  Check,
  Circle,
  Download,
  Film,
  Loader2,
  Scissors,
  Sparkles,
  Trash2,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  detectSilenceCuts,
  mergeCuts,
  totalSilenceDuration,
} from "../lib/videoEditor/silenceDetector";
import type {
  ChatMessage,
  Transcript,
  VideoComposition,
} from "../types/videoEditor";
import { emptyComposition } from "../types/videoEditor";
import ChatPanel from "./videoEditor/ChatPanel";
import PreviewPanel from "./videoEditor/PreviewPanel";
import UploadPanel from "./videoEditor/UploadPanel";

const AUTO_DIRECT_PROMPT = `Act as a senior short-form video director. I've given you the full transcript. Create a complete editorial plan for this clip as a vertical reel:

1. Add a bold title card at the start with a 5-word hook that stops a muted scroll.
2. Add animated word-level captions synced to the transcript timestamps. Highlight the most emotionally loaded words in amber.
3. Cut any silent pauses, filler breaths, or dead air between sentences (use cut operations).
4. Add subtle zoom punch-ins (1.08× scale) on key emotional beats — lines the audience should remember.
5. Structure the video as a 3-act arc: hook (first 5s) → tension (middle) → payoff + implicit CTA (last 5s).

Translate ALL of this into composition operations (title, caption, cut, zoom). In the "reply" field, explain your 4-6 key editorial choices in bullet points — focus on WHY each choice serves a viewer scrolling muted at night.`;

type Status =
  | "idle"
  | "uploading"
  | "transcribing"
  | "ready"
  | "rendering"
  | "rendered";

type Toast = {
  id: number;
  tone: "error" | "success" | "info";
  message: string;
};

const STATUS_STEPS: Array<{ key: Status; label: string }> = [
  { key: "uploading", label: "Upload" },
  { key: "transcribing", label: "Transcribe" },
  { key: "ready", label: "Edit" },
  { key: "rendering", label: "Render" },
  { key: "rendered", label: "Done" },
];

export default function VideoEditor() {
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [, setVideoDuration] = useState<number>(0);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [composition, setComposition] = useState<VideoComposition | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [renderedDownloadUrl, setRenderedDownloadUrl] = useState<string | null>(null);
  // Track every rendered URL from this session so "Clear storage" can wipe them all.
  const [allRenderedUrls, setAllRenderedUrls] = useState<string[]>([]);
  const [clearingStorage, setClearingStorage] = useState<boolean>(false);
  // Session id — generated once per editor mount. Sent to the render route so
  // outputs are grouped under a session prefix in Blob.
  const [sessionId] = useState<string>(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const [renderStartedAt, setRenderStartedAt] = useState<number | null>(null);
  const [renderElapsed, setRenderElapsed] = useState<number>(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((tone: Toast["tone"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }]);
    // Auto-dismiss success/info after 5s; errors stay until dismissed.
    if (tone !== "error") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Render stopwatch
  useEffect(() => {
    if (status !== "rendering" || !renderStartedAt) {
      return;
    }
    const interval = setInterval(() => {
      setRenderElapsed(Math.floor((Date.now() - renderStartedAt) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [status, renderStartedAt]);

  const handleUploadStart = useCallback(() => {
    setStatus("uploading");
    setRenderedUrl(null);
    setRenderedDownloadUrl(null);
    setAllRenderedUrls([]);
  }, []);

  const handleUploaded = useCallback(
    async (url: string, duration: number) => {
      setStatus("transcribing");
      setVideoUrl(url);
      setVideoDuration(duration);
      setComposition(emptyComposition(url, duration));
      setMessages([]);
      setRenderedUrl(null);
      setRenderedDownloadUrl(null);
      pushToast("success", "Uploaded. Transcribing audio now…");

      try {
        const res = await fetch("/api/video/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: url }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(parseApiError(text));
        }
        const t: Transcript = await res.json();
        setTranscript(t);
        pushToast(
          "success",
          `Transcribed · ${t.segments.length} segment${t.segments.length === 1 ? "" : "s"}`,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transcription failed";
        pushToast("error", `Transcription failed: ${message}`);
      } finally {
        setStatus("ready");
      }
    },
    [pushToast],
  );

  const handleSend = useCallback(
    async (userMessage: string) => {
      if (!composition) return;

      const newUserMessage: ChatMessage = { role: "user", content: userMessage };
      const nextMessages = [...messages, newUserMessage];
      setMessages(nextMessages);

      try {
        const res = await fetch("/api/video/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            composition,
            transcript,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(parseApiError(text));
        }
        const data: { reply: string; composition: VideoComposition } = await res.json();

        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: data.reply,
            composition: data.composition,
          },
        ]);
        setComposition(data.composition);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Chat failed";
        pushToast("error", `Claude error: ${message}`);
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: "Sorry, I hit an error updating the composition. Try rephrasing?",
          },
        ]);
      }
    },
    [composition, messages, transcript, pushToast],
  );

  /**
   * One-click "Auto-Direct": sends a curated director prompt to Claude.
   * Works with whatever transcript exists; the chat endpoint already receives it.
   */
  const handleAutoDirect = useCallback(async () => {
    if (!composition) return;
    if (!transcript) {
      pushToast(
        "error",
        "Auto-director needs a transcript. Wait for transcription to finish and try again.",
      );
      return;
    }
    await handleSend(AUTO_DIRECT_PROMPT);
  }, [composition, transcript, handleSend, pushToast]);

  /**
   * One-click "Cut Silence": uses transcript gaps to generate cut ops locally.
   * Zero API calls — deterministic, fast, reversible via undo (user edits composition).
   */
  const handleCutSilence = useCallback(() => {
    if (!composition || !transcript) {
      pushToast(
        "error",
        "Cut silence needs a transcript. Wait for transcription to finish and try again.",
      );
      return;
    }

    const cuts = detectSilenceCuts(transcript, composition.videoDuration, {
      minGapSeconds: 0.6,
    });

    if (cuts.length === 0) {
      pushToast("info", "No silent gaps longer than 0.6s detected — nothing to cut.");
      return;
    }

    const updated = mergeCuts(composition, cuts);
    setComposition(updated);

    const saved = totalSilenceDuration(cuts);
    pushToast(
      "success",
      `Added ${cuts.length} cut${cuts.length === 1 ? "" : "s"} · ${saved.toFixed(1)}s of silence removed`,
    );

    // Record this as an assistant message so the chat history reflects what happened
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Cut ${cuts.length} silent gap${cuts.length === 1 ? "" : "s"} (${saved.toFixed(1)}s total) detected from transcript pauses.`,
        composition: updated,
      },
    ]);
  }, [composition, transcript, pushToast]);

  const handleExport = useCallback(async () => {
    if (!composition) return;
    setStatus("rendering");
    setRenderedUrl(null);
    setRenderedDownloadUrl(null);
    setRenderStartedAt(Date.now());
    setRenderElapsed(0);

    try {
      const res = await fetch("/api/video/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ composition }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(parseApiError(text));
      }
      const data: { url: string; downloadUrl?: string } = await res.json();
      setRenderedUrl(data.url);
      setRenderedDownloadUrl(data.downloadUrl ?? data.url);
      setAllRenderedUrls((prev) => [...prev, data.url]);
      setStatus("rendered");
      pushToast(
        "success",
        "Render complete — your video is ready. Tap 'Rendered MP4' in the preview to watch the final cut.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Render failed";
      pushToast("error", `Render failed: ${message}`);
      setStatus("ready");
    } finally {
      setRenderStartedAt(null);
    }
  }, [composition, pushToast, sessionId]);

  /**
   * One-click "Clear storage": deletes all Blob files this session created.
   * Source is usually already gone (auto-deleted after render), but we include
   * it in case the user never rendered. Also resets the editor state.
   */
  const handleClearStorage = useCallback(async () => {
    const urls = [
      ...(videoUrl ? [videoUrl] : []),
      ...allRenderedUrls,
    ];
    if (urls.length === 0) {
      pushToast("info", "Nothing to clear — no Blob files from this session.");
      return;
    }

    setClearingStorage(true);
    try {
      const res = await fetch("/api/video/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (!res.ok) {
        throw new Error(parseApiError(await res.text()));
      }
      const data: { deleted: number } = await res.json();
      pushToast(
        "success",
        `Cleared ${data.deleted} file${data.deleted === 1 ? "" : "s"} from Vercel Blob.`,
      );
      // Reset editor state
      setVideoUrl(null);
      setVideoDuration(0);
      setTranscript(null);
      setComposition(null);
      setMessages([]);
      setRenderedUrl(null);
      setRenderedDownloadUrl(null);
      setAllRenderedUrls([]);
      setStatus("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cleanup failed";
      pushToast("error", `Cleanup failed: ${message}`);
    } finally {
      setClearingStorage(false);
    }
  }, [videoUrl, allRenderedUrls, pushToast]);

  const handleUploadError = useCallback(
    (message: string) => {
      pushToast("error", message);
      setStatus("idle");
    },
    [pushToast],
  );

  const uploadStatus: "idle" | "uploading" | "transcribing" | "ready" = useMemo(() => {
    if (status === "idle" || status === "uploading") return status;
    if (status === "transcribing") return "transcribing";
    return "ready";
  }, [status]);

  return (
    <div className="space-y-6">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm flex-col gap-3">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="surface-hero rounded-[2rem] border border-border p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary-foreground">
              <Video size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Video Editor</h1>
              <p className="mt-1 max-w-xl text-sm text-white/70">
                Upload a clip, chat with Claude to edit it, preview instantly,
                and export a polished video.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(videoUrl || allRenderedUrls.length > 0) && (
              <button
                type="button"
                onClick={handleClearStorage}
                disabled={clearingStorage || status === "rendering"}
                title="Delete all Blob files from this session to avoid storage costs"
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {clearingStorage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Clear storage
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={!composition || status === "rendering" || !videoUrl}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "rendering" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Rendering {renderElapsed}s
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export MP4
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pipeline status pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {STATUS_STEPS.map((step) => (
            <StatusPill
              key={step.key}
              label={step.label}
              state={stateForStep(status, step.key)}
            />
          ))}
        </div>

        {renderedUrl && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <Film size={18} className="text-white/80" />
            <p className="flex-1 text-sm text-white">Your video is ready.</p>
            <a
              // Use downloadUrl (Content-Disposition: attachment) so the browser
              // actually downloads instead of opening — cross-origin `download` is ignored.
              href={renderedDownloadUrl ?? renderedUrl}
              className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-foreground hover:bg-white/90"
            >
              Download
            </a>
            <a
              href={renderedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-white hover:underline"
            >
              Open
            </a>
          </div>
        )}

        {status === "rendering" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 p-3">
              <Loader2 size={18} className="animate-spin text-white" />
              <p className="flex-1 text-sm text-white">
                Rendering on Vercel — this usually takes 30–120s for a 1–3 min clip.
              </p>
              <span className="text-xs font-bold tabular-nums text-white/70">
                {renderElapsed}s elapsed
              </span>
            </div>
            {/* Indeterminate animated bar */}
            <div className="h-1 w-full overflow-hidden bg-white/10">
              <div className="h-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite] bg-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Upload */}
      <UploadPanel
        videoUrl={videoUrl}
        onUploaded={handleUploaded}
        onUploadStart={handleUploadStart}
        onError={handleUploadError}
        status={uploadStatus}
      />

      {/* Quick Actions — only shown after upload is done */}
      {videoUrl && (
        <div className="grid gap-3 md:grid-cols-2">
          <QuickActionCard
            icon={<Wand2 size={22} />}
            tone="primary"
            title="Auto-Direct with Claude"
            description="Claude analyzes the transcript and builds a full editorial plan: hook title, captions, cuts, zooms, 3-act structure."
            actionLabel="Direct this video"
            onClick={handleAutoDirect}
            disabled={!transcript || status === "rendering"}
            disabledReason={!transcript ? "Waiting for transcript…" : undefined}
          />
          <QuickActionCard
            icon={<Scissors size={22} />}
            tone="neutral"
            title="Cut Silent Gaps"
            description="Automatically remove pauses, breaths, and dead air between spoken lines — based on transcript timestamps."
            actionLabel="Cut silence"
            onClick={handleCutSilence}
            disabled={!transcript || status === "rendering"}
            disabledReason={!transcript ? "Waiting for transcript…" : undefined}
          />
        </div>
      )}

      {/* Chat + Preview — items-start so each panel manages its own height independently */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <ChatPanel
          messages={messages}
          transcript={transcript}
          composition={composition}
          disabled={!videoUrl}
          onSend={handleSend}
        />
        <PreviewPanel composition={composition} renderedUrl={renderedUrl} />
      </div>

      {/* Transcript debug (collapsed) */}
      {transcript && (
        <details className="surface-card rounded-2xl border border-border p-4">
          <summary className="cursor-pointer text-sm font-bold text-foreground">
            Transcript ({transcript.segments.length} segments)
          </summary>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {transcript.segments.map((s) => (
              <p key={s.id}>
                <span className="font-mono text-primary">{s.start.toFixed(2)}s</span>{" "}
                {s.text.trim()}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function stateForStep(
  current: Status,
  step: Status,
): "done" | "active" | "pending" {
  const order: Status[] = [
    "idle",
    "uploading",
    "transcribing",
    "ready",
    "rendering",
    "rendered",
  ];
  const currentIdx = order.indexOf(current);
  const stepIdx = order.indexOf(step);
  if (currentIdx > stepIdx) return "done";
  if (currentIdx === stepIdx) return "active";
  return "pending";
}

function QuickActionCard({
  icon,
  tone,
  title,
  description,
  actionLabel,
  onClick,
  disabled,
  disabledReason,
}: {
  icon: React.ReactNode;
  tone: "primary" | "neutral";
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const iconTone =
    tone === "primary"
      ? "bg-primary/15 text-primary"
      : "bg-muted text-foreground";
  const buttonTone =
    tone === "primary"
      ? "bg-primary text-primary-foreground hover:brightness-110"
      : "border border-border bg-card text-foreground hover:bg-accent";

  return (
    <div className="surface-card flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconTone}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${buttonTone}`}
      >
        {disabled && disabledReason ? disabledReason : actionLabel}
      </button>
    </div>
  );
}

function StatusPill({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "pending";
}) {
  const tones = {
    done: "border-primary/40 bg-primary/10 text-primary",
    active: "border-white/30 bg-white/15 text-white",
    pending: "border-white/10 bg-white/5 text-white/40",
  } as const;
  const Icon = state === "done" ? Check : state === "active" ? Sparkles : Circle;
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${tones[state]}`}
    >
      <Icon size={12} className={state === "active" ? "animate-pulse" : ""} />
      {label}
    </span>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const tones = {
    error: "border-destructive/40 bg-destructive text-destructive-foreground",
    success: "border-primary/40 bg-card text-foreground",
    info: "border-border bg-card text-foreground",
  } as const;
  const Icon = toast.tone === "error" ? AlertCircle : Check;
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md animate-[slideInRight_200ms_ease-out] ${tones[toast.tone]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 opacity-70 hover:bg-black/10 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Our API routes return either JSON { error: "..." } or plain text.
 * This normalizes both into a user-readable string.
 */
function parseApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.error === "string") return parsed.error;
  } catch {
    // not JSON — fall through
  }
  return raw || "Unknown error";
}
