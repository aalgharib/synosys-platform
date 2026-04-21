import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  // Ensure ffmpeg binary is bundled with the render API route on Vercel
  outputFileTracingIncludes: {
    "/api/video/render": ["./node_modules/ffmpeg-static/ffmpeg*"],
  },
  serverExternalPackages: ["fluent-ffmpeg", "ffmpeg-static"],
};

export default nextConfig;
