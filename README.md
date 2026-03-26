# SynoSys Platform

SynoSys Platform is a Vite + React internal marketing operations app for building campaign assets, managing brand kits, and tracking campaign-linked leads.

## Overview

The app currently combines several tools inside a single dashboard-style SPA:

- Campaign Studio
- Brand Kit management
- Poster Creator with Facebook / Instagram vertical, X horizontal, and Comparison Template variants
- YouTube Thumbnail Creator
- Lead Tracker
- Theme switching for light, dark, and system modes

Brand kits, campaigns, and leads are persisted in `localStorage` through the repository layer in `src/repositories/platformRepository.ts`.

## Current Features

- Dashboard shell with sidebar navigation
- Campaign Studio for generating campaign packs by industry
- Hook generation based on brand kit, offer, market, and industry template inputs
- CTA generation and QR-ready metadata
- Grouped asset concepts for ads, social posts, thumbnails, flyers, and promos
- Brand Kit management with editable colors, typography, tone, market, CTA, and booking link defaults
- Poster Creator with editable text, images, layout, export-ready drafts, and Facebook / Instagram vertical, X horizontal, plus Comparison Template poster modes
- X horizontal poster defaults tuned for a cleaner composition, with optional removable X-only elements such as the message card, info card, QR card, accent panel, badge, and side panel
- Comparison Template with editable left/right comparison panels, per-row icons, custom icon uploads, logo uploads, side-specific images, divider controls, and exact-size 1536 x 1024 export
- YouTube Thumbnail Creator with editable hooks, glow styling, colors, left/right person-text layout switching, and draft handoff from campaign assets
- Lead Tracker for campaign-linked leads and statuses
- Persistent user data stored locally in the browser
- Theme persistence across sessions

## Creative Tool Notes

- Poster Creator keeps the original Facebook / Instagram vertical layout intact while adding an X horizontal variant with its own defaults, assets, spacing, and starter presets.
- The horizontal X poster includes an element control layer in the editor so optional cards and decorative containers can be selected, removed, and restored without affecting the core canvas.
- The default horizontal X composition intentionally hides the extra badge and side-panel treatment, so the poster starts from a cleaner marketing layout by default.
- The Comparison Template is reference-sized at `1536 x 1024` and is designed for side-by-side before/after marketing posters with editable panel colors, panel visibility, panel opacity, divider position/style, logo placement, and side-specific image uploads.
- Comparison bullets support editable text, Lucide icon selection, and optional custom icon uploads per row.
- The YouTube Thumbnail Creator includes a `Layout Side` control that swaps only the person cutout and text block from left-to-right or right-to-left while leaving logo positioning independent.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide React
- ESLint

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Styling Notes

This project does not rely on the Tailwind CDN.

Before both `dev` and `build`, it runs:

```bash
node scripts/generate-tailwind-css.mjs
```

That script compiles utility classes into:

```text
src/tailwind.generated.css
```

The generated stylesheet is imported from `src/main.tsx`.

## Data Persistence

The platform stores user data in `localStorage` under these keys:

- `synosys.platform.brandKits`
- `synosys.platform.campaigns`
- `synosys.platform.leads`
- `synosys-theme`

Because persistence is browser-based, no backend or environment variables are required for the current version.

## Vercel Deployment

This project is deployable to Vercel as a Vite app.

Recommended settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

The included `vercel.json` already points to the Vite build output.

## Deployment Readiness

- Production build command: `npm run build`
- Local lint check: `npm run lint`
- TypeScript build check: `npx tsc -b`
- Output directory: `dist`
- No runtime environment variables are required for the current SPA deployment flow.
- Browser-stored data is local to each client because persistence is handled with `localStorage`.

## Project Structure

```text
public/
  branding/
src/
  components/
    BrandKitManager.tsx
    CampaignStudio.tsx
    Dashboard.tsx
    LeadTracker.tsx
    PosterCreator.tsx
    posterCreatorComparison.tsx
    posterCreatorComparisonUtils.ts
    ThemeToggle.tsx
    YoutubeThumbnailCreator.tsx
  context/
    ThemeContext.tsx
  hooks/
    useImageExport.ts
  lib/
    theme.ts
  repositories/
    platformRepository.ts
  services/
    campaignGenerator.ts
    hookGenerator.ts
  types/
    platform.ts
  defaults.ts
  index.css
  tailwind.generated.css
  App.tsx
  main.tsx
scripts/
  generate-tailwind-css.mjs
```

## Notes

- The current app is no longer limited to just poster and thumbnail creation; the README now reflects the newer campaign, brand kit, and lead tracking workflows.
- Hook generation is currently template-driven inside the app, not powered by an external AI model.
- This repo is migratable to Next.js later, but it behaves more like an internal SPA than the public `synoai-website` project.
