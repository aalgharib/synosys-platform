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
src/
  components/
    Dashboard.tsx
    PosterCreator.tsx
    YoutubeThumbnailCreator.tsx
  hooks/
    useImageExport.ts
  types/
    platform.ts
  App.tsx
  main.tsx
```

## Notes

- The app currently uses the Tailwind CDN in `index.html` for utility classes.
- No environment variables are required for the current version.
