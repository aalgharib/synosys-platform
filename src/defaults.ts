import type {
  BrandKit,
  Branding,
  CampaignPhase2Scaffold,
  IndustryTemplate,
  ImageConfig,
  PosterConfig,
  PosterElementId,
  PosterElementRole,
  PosterElementState,
  PosterImages,
  PosterVariant,
  ThumbnailConfig,
} from "./types/platform";
import { createId } from "./utils/createId";

interface PosterVariantDefinition {
  id: PosterVariant;
  label: string;
  shortLabel: string;
  description: string;
  platformLabel: string;
  canvas: { width: number; height: number };
  previewMaxWidth: number;
  headlineWidth: number;
  messageWidth: number;
  footerWidth: number;
  logoHeight: number;
  qrSize: number;
  qrCaption: string;
  badgeText: string;
  dragBounds: Record<
    "headline" | "message" | "footer",
    { xMin: number; xMax: number; yMin: number; yMax: number }
  >;
}

export interface PosterStarterPreset {
  id: string;
  variant: PosterVariant;
  label: string;
  description: string;
  config: Partial<PosterConfig>;
  elements?: Partial<Record<PosterElementId, Partial<PosterElementState>>>;
  images?: Partial<PosterImages>;
}

interface PosterElementDefinition {
  id: PosterElementId;
  label: string;
  description: string;
  role: PosterElementRole;
  removable: boolean;
  defaultVisible: boolean;
}

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

export const defaultPosterVariant: PosterVariant = "facebook-instagram";

export const horizontalPosterElementOrder: PosterElementId[] = [
  "message-card",
  "footer-card",
  "qr-card",
  "accent-panel",
  "badge",
  "info-panel",
];

export const horizontalPosterElementDefinitions: Record<
  PosterElementId,
  PosterElementDefinition
> = {
  "accent-panel": {
    id: "accent-panel",
    label: "Accent Panel",
    description: "Soft decorative glow and divider that frames the right edge.",
    role: "decor",
    removable: true,
    defaultVisible: true,
  },
  "message-card": {
    id: "message-card",
    label: "Message Card",
    description: "Supporting copy card below the main headline.",
    role: "content",
    removable: true,
    defaultVisible: true,
  },
  "footer-card": {
    id: "footer-card",
    label: "Info Card",
    description: "Brand, contact, and CTA details anchored near the footer.",
    role: "content",
    removable: true,
    defaultVisible: false,
  },
  "qr-card": {
    id: "qr-card",
    label: "QR Card",
    description: "Removable scan block for CTA-driven versions.",
    role: "utility",
    removable: true,
    defaultVisible: true,
  },
  badge: {
    id: "badge",
    label: "Status Badge",
    description: "Small top-right badge for campaign callouts.",
    role: "utility",
    removable: true,
    defaultVisible: false,
  },
  "info-panel": {
    id: "info-panel",
    label: "Side Panel",
    description: "Optional right-side card for extra context or promo notes.",
    role: "content",
    removable: true,
    defaultVisible: false,
  },
};

export const defaultPosterElementsByVariant: Record<
  PosterVariant,
  Partial<Record<PosterElementId, PosterElementState>>
> = {
  "facebook-instagram": {},
  "x-horizontal": horizontalPosterElementOrder.reduce<
    Partial<Record<PosterElementId, PosterElementState>>
  >((elements, elementId) => {
    const definition = horizontalPosterElementDefinitions[elementId];

    elements[elementId] = {
      id: definition.id,
      role: definition.role,
      visible: definition.defaultVisible,
      removable: definition.removable,
    };

    return elements;
  }, {}),
};

export const posterVariantDefinitions: Record<
  PosterVariant,
  PosterVariantDefinition
> = {
  "facebook-instagram": {
    id: "facebook-instagram",
    label: "Facebook + Instagram Poster",
    shortLabel: "FB / IG Vertical",
    description: "Vertical social poster sized for feed-friendly Facebook and Instagram posts.",
    platformLabel: "1080 x 1350",
    canvas: { width: 1080, height: 1350 },
    previewMaxWidth: 480,
    headlineWidth: 78,
    messageWidth: 82,
    footerWidth: 62,
    logoHeight: 40,
    qrSize: 64,
    qrCaption: "Scan to Start",
    badgeText: "AI Powered",
    dragBounds: {
      headline: { xMin: 20, xMax: 80, yMin: 8, yMax: 40 },
      message: { xMin: 21, xMax: 79, yMin: 24, yMax: 62 },
      footer: { xMin: 24, xMax: 76, yMin: 52, yMax: 84 },
    },
  },
  "x-horizontal": {
    id: "x-horizontal",
    label: "X Horizontal Poster",
    shortLabel: "X Horizontal",
    description: "Wide 16:9 poster built for X posts, headers, and horizontal promo graphics.",
    platformLabel: "1600 x 900",
    canvas: { width: 1600, height: 900 },
    previewMaxWidth: 860,
    headlineWidth: 55,
    messageWidth: 42,
    footerWidth: 30,
    logoHeight: 44,
    qrSize: 82,
    qrCaption: "Scan to Start",
    badgeText: "Built for X",
    dragBounds: {
      headline: { xMin: 18, xMax: 52, yMin: 10, yMax: 40 },
      message: { xMin: 18, xMax: 48, yMin: 30, yMax: 66 },
      footer: { xMin: 18, xMax: 42, yMin: 62, yMax: 84 },
    },
  },
};

export const defaultPosterImagesByVariant: Record<PosterVariant, PosterImages> = {
  "facebook-instagram": {
    logo: "/branding/poster-logo.png",
    qr: "/branding/poster-qr.png",
    bg: "/branding/poster-bg.png",
  },
  "x-horizontal": {
    logo: "/branding/poster-logo.png",
    qr: "/branding/poster-qr.png",
    bg: "/branding/poster-bg-x.svg",
  },
};

export const defaultPosterConfigByVariant: Record<PosterVariant, PosterConfig> = {
  "facebook-instagram": {
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
  },
  "x-horizontal": {
    accentColor: "#00a7f4",
    opacity: 74,
    topLine1: "TURN X ATTENTION",
    topLine2: "INTO QUALIFIED CONVERSATIONS",
    middleLine1:
      "Lead with one strong promise, support it with a short proof point, and keep the next step visible without crowding the frame.",
    middleLine2: "Make the hook, proof, and CTA land in one glance.",
    footerName: "SynoSys AI Lead Systems",
    footerTagline: "Capture - Qualify - Book Faster",
    footerEmail: "Ali@synosys.io",
    footerPhone: "519-991-4046",
    footerWeb: "synosys.io/x",
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    textAlign: "left",
    topLine1Size: 56,
    topLine2Size: 29,
    middleLine1Size: 21,
    middleLine2Size: 24,
    footerNameSize: 22,
    footerMetaSize: 11,
    headlinePos: { x: 33, y: 14 },
    messagePos: { x: 31, y: 38 },
    footerPos: { x: 24, y: 73 },
  },
};

export const posterStarterPresets: PosterStarterPreset[] = [
  {
    id: "vertical-lead-capture",
    variant: "facebook-instagram",
    label: "Lead Capture",
    description: "Classic SynoSys poster for paid traffic and local promo.",
    config: {
      topLine1: "STOP LOSING CLIENTS",
      topLine2: "YOU ALREADY PAID TO ATTRACT",
      middleLine1: "Most businesses don't have a lead problem.",
      middleLine2: "They have a follow-up problem.",
      footerTagline: "Answer - Qualify - Route 24/7",
      headlinePos: { x: 50, y: 18 },
      messagePos: { x: 50, y: 40 },
      footerPos: { x: 41, y: 72 },
    },
  },
  {
    id: "vertical-authority-proof",
    variant: "facebook-instagram",
    label: "Authority Proof",
    description: "Built for trust-led offers and social proof heavy messaging.",
    config: {
      topLine1: "LOOK PREMIUM",
      topLine2: "BEFORE THE FIRST CALL",
      middleLine1:
        "A strong poster should position your brand, the outcome, and the booking path in seconds.",
      middleLine2: "Give every inquiry a confident next step.",
      opacity: 78,
      topLine1Size: 40,
      middleLine1Size: 18,
      headlinePos: { x: 50, y: 16 },
      messagePos: { x: 50, y: 44 },
      footerPos: { x: 43, y: 73 },
    },
  },
  {
    id: "vertical-offer-promo",
    variant: "facebook-instagram",
    label: "Offer Promo",
    description: "Optimized for offer-led promos with a sharper CTA close.",
    config: {
      topLine1: "FREE AI INTAKE AUDIT",
      topLine2: "FOR SERVICE BUSINESSES READY TO SCALE",
      middleLine1:
        "Show the bottleneck, frame the opportunity, and move people to a single booking action.",
      middleLine2: "Book the audit. See the gaps. Fix the funnel.",
      accentColor: "#38bdf8",
      headlinePos: { x: 50, y: 17 },
      messagePos: { x: 50, y: 43 },
      footerPos: { x: 43, y: 74 },
    },
  },
  {
    id: "x-launch-thread",
    variant: "x-horizontal",
    label: "Launch Thread",
    description: "Wide launch poster for new offers, products, and thread kickoffs.",
    config: {
      topLine1: "ANNOUNCE THE OFFER",
      topLine2: "WITHOUT LOSING THE CTA",
      middleLine1:
        "Horizontal X creatives work best when the hook, context, and action are all visible before someone scrolls past.",
      middleLine2: "Lead with momentum. End with one clear action.",
      headlinePos: { x: 33, y: 14 },
      messagePos: { x: 31, y: 38 },
      footerPos: { x: 24, y: 73 },
    },
  },
  {
    id: "x-conversion-card",
    variant: "x-horizontal",
    label: "Conversion Card",
    description: "Ideal for performance-led X posts with a direct response angle.",
    config: {
      topLine1: "MAKE X WORK",
      topLine2: "LIKE A QUALIFIED LEAD CHANNEL",
      middleLine1:
        "Pair a bold headline with a compact proof block and a visible QR or link destination that reinforces the next step.",
      middleLine2: "Turn attention into booked conversations.",
      accentColor: "#22d3ee",
      opacity: 72,
      topLine1Size: 54,
      middleLine2Size: 27,
      headlinePos: { x: 32, y: 15 },
      messagePos: { x: 30, y: 39 },
      footerPos: { x: 24, y: 73 },
    },
  },
  {
    id: "x-event-promo",
    variant: "x-horizontal",
    label: "Event Promo",
    description: "A horizontal event layout for webinars, spaces, and live promos.",
    config: {
      topLine1: "PROMOTE THE EVENT",
      topLine2: "MAKE THE DATE FEEL URGENT",
      middleLine1:
        "Use the wide frame to stage the value prop on the left and keep your booking or registration path anchored in the lower band.",
      middleLine2: "Post it. Pin it. Reuse it across the campaign.",
      accentColor: "#60a5fa",
      topLine2Size: 30,
      middleLine1Size: 21,
      headlinePos: { x: 32, y: 14 },
      messagePos: { x: 30, y: 39 },
      footerPos: { x: 24, y: 73 },
    },
  },
];

export const defaultPosterImages: PosterImages =
  defaultPosterImagesByVariant[defaultPosterVariant];

export const defaultPosterConfig: PosterConfig =
  defaultPosterConfigByVariant[defaultPosterVariant];

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
  layoutSide: "person-left",
  logoPosition: "right",
  textAlign: "left",
  textPos: { x: 75, y: 55 },
};
