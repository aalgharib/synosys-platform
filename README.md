# SynoSys Platform

SynoSys Platform is a Vite + React internal marketing operations app for building campaign assets, managing brand kits, and tracking campaign-linked leads.

## Overview

The app currently combines several tools inside a single dashboard-style SPA:

- Campaign Studio
- Brand Kit management
- Poster Creator
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
- Poster Creator with editable text, images, layout, and export-ready drafts
- YouTube Thumbnail Creator with editable hooks, glow styling, colors, and draft handoff from campaign assets
- Lead Tracker for campaign-linked leads and statuses
- Persistent user data stored locally in the browser
- Theme persistence across sessions

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
