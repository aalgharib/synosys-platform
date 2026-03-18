import type {
  Branding,
  ImageConfig,
  PosterConfig,
  PosterImages,
  ThumbnailConfig,
} from "./types/platform";

export const defaultBranding: Branding = {
  platformLogo: "/branding/platform-logo.png",
  profilePic: "/branding/profile-pic.png",
};

export const defaultPosterImages: PosterImages = {
  logo: "/branding/poster-logo.png",
  qr: "/branding/poster-qr.png",
  bg: "/branding/poster-bg.png",
};

export const defaultPosterConfig: PosterConfig = {
  accentColor: "#00a7f4",
  opacity: 82,
  topLine1: "STOP LOSING CLIENTS",
  topLine2: "YOU ALREADY PAID TO ATTRACT",
  middleLine1: "Most businesses don't have a lead problem.",
  middleLine2: "They have a follow-up problem.",
  footerName: "AI Automation by SynoSys",
  footerTagline: "Answer - Qualify - Route 24/7",
  footerEmail: "Ali@synosys.io",
  footerPhone: "519-991-4046",
  footerWeb: "synosys.io",
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  textAlign: "left",
  topLine1Size: 36,
  topLine2Size: 30,
  middleLine1Size: 20,
  middleLine2Size: 23,
  footerNameSize: 20,
  footerMetaSize: 11,
  headlinePos: { x: 50, y: 18 },
  messagePos: { x: 50, y: 40 },
  footerPos: { x: 41, y: 72 },
};

export const defaultThumbnailImages: ImageConfig = {
  logo: "/branding/poster-logo.png",
  bg: "/branding/youtube-bg.svg",
  person: null,
};

export const defaultThumbnailConfig: ThumbnailConfig = {
  accentColor: "#FF0000",
  backgroundColor: "#020617",
  opacity: 40,
  mainHook: "THE ULTIMATE AI",
  glowHook: "SECRET",
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  glowIntensity: 20,
  mainFontSize: 72,
  glowFontSize: 96,
  logoPosition: "left",
  textAlign: "left",
  textPos: { x: 75, y: 50 },
};
