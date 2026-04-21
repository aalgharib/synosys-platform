import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Client-direct upload to Vercel Blob.
 *
 * Why: Vercel serverless functions have a hard 4.5 MB request body limit that
 * can't be raised even on Pro. So we can't proxy video bytes through this route.
 * Instead, the browser gets a short-lived signed token from us and uploads
 * directly to Blob storage (up to 5 GB).
 *
 * See: https://vercel.com/docs/storage/vercel-blob/client-upload
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Vercel Blob is not configured. Admin: create a Blob Store in the Vercel dashboard (Storage → Create Blob Store → connect to this project) and redeploy.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Enforce max size + mime type on the token before anything is uploaded.
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/x-matroska",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Could trigger post-processing here (e.g., queue transcription).
        // For the demo we do nothing; the client calls /transcribe itself.
        console.log("Blob uploaded:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload token generation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
