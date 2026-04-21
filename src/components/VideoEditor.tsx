"use client";

import { Download, Loader2, Film, Video } from "lucide-react";
import { useCallback, useState } from "react";
import type {
  ChatMessage,
  Transcript,
  VideoComposition,
} from "../types/videoEditor";
import { emptyComposition } from "../types/videoEditor";
import ChatPanel from "./videoEditor/ChatPanel";
import PreviewPanel from "./videoEditor/PreviewPanel";
import UploadPanel from "./videoEditor/UploadPanel";

type Status =
  | "idle"
  | "uploading"
  | "transcribing"
  | "ready"
  | "rendering"
  | "rendered";

export default function VideoEditor() {
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [, setVideoDuration] = useState<number>(0);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [composition, setComposition] = useState<VideoComposition | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const handleUploaded = useCallback(
    async (url: string, duration: number) => {
      setStatus("transcribing");
      setVideoUrl(url);
      setVideoDuration(duration);
      setComposition(emptyComposition(url, duration));
      setMessages([]);
      setRenderedUrl(null);

      // Kick off transcription (non-blocking for chat)
      try {
        const res = await fetch("/api/video/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: url }),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const t: Transcript = await res.json();
        setTranscript(t);
      } catch (err) {
        console.error("Transcription failed", err);
      } finally {
        setStatus("ready");
      }
    },
    [],
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
        if (!res.ok) throw new Error(await res.text());
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
        console.error("Chat failed", err);
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content:
              "Sorry, I hit an error trying to update the composition. Try rephrasing?",
          },
        ]);
      }
    },
    [composition, messages, transcript],
  );

  const handleExport = useCallback(async () => {
    if (!composition) return;
    setStatus("rendering");
    setRenderError(null);
    setRenderedUrl(null);

    try {
      const res = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ composition }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: { url: string } = await res.json();
      setRenderedUrl(data.url);
      setStatus("rendered");
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : "Render failed");
      setStatus("ready");
    }
  }, [composition]);

  return (
    <div className="space-y-6">
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
          <button
            type="button"
            onClick={handleExport}
            disabled={!composition || status === "rendering" || !videoUrl}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "rendering" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <Download size={18} />
                Export MP4
              </>
            )}
          </button>
        </div>

        {renderedUrl && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <Film size={18} className="text-white/80" />
            <p className="flex-1 text-sm text-white">Your video is ready.</p>
            <a
              href={renderedUrl}
              download
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

        {renderError && (
          <div className="mt-4 rounded-2xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {renderError}
          </div>
        )}
      </div>

      {/* Upload */}
      <UploadPanel
        videoUrl={videoUrl}
        onUploaded={handleUploaded}
        status={status === "idle" || status === "uploading"
          ? status
          : status === "transcribing"
            ? "transcribing"
            : "ready"}
      />

      {/* Chat + Preview */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ChatPanel
          messages={messages}
          transcript={transcript}
          composition={composition}
          disabled={!videoUrl}
          onSend={handleSend}
        />
        <PreviewPanel composition={composition} />
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
                <span className="font-mono text-primary">
                  {s.start.toFixed(2)}s
                </span>{" "}
                {s.text.trim()}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
