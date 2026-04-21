"use client";

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

    // Verify duration client-side (must be <= 60s)
    const duration = await getVideoDuration(file);
    if (duration > 61) {
      setError(`Video is ${duration.toFixed(1)}s. Must be 60 seconds or less.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/video/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const result = await new Promise<{ url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      onUploaded(result.url, duration);
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
              MP4, MOV, or WebM · 60 seconds max
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
