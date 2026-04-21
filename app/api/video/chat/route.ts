import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type {
  ChatMessage,
  Transcript,
  VideoComposition,
} from "../../../../src/types/videoEditor";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a video editor assistant inside the Synosys platform.

The user has uploaded a short video (max 60 seconds) and wants to edit it by describing changes in natural language. You MUST respond with structured JSON in this exact shape:

{
  "reply": "A short 1-2 sentence message explaining what you changed.",
  "composition": { ... full VideoComposition object ... }
}

The VideoComposition schema:
{
  "version": 1,
  "videoUrl": string (keep unchanged),
  "videoDuration": number (keep unchanged),
  "width": number (default 1080),
  "height": number (default 1920),
  "fps": number (default 30),
  "operations": Array<Operation>
}

Each Operation is one of:

1. Trim (keep only part of the source):
   { "type": "trim", "start": number (seconds), "end": number (seconds) }
   Only one trim per composition.

2. Cut (remove a segment from the middle):
   { "type": "cut", "start": number, "end": number }

3. Caption (text overlay on the video):
   {
     "type": "caption",
     "text": string,
     "start": number (seconds from timeline start, post-trim),
     "end": number,
     "style": "normal" | "bold" | "emphasis" (optional),
     "highlight": string (optional word(s) to highlight in amber)
   }

4. Title (card shown before or after the video):
   {
     "type": "title",
     "text": string,
     "subtitle": string (optional),
     "position": "start" | "end",
     "duration": number (seconds, default 3)
   }

5. Zoom (ken-burns style zoom):
   {
     "type": "zoom",
     "start": number,
     "end": number,
     "scale": number (e.g. 1.3),
     "x": number (0-1, optional center X),
     "y": number (0-1, optional center Y)
   }

Rules:
- Always return the FULL composition (you can modify the operations array, but include everything).
- When the user asks for "captions for what I said," use the transcript provided to generate caption operations for each segment. Use the segment times directly. Break long segments into shorter on-screen lines (~6-10 words each). Time them precisely. Add "highlight" for emotionally important words.
- Keep caption durations 1.5s - 4s. Do not let captions overlap in time.
- Highlight important keywords (nouns, verbs, numbers) in captions.
- Default to 1080x1920 vertical reel format.
- If the user asks something vague, make a reasonable editorial choice and explain it briefly in "reply".
- If the request is impossible or needs clarification, explain in "reply" and return the composition unchanged.

Return ONLY valid JSON, no markdown fences, no prose outside the JSON.`;

interface ChatRequestBody {
  messages: ChatMessage[];
  composition: VideoComposition;
  transcript: Transcript | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, composition, transcript } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    if (!composition) {
      return NextResponse.json(
        { error: "Missing composition" },
        { status: 400 },
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const contextMessage = `Current composition:
\`\`\`json
${JSON.stringify(composition, null, 2)}
\`\`\`

${
  transcript
    ? `Transcript (use these exact timestamps for word-level sync):
\`\`\`json
${JSON.stringify(
  {
    language: transcript.language,
    segments: transcript.segments.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })),
  },
  null,
  2,
)}
\`\`\``
    : `Transcript: not available yet.`
}`;

    // Build conversation. First user message carries the context.
    const apiMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
    messages.forEach((m, i) => {
      if (i === messages.length - 1 && m.role === "user") {
        apiMessages.push({
          role: "user",
          content: `${contextMessage}\n\nUser request: ${m.content}`,
        });
      } else {
        apiMessages.push({ role: m.role, content: m.content });
      }
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const raw = textBlock.text.trim();
    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: { reply: string; composition: VideoComposition };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude JSON:", cleaned.slice(0, 500));
      throw new Error("Claude returned invalid JSON");
    }

    if (!parsed.composition || !Array.isArray(parsed.composition.operations)) {
      throw new Error("Invalid composition shape from Claude");
    }

    // Re-anchor immutable fields (Claude shouldn't change these)
    const safeComposition: VideoComposition = {
      ...parsed.composition,
      version: 1,
      videoUrl: composition.videoUrl,
      videoDuration: composition.videoDuration,
      width: parsed.composition.width || composition.width,
      height: parsed.composition.height || composition.height,
      fps: parsed.composition.fps || composition.fps,
    };

    return NextResponse.json({
      reply: parsed.reply,
      composition: safeComposition,
    });
  } catch (error) {
    console.error("Chat failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    );
  }
}
