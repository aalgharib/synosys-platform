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

export type PosterTextAlign = "left" | "center" | "right";

export interface PosterConfig {
  accentColor: string;
  opacity: number;
  topLine1: string;
  topLine2: string;
  middleLine1: string;
  middleLine2: string;
  footerName: string;
  footerTagline: string;
  footerEmail: string;
  footerPhone: string;
  footerWeb: string;
  fontFamily: string;
  textAlign: PosterTextAlign;
  topLine1Size: number;
  topLine2Size: number;
  middleLine1Size: number;
  middleLine2Size: number;
  footerNameSize: number;
  footerMetaSize: number;
  headlinePos: { x: number; y: number };
  messagePos: { x: number; y: number };
  footerPos: { x: number; y: number };
}

export interface PosterImages {
  logo: string;
  qr: string;
  bg: string;
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
