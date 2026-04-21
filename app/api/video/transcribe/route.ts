import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { tmpdir } from "os";
import { join } from "path";
import type { Transcript } from "../../../../src/types/videoEditor";

export const runtime = "nodejs";
export const maxDuration = 60;

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
}

/**
 * Transcription provider resolution:
 *   1. Groq (preferred — free tier + 10x faster than OpenAI Whisper)
 *   2. OpenAI Whisper (fallback)
 *
 * Both use the OpenAI SDK shape; Groq runs an OpenAI-compatible API.
 * Set either GROQ_API_KEY or OPENAI_API_KEY (or both — Groq wins).
 */
const providers = [
  {
    name: "groq" as const,
    apiKey: () => process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    model: "whisper-large-v3",
  },
  {
    name: "openai" as const,
    apiKey: () => process.env.OPENAI_API_KEY,
    baseURL: undefined, // OpenAI default
    model: "whisper-1",
  },
];

/**
 * Transcribe via Whisper.
 *
 * Whisper API has a hard 25 MB upload limit. Raw videos blow past that fast
 * (a 3-min phone clip is ~200 MB). So we extract a compact MP3 audio track
 * first (~1 MB/min), then send that to whichever provider is configured.
 */
export async function POST(request: Request) {
  const workDir = join(tmpdir(), `transcribe-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const videoPath = join(workDir, "input.mp4");
  const audioPath = join(workDir, "audio.mp3");

  try {
    const { videoUrl } = await request.json();

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ error: "Missing videoUrl" }, { status: 400 });
    }

    const active = providers.find((p) => p.apiKey());
    if (!active) {
      return NextResponse.json(
        {
          error:
            "No transcription provider configured. Set GROQ_API_KEY (recommended, free at console.groq.com) or OPENAI_API_KEY.",
        },
        { status: 500 },
      );
    }

    await mkdir(workDir, { recursive: true });

    // 1. Download source video to /tmp
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json(
        { error: `Could not fetch video: ${videoRes.status}` },
        { status: 502 },
      );
    }
    await writeFile(videoPath, Buffer.from(await videoRes.arrayBuffer()));

    // 2. Extract audio as 64 kbps mono MP3. ~1 MB per minute — fits in Whisper's
    //    25 MB limit for up to ~25 minutes of source, plenty of headroom.
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioBitrate("64k")
        .audioChannels(1)
        .audioFrequency(16000)
        .on("end", () => resolve())
        .on("error", reject)
        .save(audioPath);
    });

    const audioBuf = await readFile(audioPath);
    const audioFile = new File([new Uint8Array(audioBuf)], "audio.mp3", {
      type: "audio/mpeg",
    });

    // 3. Try the preferred provider, fall back to others on failure.
    const attempts = providers.filter((p) => p.apiKey());
    let result: unknown = null;
    let lastError: string | null = null;

    for (const provider of attempts) {
      try {
        const client = new OpenAI({
          apiKey: provider.apiKey()!,
          baseURL: provider.baseURL,
        });

        result = await client.audio.transcriptions.create({
          file: audioFile,
          model: provider.model,
          response_format: "verbose_json",
          timestamp_granularities: ["segment", "word"],
        });

        console.log(`Transcribed via ${provider.name} (${provider.model})`);
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = `${provider.name}: ${msg}`;
        console.warn(`Transcription via ${provider.name} failed:`, msg);
        // If the provider hit a quota/auth error, try the next one.
        continue;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: `All transcription providers failed. ${lastError ?? ""}`.trim() },
        { status: 502 },
      );
    }

    const r = result as {
      text: string;
      language?: string;
      segments?: Array<{ id: number; start: number; end: number; text: string }>;
      words?: Array<{ word: string; start: number; end: number }>;
    };

    const transcript: Transcript = {
      text: r.text,
      language: r.language,
      segments:
        r.segments?.map((s) => ({
          id: s.id,
          start: s.start,
          end: s.end,
          text: s.text,
        })) ?? [],
    };

    // Attach words to segments if the provider returned them
    if (r.words && transcript.segments.length > 0) {
      transcript.segments = transcript.segments.map((seg) => ({
        ...seg,
        words: r.words!.filter(
          (w) => w.start >= seg.start && w.end <= seg.end + 0.05,
        ),
      }));
    }

    await cleanupDir(workDir).catch(() => {});
    return NextResponse.json(transcript);
  } catch (error) {
    console.error("Transcription failed", error);
    await cleanupDir(workDir).catch(() => {});
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Transcription failed",
      },
      { status: 500 },
    );
  }
}

async function cleanupDir(dir: string): Promise<void> {
  const { readdir, rmdir } = await import("fs/promises");
  try {
    const files = await readdir(dir);
    await Promise.all(files.map((f) => unlink(join(dir, f)).catch(() => {})));
    await rmdir(dir).catch(() => {});
  } catch {
    // ignore
  }
}
