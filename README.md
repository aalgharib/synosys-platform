# SynoSys Platform

SynoSys Platform is a React + TypeScript + Vite app for creating branded marketing assets.

Current tools included:

- Poster Creator
- YouTube Thumbnail Creator

## Features

- Editable brand logo and profile image from the UI
- Poster editor with draggable text blocks
- Poster typography controls for font family, alignment, and text sizes
- YouTube thumbnail editor with controls for colors, glow, font sizes, alignment, and background image
- PNG export using `html-to-image`

## Tech Stack

- React 19
- TypeScript
- Vite
- Lucide React

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

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

## Vercel Deployment

This project is ready to deploy on Vercel.

Recommended settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

You can deploy either by importing the Git repository into Vercel or by using the Vercel CLI.

### Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```

## Build Verification

Production build was verified successfully with:

```bash
npm run build
```

## Project Structure

```text
public/
  branding/
    platform-logo.svg
    profile-pic.svg
    poster-logo.svg
    poster-qr.svg
    poster-bg.svg
    youtube-logo.svg
    youtube-bg.svg
src/
  components/
    Dashboard.tsx
    PosterCreator.tsx
    YoutubeThumbnailCreator.tsx
  defaults.ts
  hooks/
    useImageExport.ts
  types/
    platform.ts
  App.tsx
  main.tsx
```

## Changing Default Setup

All default content is now centralized in:

`src/defaults.ts`

This file controls:

- default platform logo
- default profile image
- default poster logo
- default poster QR code
- default poster background
- default poster text, sizes, alignment, and positions
- default YouTube logo
- default YouTube background
- default YouTube text, sizes, glow, alignment, and colors

Default image assets are stored in:

`public/branding`

To change the default setup:

1. Replace the files inside `public/branding`
2. Update any paths or values in `src/defaults.ts`

## Notes

- The app currently uses the Tailwind CDN in `index.html` for utility classes.
- No environment variables are required for the current version.
