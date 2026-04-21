"use client";

import { upload } from "@vercel/blob/client";
import { AlertCircle, Check, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

interface UploadPanelProps {
  videoUrl: string | null;
  onUploaded: (url: string, duration: number) => void;
  onUploadStart?: () => void;
  onError?: (message: string) => void;
  status: "idle" | "uploading" | "transcribing" | "ready";
}

export default function UploadPanel({
  videoUrl,
  onUploaded,
  onUploadStart,
  onError,
  status,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [bytesUploaded, setBytesUploaded] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);

  const reportError = (message: string) => {
    setError(message);
    onError?.(message);
  };

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);
    setBytesUploaded(0);
    setTotalBytes(file.size);

    // Verify duration client-side (must be <= 180s / 3 min for the fast path)
    const duration = await getVideoDuration(file);
    if (duration > 181) {
      reportError(
        `Video is ${formatDuration(duration)}. Must be 3 minutes or less.`,
      );
      return;
    }

    // Signal to parent that the upload is starting (so it can flip status)
    onUploadStart?.();

    // Client-direct upload to Vercel Blob. The /api/video/upload route just
    // hands out a signed token; the browser uploads the file bytes straight
    // to Blob storage, bypassing the 4.5 MB serverless body limit.
    try {
      const safeName = `videos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const blob = await upload(safeName, file, {
        access: "public",
        handleUploadUrl: "/api/video/upload",
        contentType: file.type || "video/mp4",
        onUploadProgress: ({ percentage, loaded, total }) => {
          setProgress(Math.round(percentage));
          setBytesUploaded(loaded);
          setTotalBytes(total);
        },
      });

      onUploaded(blob.url, duration);
    } catch (err) {
      const message = extractUploadError(err);
      reportError(message);
    }
  };

  const resetError = () => setError(null);

  if (videoUrl) {
    return (
      <div className="surface-card flex items-center gap-3 rounded-2xl border border-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Check size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Video ready</p>
          <p className="truncate text-xs text-muted-foreground">
            {status === "transcribing" ? "Transcribing audio..." : "Uploaded to Blob"}
          </p>
        </div>
        {status === "transcribing" && (
          <Loader2 size={18} className="animate-spin text-primary" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-bold text-primary hover:underline"
        >
          Replace
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleSelect}
        />
      </div>
    );
  }

  // Uploading state — modern progress bar
  if (status === "uploading") {
    return (
      <div className="surface-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Loader2 size={22} className="animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Uploading your video</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(bytesUploaded)} of {formatBytes(totalBytes)}
              {" · "}
              direct to Vercel Blob
            </p>
          </div>
          <div className="text-lg font-black tabular-nums text-primary">
            {progress}%
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card flex flex-col gap-3 rounded-2xl border border-dashed border-border p-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 py-12 transition hover:border-primary hover:bg-primary/5"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110">
          <Upload size={24} />
        </div>
        <p className="text-sm font-bold text-foreground">
          Drop a video or click to upload
        </p>
        <p className="text-xs text-muted-foreground">
          MP4, MOV, or WebM · 3 minutes max
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleSelect}
      />
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1 text-xs font-semibold leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={resetError}
            className="shrink-0 rounded-lg p-1 hover:bg-destructive/10"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Cannot read video metadata"));
    video.src = URL.createObjectURL(file);
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds - m * 60);
  return `${m}m ${s}s`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function extractUploadError(err: unknown): string {
  if (!(err instanceof Error)) return "Upload failed. Please try again.";

  const message = err.message || "";

  // Common misconfig: Blob Store not connected in Vercel
  if (
    message.includes("CORS") ||
    message.includes("Failed to fetch") ||
    message.toLowerCase().includes("network") ||
    message.includes("vercel.com/api/blob")
  ) {
    return "Upload failed — Vercel Blob may not be connected. Create a Blob Store in the Vercel dashboard (Storage → Create Blob Store) and redeploy.";
  }

  // File size rejected by server token
  if (message.toLowerCase().includes("too large")) {
    return "File exceeds the 200 MB limit.";
  }

  // Unsupported mime type
  if (message.toLowerCase().includes("content type") || message.toLowerCase().includes("mime")) {
    return "Unsupported file type. Use MP4, MOV, or WebM.";
  }

  return message;
}
