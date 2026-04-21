import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Diagnostic endpoint for debugging env var + Blob Store connection.
 * Visit /api/video/health in a browser. Does NOT expose any secret values —
 * only reports whether each env var is present and its length.
 */
export async function GET() {
  const trackedVars = [
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "GROQ_API_KEY",
    "BLOB_READ_WRITE_TOKEN",
  ] as const;

  const envStatus = Object.fromEntries(
    trackedVars.map((key) => {
      const value = process.env[key];
      return [
        key,
        {
          present: Boolean(value),
          length: value?.length ?? 0,
          prefix: value ? value.slice(0, 8) + "..." : null,
        },
      ];
    }),
  );

  // Required: Anthropic, Blob, and at least one transcription provider
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const hasTranscription =
    Boolean(process.env.GROQ_API_KEY) || Boolean(process.env.OPENAI_API_KEY);

  const missing: string[] = [];
  if (!hasAnthropic) missing.push("ANTHROPIC_API_KEY");
  if (!hasBlob) missing.push("BLOB_READ_WRITE_TOKEN");
  if (!hasTranscription) missing.push("GROQ_API_KEY or OPENAI_API_KEY");

  const ok = missing.length === 0;
  const transcriptionProvider = process.env.GROQ_API_KEY
    ? "groq (preferred)"
    : process.env.OPENAI_API_KEY
      ? "openai"
      : "none";

  return NextResponse.json(
    {
      ok,
      message: ok
        ? "All required env vars are set."
        : `Missing: ${missing.join(", ")}`,
      missing,
      transcriptionProvider,
      env: envStatus,
      runtime: {
        region: process.env.VERCEL_REGION ?? null,
        deploymentUrl: process.env.VERCEL_URL ?? null,
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      },
    },
    { status: ok ? 200 : 503 },
  );
}
