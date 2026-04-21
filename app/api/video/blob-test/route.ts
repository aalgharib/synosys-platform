import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * End-to-end Blob Store test. Does a tiny server-side put() with the
 * BLOB_READ_WRITE_TOKEN. If this fails we know the token itself is bad
 * (stale / from a deleted store / wrong project).
 *
 * Visit /api/video/blob-test in the browser. Returns JSON.
 */
export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "BLOB_READ_WRITE_TOKEN not set" },
      { status: 503 },
    );
  }

  const pathname = `diagnostics/ping-${Date.now()}.txt`;

  try {
    const blob = await put(pathname, `hello from ${new Date().toISOString()}`, {
      access: "public",
      addRandomSuffix: true,
    });

    // Clean up the test blob so we don't leave litter
    try {
      await del(blob.url);
    } catch {
      // Don't fail the diagnostic if cleanup fails
    }

    return NextResponse.json({
      ok: true,
      message: "Blob Store is reachable and the token works.",
      uploadedUrl: blob.url,
      uploadedPathname: blob.pathname,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: message.toLowerCase().includes("forbidden") || message.toLowerCase().includes("store not found")
          ? "The BLOB_READ_WRITE_TOKEN env var is stale. Disconnect the Blob Store from this project, delete the env var if still listed, reconnect the store, then redeploy."
          : "See error message for details.",
      },
      { status: 500 },
    );
  }
}
