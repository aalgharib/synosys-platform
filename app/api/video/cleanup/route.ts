import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Bulk-delete Blob URLs. Called when the user clicks "Clear storage" or
 * when we auto-cleanup at end of a session. Accepts one URL or an array.
 *
 * Safety note: this endpoint can delete any public blob in this store.
 * If you expose this platform to multiple users, gate it with auth +
 * a pathname prefix check (see CLEANUP_SECRET option below).
 */
export async function POST(request: Request) {
  try {
    // Optional shared-secret gate. Set CLEANUP_SECRET in Vercel env vars and
    // the client must send it in the `x-cleanup-secret` header. If the env var
    // is unset, the endpoint is open (fine for single-user demo).
    const expectedSecret = process.env.CLEANUP_SECRET;
    if (expectedSecret) {
      const provided = request.headers.get("x-cleanup-secret");
      if (provided !== expectedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { urls } = (await request.json()) as { urls?: string[] };

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Expected { urls: string[] } with at least one URL" },
        { status: 400 },
      );
    }

    // Dedupe + filter to only Vercel Blob URLs (defense-in-depth against bad input)
    const clean = [...new Set(urls)].filter(
      (u) => typeof u === "string" && u.includes(".public.blob.vercel-storage.com"),
    );

    if (clean.length === 0) {
      return NextResponse.json(
        { ok: true, deleted: 0, skipped: urls.length },
        { status: 200 },
      );
    }

    // @vercel/blob `del` accepts an array and handles parallelization internally
    await del(clean);

    return NextResponse.json({ ok: true, deleted: clean.length });
  } catch (error) {
    console.error("Cleanup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 },
    );
  }
}
