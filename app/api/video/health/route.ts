import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Diagnostic endpoint for debugging env var + Blob Store connection.
 * Visit /api/video/health in a browser. Does NOT expose any secret values —
 * only reports whether each required env var is present and its length.
 */
export async function GET() {
  const required = [
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "BLOB_READ_WRITE_TOKEN",
  ] as const;

  const envStatus = Object.fromEntries(
    required.map((key) => {
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

  const allPresent = required.every((k) => Boolean(process.env[k]));

  return NextResponse.json(
    {
      ok: allPresent,
      message: allPresent
        ? "All required env vars are set."
        : "One or more env vars are missing. See `env` for details.",
      env: envStatus,
      runtime: {
        region: process.env.VERCEL_REGION ?? null,
        deploymentUrl: process.env.VERCEL_URL ?? null,
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      },
    },
    { status: allPresent ? 200 : 503 },
  );
}
