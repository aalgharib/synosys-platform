# Video Editor Tool

Chat-driven video editor for the Synosys platform. Upload a short clip, describe edits in natural language, preview instantly, and export an MP4.

## Flow

1. **Upload** (`POST /api/video/upload`) — multipart form → Vercel Blob (public URL)
2. **Transcribe** (`POST /api/video/transcribe`) — Whisper generates segment + word timestamps
3. **Chat** (`POST /api/video/chat`) — Claude receives the current composition + transcript and returns an updated `VideoComposition` JSON
4. **Preview** — `@remotion/player` renders the composition live in the browser
5. **Export** (`POST /api/video/render`) — ffmpeg applies trim/cut/title cards + burns captions via ASS subtitles → uploads to Blob → returns public URL

## Environment Variables

Set in Vercel → Project Settings → Environment Variables (Production + Preview):

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude chat (composition generation) |
| `OPENAI_API_KEY` | Whisper transcription |
| `BLOB_READ_WRITE_TOKEN` | Auto-populated when you add a Blob store |

Local: copy `.env.example` to `.env.local` and fill in your keys. For Blob, run `vercel env pull .env.local`.

## Vercel Setup Checklist

1. **Link project** — `vercel link` (should already be linked to platform.synosys.io)
2. **Add Blob store** — Vercel Dashboard → Storage → Create Blob Store (auto-injects `BLOB_READ_WRITE_TOKEN`)
3. **Set env vars** — Dashboard → Settings → Environment Variables
4. **Deploy** — `git push` (auto-deploys) or `vercel --prod`

Serverless function config is in `vercel.json`:
- `/api/video/render` — 300s timeout (Pro tier), 3008MB memory for ffmpeg
- Other routes — 60s timeout, default memory

## Composition Schema

See `src/types/videoEditor.ts`. The same `VideoComposition` JSON is consumed by:
- `@remotion/player` in the browser (`src/components/videoEditor/PreviewComposition.tsx`)
- ffmpeg on the server (`app/api/video/render/route.ts`)

Supported operations: `trim`, `cut`, `caption`, `title`, `zoom`.

## Current Limits

- 3 minutes (180s) max input video — fast-path limit, comfortable under Vercel's 300s render timeout
- 200MB max file size
- Portrait 1080×1920 default (reels/TikTok format)
- Single rendering pipeline (no job queue yet) — one export at a time per user

## v2 Deferred

- Remotion Lambda for renders > 5 min or 4k output
- Cloudflare R2 as Blob alternative
- Background music library
- Multiple source clips + multi-track editing
- Project persistence (localStorage → Supabase)
