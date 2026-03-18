import type { ReactNode } from "react";

export interface Tool {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  color: string;
  hidden?: boolean;
  disabled?: boolean;
}

export interface Branding {
  platformLogo: string | null;
  profilePic: string;
}

export interface ImageConfig {
  logo: string;
  bg: string;
  person: string | null;
  qr?: string;
}

export interface ThumbnailConfig {
  accentColor: string;
  backgroundColor: string;
  opacity: number;
  mainHook: string;
  glowHook: string;
  fontFamily: string;
  glowIntensity: number;
  mainFontSize: number;
  glowFontSize: number;
  logoPosition: "left" | "right";
  textAlign: "left" | "center" | "right";
  textPos: { x: number; y: number };
}
