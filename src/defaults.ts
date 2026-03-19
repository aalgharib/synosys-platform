import type {
  BrandKit,
  Branding,
  CampaignPhase2Scaffold,
  IndustryTemplate,
  ImageConfig,
  PosterConfig,
  PosterImages,
  ThumbnailConfig,
} from "./types/platform";
import { createId } from "./utils/createId";

export const availableFontFamilies = [
  {
    label: "Space Grotesk",
    value: '"Space Grotesk", system-ui, sans-serif',
  },
  {
    label: "Impact",
    value: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  },
  {
    label: "Arial Black",
    value: "'Arial Black', Gadget, sans-serif",
  },
  {
    label: "Trebuchet",
    value: "'Trebuchet MS', sans-serif",
  },
  {
    label: "Georgia",
    value: "Georgia, serif",
  },
] as const;

export const defaultBranding: Branding = {
  platformLogo: "/branding/platform-logo.png",
  profilePic: "/branding/profile-pic.png",
};

const now = new Date().toISOString();

export const defaultBrandKits: BrandKit[] = [
  {
    id: createId("brand"),
    brandName: "SynoSys",
    logo: "/branding/poster-logo.png",
    primaryColor: "#00a7f4",
    secondaryColor: "#020617",
    fontFamily: availableFontFamilies[0].value,
    toneOfVoice: "Clear, confident, and conversion-focused",
    defaultCtaText: "Book Your Free AI Intake Audit",
    bookingLink: "https://synosys.io",
    market: "Ontario",
    createdAt: now,
    updatedAt: now,
  },
];

export const industryTemplates: IndustryTemplate[] = [
  {
    id: "law-firms",
    label: "Law Firms",
    description: "Designed for firms that need fast qualification and consult booking.",
    defaultOffer: "Free Case Review",
    defaultAudience: "high-intent legal prospects",
    defaultGoal: "book-consultations",
    defaultUrgency: "Urgent response within minutes",
    promptPreset: "Capture case details, screen fit, and route fast",
    hookKeywords: ["case review", "consultation", "intake"],
    copyAngles: [
      "Faster response to every legal inquiry",
      "Screen better-fit leads before staff time is spent",
      "Route cases with consistency and speed",
    ],
    recommendedChannels: ["ads", "thumbnails", "flyers"],
  },
  {
    id: "real-estate",
    label: "Real Estate Teams",
    description: "Built for buyer and seller campaigns where speed to lead matters.",
    defaultOffer: "Book a Buyer or Seller Strategy Call",
    defaultAudience: "buyers and sellers ready to act",
    defaultGoal: "lead-capture",
    defaultUrgency: "Respond before the next agent does",
    promptPreset: "Capture, qualify, and book showings faster",
    hookKeywords: ["showings", "buyer leads", "seller leads"],
    copyAngles: [
      "Speed to lead without adding admin overhead",
      "Qualify serious buyers and sellers faster",
      "Convert paid traffic into booked conversations",
    ],
    recommendedChannels: ["social-posts", "ads", "thumbnails"],
  },
  {
    id: "consulting",
    label: "Consultants",
    description: "For service experts selling discovery calls and authority-led campaigns.",
    defaultOffer: "Book a Strategy Session",
    defaultAudience: "decision-makers evaluating service partners",
    defaultGoal: "book-consultations",
    defaultUrgency: "Move from inquiry to booked strategy call quickly",
    promptPreset: "Position authority while keeping follow-up consistent",
    hookKeywords: ["strategy", "growth system", "consultation"],
    copyAngles: [
      "Turn interest into scheduled strategy calls",
      "Show premium positioning without slowing down response",
      "Keep every campaign aligned to an offer and CTA",
    ],
    recommendedChannels: ["social-posts", "ads", "flyers"],
  },
  {
    id: "healthcare",
    label: "Healthcare Clinics",
    description: "For clinics promoting appointment-led campaigns and intake clarity.",
    defaultOffer: "Schedule a Patient Consultation",
    defaultAudience: "patients looking for trusted care",
    defaultGoal: "book-consultations",
    defaultUrgency: "Make it easy to book the next available visit",
    promptPreset: "Simplify intake and appointment conversion",
    hookKeywords: ["appointments", "new patients", "consultation"],
    copyAngles: [
      "Help patients book the next step with confidence",
      "Keep intake consistent for staff and patients",
      "Promote availability without losing brand trust",
    ],
    recommendedChannels: ["flyers", "social-posts", "promos"],
  },
];

export const defaultCampaignPhase2Scaffold: CampaignPhase2Scaffold = {
  landingPageCopyStatus: "not-started",
  adCopyStatus: "not-started",
  emailFollowUpStatus: "not-started",
  smsFollowUpStatus: "not-started",
  performanceDashboardStatus: "not-started",
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
  person: "/branding/personCut-pic.png",
};

export const defaultThumbnailConfig: ThumbnailConfig = {
  accentColor: "#00a7f4",
  backgroundColor: "#020617",
  opacity: 40,
  mainHook: "THE ULTIMATE AI",
  glowHook: "SECRET",
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  glowIntensity: 20,
  mainFontSize: 72,
  glowFontSize: 96,
  logoPosition: "right",
  textAlign: "left",
  textPos: { x: 75, y: 55 },
};
