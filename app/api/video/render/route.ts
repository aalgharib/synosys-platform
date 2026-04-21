import { put } from "@vercel/blob";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import type {
  CaptionOperation,
  TitleOperation,
  VideoComposition,
  VideoOperation,
} from "../../../../src/types/videoEditor";

export const runtime = "nodejs";
export const maxDuration = 300; // Pro tier: up to 300s

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
}

export async function POST(request: Request) {
  const workDir = join(tmpdir(), `render-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const inputPath = join(workDir, "input.mp4");
  const subsPath = join(workDir, "subs.ass");
  const outputPath = join(workDir, "output.mp4");

  try {
    const { composition } = (await request.json()) as {
      composition: VideoComposition;
    };

    if (!composition || !composition.videoUrl) {
      return NextResponse.json({ error: "Missing composition" }, { status: 400 });
    }

    await mkdir(workDir, { recursive: true });

    // Download source video
    const videoRes = await fetch(composition.videoUrl);
    if (!videoRes.ok) throw new Error(`Failed to fetch source video: ${videoRes.status}`);
    const videoBuf = Buffer.from(await videoRes.arrayBuffer());
    await writeFile(inputPath, videoBuf);

    // Build ffmpeg filter graph
    const captions = composition.operations.filter(
      (o): o is CaptionOperation => o.type === "caption",
    );
    const trim = composition.operations.find(
      (o): o is Extract<VideoOperation, { type: "trim" }> => o.type === "trim",
    );
    const cuts = composition.operations.filter(
      (o): o is Extract<VideoOperation, { type: "cut" }> => o.type === "cut",
    );
    const startTitles = composition.operations.filter(
      (o): o is TitleOperation => o.type === "title" && o.position === "start",
    );
    const endTitles = composition.operations.filter(
      (o): o is TitleOperation => o.type === "title" && o.position === "end",
    );

    // Write ASS subtitle file (captions, relative to timeline post-trim)
    const startTitleOffset = startTitles.reduce((s, t) => s + t.duration, 0);
    const assContent = buildAssSubtitles(captions, {
      width: composition.width,
      height: composition.height,
      offsetSeconds: startTitleOffset,
    });
    await writeFile(subsPath, assContent, "utf8");

    // Base trim range
    const trimStart = trim?.start ?? 0;
    const trimEnd = trim?.end ?? composition.videoDuration;

    // Step 1: Process the source video (trim + cuts + scale to output size)
    const trimmedPath = join(workDir, "trimmed.mp4");

    const keepSegments = computeKeepSegments(trimStart, trimEnd, cuts);

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg(inputPath);

      if (keepSegments.length === 1) {
        cmd.setStartTime(keepSegments[0].start).setDuration(
          keepSegments[0].end - keepSegments[0].start,
        );
      } else {
        // Build concat filter for multiple segments
        const filterParts: string[] = [];
        keepSegments.forEach((seg, i) => {
          filterParts.push(
            `[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}]`,
          );
          filterParts.push(
            `[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`,
          );
        });
        const concatInputs = keepSegments
          .map((_, i) => `[v${i}][a${i}]`)
          .join("");
        filterParts.push(
          `${concatInputs}concat=n=${keepSegments.length}:v=1:a=1[outv][outa]`,
        );
        cmd.complexFilter(filterParts).outputOptions([
          "-map",
          "[outv]",
          "-map",
          "[outa]",
        ]);
      }

      cmd
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          `-vf`,
          `scale=${composition.width}:${composition.height}:force_original_aspect_ratio=increase,crop=${composition.width}:${composition.height}`,
          "-preset",
          "veryfast",
          "-movflags",
          "+faststart",
        ])
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(trimmedPath);
    });

    // Step 2: Generate title cards as still frames (if any) and concat
    const parts: string[] = [];
    for (let i = 0; i < startTitles.length; i++) {
      const titlePath = join(workDir, `title-start-${i}.mp4`);
      await renderTitleCard(startTitles[i], titlePath, {
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
      });
      parts.push(titlePath);
    }
    parts.push(trimmedPath);
    for (let i = 0; i < endTitles.length; i++) {
      const titlePath = join(workDir, `title-end-${i}.mp4`);
      await renderTitleCard(endTitles[i], titlePath, {
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
      });
      parts.push(titlePath);
    }

    const concatenatedPath = join(workDir, "concatenated.mp4");

    if (parts.length === 1) {
      // No title cards, just copy
      await new Promise<void>((resolve, reject) => {
        ffmpeg(parts[0])
          .outputOptions(["-c", "copy"])
          .on("end", () => resolve())
          .on("error", reject)
          .save(concatenatedPath);
      });
    } else {
      const concatListPath = join(workDir, "concat.txt");
      await writeFile(
        concatListPath,
        parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
      );
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(concatListPath)
          .inputOptions(["-f", "concat", "-safe", "0"])
          .videoCodec("libx264")
          .audioCodec("aac")
          .outputOptions(["-preset", "veryfast", "-movflags", "+faststart"])
          .on("end", () => resolve())
          .on("error", reject)
          .save(concatenatedPath);
      });
    }

    // Step 3: Burn in captions via ASS subtitles
    await new Promise<void>((resolve, reject) => {
      const assPath = subsPath.replace(/\\/g, "/").replace(/:/g, "\\:");
      ffmpeg(concatenatedPath)
        .videoFilters([`ass='${assPath}'`])
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions(["-preset", "veryfast", "-movflags", "+faststart"])
        .on("end", () => resolve())
        .on("error", reject)
        .save(outputPath);
    });

    // Upload rendered video to Blob
    const outputBuf = await readFile(outputPath);
    const blob = await put(
      `videos/rendered/${Date.now()}-output.mp4`,
      outputBuf,
      {
        access: "public",
        contentType: "video/mp4",
        addRandomSuffix: true,
      },
    );

    // Cleanup
    await cleanupDir(workDir).catch(() => {});

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Render failed", error);
    await cleanupDir(workDir).catch(() => {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Render failed" },
      { status: 500 },
    );
  }
}

function computeKeepSegments(
  trimStart: number,
  trimEnd: number,
  cuts: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> {
  if (cuts.length === 0) return [{ start: trimStart, end: trimEnd }];

  const sorted = [...cuts]
    .filter((c) => c.end > trimStart && c.start < trimEnd)
    .sort((a, b) => a.start - b.start);

  const segments: Array<{ start: number; end: number }> = [];
  let cursor = trimStart;
  for (const cut of sorted) {
    const cs = Math.max(cut.start, trimStart);
    const ce = Math.min(cut.end, trimEnd);
    if (cursor < cs) segments.push({ start: cursor, end: cs });
    cursor = Math.max(cursor, ce);
  }
  if (cursor < trimEnd) segments.push({ start: cursor, end: trimEnd });
  return segments;
}

function buildAssSubtitles(
  captions: CaptionOperation[],
  opts: { width: number; height: number; offsetSeconds: number },
): string {
  const header = `[Script Info]
Title: Synosys Captions
ScriptType: v4.00+
PlayResX: ${opts.width}
PlayResY: ${opts.height}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter,58,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,3,2,60,60,220,1
Style: Highlight,Inter,58,&H000BA5F5,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,3,2,60,60,220,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = captions
    .map((cap) => {
      const s = Math.max(0, cap.start + opts.offsetSeconds);
      const e = Math.max(s + 0.1, cap.end + opts.offsetSeconds);
      const text = applyHighlight(cap.text, cap.highlight);
      return `Dialogue: 0,${formatAssTime(s)},${formatAssTime(e)},Default,,0,0,0,,${text}`;
    })
    .join("\n");

  return header + events + "\n";
}

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds - Math.floor(seconds)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function applyHighlight(text: string, highlight?: string): string {
  if (!highlight) return text;
  const tokens = highlight.toLowerCase().split(/\s+/);
  const words = text.split(" ");
  return words
    .map((w) => {
      const clean = w.toLowerCase().replace(/[.,!?'"]/g, "");
      const hit = tokens.some((t) => clean.includes(t));
      return hit ? `{\\c&H000BA5F5&\\b1}${w}{\\c&H00FFFFFF&\\b1}` : w;
    })
    .join(" ");
}

async function renderTitleCard(
  title: TitleOperation,
  outputPath: string,
  opts: { width: number; height: number; fps: number },
): Promise<void> {
  const escapedTitle = escapeDrawText(title.text);
  const escapedSubtitle = title.subtitle ? escapeDrawText(title.subtitle) : "";

  const filters: string[] = [
    `drawtext=text='${escapedTitle}':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2-60`,
  ];
  if (escapedSubtitle) {
    filters.push(
      `drawtext=text='${escapedSubtitle}':fontcolor=0xAAAAAA:fontsize=32:x=(w-text_w)/2:y=(h-text_h)/2+60`,
    );
  }

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(`color=c=black:s=${opts.width}x${opts.height}:r=${opts.fps}:d=${title.duration}`)
      .inputFormat("lavfi")
      .input(`anullsrc=channel_layout=stereo:sample_rate=44100`)
      .inputFormat("lavfi")
      .inputOptions([`-t`, `${title.duration}`])
      .videoFilters(filters)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "veryfast",
        "-shortest",
        "-movflags",
        "+faststart",
      ])
      .on("end", () => resolve())
      .on("error", reject)
      .save(outputPath);
  });
}

function escapeDrawText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,");
}

async function cleanupDir(dir: string): Promise<void> {
  const { readdir } = await import("fs/promises");
  try {
    const files = await readdir(dir);
    await Promise.all(files.map((f) => unlink(join(dir, f)).catch(() => {})));
    const { rmdir } = await import("fs/promises");
    await rmdir(dir).catch(() => {});
  } catch {
    // ignore
  }
}
