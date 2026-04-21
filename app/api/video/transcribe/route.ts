import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { Transcript } from "../../../../src/types/videoEditor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
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

    // Fetch the video from Blob
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json(
        { error: `Could not fetch video: ${videoRes.status}` },
        { status: 502 },
      );
    }

    const videoBlob = await videoRes.blob();
    const videoFile = new File([videoBlob], "input.mp4", {
      type: videoBlob.type || "video/mp4",
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // verbose_json gives us segment-level timestamps
    const result = await openai.audio.transcriptions.create({
      file: videoFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment", "word"],
    });

    const transcript: Transcript = {
      text: result.text,
      language: (result as unknown as { language?: string }).language,
      segments:
        (result as unknown as { segments?: Array<{ id: number; start: number; end: number; text: string }> }).segments?.map(
          (s) => ({
            id: s.id,
            start: s.start,
            end: s.end,
            text: s.text,
          }),
        ) ?? [],
    };

    // Attach words to segments if available
    const words = (result as unknown as { words?: Array<{ word: string; start: number; end: number }> }).words;
    if (words && transcript.segments.length > 0) {
      transcript.segments = transcript.segments.map((seg) => ({
        ...seg,
        words: words.filter((w) => w.start >= seg.start && w.end <= seg.end + 0.05),
      }));
    }

    return NextResponse.json(transcript);
  } catch (error) {
    console.error("Transcription failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Transcription failed",
      },
      { status: 500 },
    );
  }
}
