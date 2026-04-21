"use client";

import { upload } from "@vercel/blob/client";
import { Upload, Loader2, Check } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

interface UploadPanelProps {
  videoUrl: string | null;
  onUploaded: (url: string, duration: number) => void;
  status: "idle" | "uploading" | "transcribing" | "ready";
}

export default function UploadPanel({
  videoUrl,
  onUploaded,
  status,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    // Verify duration client-side (must be <= 180s / 3 min for the fast path)
    const duration = await getVideoDuration(file);
    if (duration > 181) {
      setError(
        `Video is ${formatDuration(duration)}. Must be 3 minutes or less.`,
      );
      return;
    }

    // Client-direct upload to Vercel Blob. The /api/video/upload route just
    // hands out a signed token; the browser uploads the file bytes straight
    // to Blob storage, bypassing the 4.5 MB serverless body limit.
    try {
      const safeName = `videos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const blob = await upload(safeName, file, {
        access: "public",
        handleUploadUrl: "/api/video/upload",
        contentType: file.type || "video/mp4",
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage));
        },
      });

      onUploaded(blob.url, duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

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

  return (
    <div className="surface-card flex flex-col gap-3 rounded-2xl border border-dashed border-border p-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 py-12 transition hover:border-primary hover:bg-primary/5 disabled:opacity-60"
      >
        {status === "uploading" ? (
          <>
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-bold text-foreground">
              Uploading... {progress}%
            </p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-foreground">
              Drop a video or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              MP4, MOV, or WebM · 3 minutes max
            </p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleSelect}
      />
      {error && (
        <p className="text-xs font-bold text-destructive">{error}</p>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds - m * 60);
  return `${m}m ${s}s`;
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
