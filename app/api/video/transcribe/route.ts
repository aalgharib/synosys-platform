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
 * Transcribe via Whisper.
 *
 * Whisper API has a hard 25 MB upload limit. Raw videos blow past that fast
 * (a 3-min phone clip is ~200 MB). So we extract a compact MP3 audio track
 * first (~1 MB/min), then send that to Whisper.
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
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

    // 3. Send the small MP3 to Whisper with verbose timestamps
    const audioBuf = await readFile(audioPath);
    const audioFile = new File([new Uint8Array(audioBuf)], "audio.mp3", {
      type: "audio/mpeg",
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment", "word"],
    });

    const transcript: Transcript = {
      text: result.text,
      language: (result as unknown as { language?: string }).language,
      segments:
        (
          result as unknown as {
            segments?: Array<{ id: number; start: number; end: number; text: string }>;
          }
        ).segments?.map((s) => ({
          id: s.id,
          start: s.start,
          end: s.end,
          text: s.text,
        })) ?? [],
    };

    const words = (
      result as unknown as {
        words?: Array<{ word: string; start: number; end: number }>;
      }
    ).words;
    if (words && transcript.segments.length > 0) {
      transcript.segments = transcript.segments.map((seg) => ({
        ...seg,
        words: words.filter((w) => w.start >= seg.start && w.end <= seg.end + 0.05),
      }));
    }

    // Cleanup
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
