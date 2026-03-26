import type {
  BrandKit,
  Branding,
  CampaignPhase2Scaffold,
  ComparisonBulletItem,
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
    "headline" | "message" | "footer" | "logo",
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

const createComparisonBullets = (
  bullets: ComparisonBulletItem[],
): ComparisonBulletItem[] =>
  bullets.map((bullet) => ({
    ...bullet,
    customIcon: bullet.customIcon ?? null,
  }));

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
  "comparison-template": {},
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
      logo: { xMin: 10, xMax: 90, yMin: 6, yMax: 90 },
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
    headlineWidth: 46,
    messageWidth: 36,
    footerWidth: 28,
    logoHeight: 44,
    qrSize: 82,
    qrCaption: "Scan to Start",
    badgeText: "Built for X",
    dragBounds: {
      headline: { xMin: 23, xMax: 77, yMin: 8, yMax: 68 },
      message: { xMin: 18, xMax: 82, yMin: 14, yMax: 76 },
      footer: { xMin: 14, xMax: 86, yMin: 20, yMax: 84 },
      logo: { xMin: 5, xMax: 95, yMin: 5, yMax: 90 },
    },
  },
  "comparison-template": {
    id: "comparison-template",
    label: "Comparison Template",
    shortLabel: "Comparison",
    description:
      "Split comparison poster for before-vs-after business messaging on Facebook and Instagram.",
    platformLabel: "1536 x 1024",
    canvas: { width: 1536, height: 1024 },
    previewMaxWidth: 760,
    headlineWidth: 92,
    messageWidth: 48,
    footerWidth: 44,
    logoHeight: 72,
    qrSize: 0,
    qrCaption: "",
    badgeText: "Comparison",
    dragBounds: {
      headline: { xMin: 14, xMax: 86, yMin: 2, yMax: 14 },
      message: { xMin: 22, xMax: 78, yMin: 58, yMax: 73 },
      footer: { xMin: 28, xMax: 72, yMin: 76, yMax: 87 },
      logo: { xMin: 8, xMax: 92, yMin: 82, yMax: 96 },
    },
  },
};

export const defaultPosterImagesByVariant: Record<PosterVariant, PosterImages> = {
  "facebook-instagram": {
    logo: "/branding/poster-logo.png",
    qr: "/branding/poster-qr.png",
    bg: "/branding/poster-bg-x.png",
    comparisonLeftBg: "",
    comparisonRightBg: "",
    comparisonSupportBg: "",
  },
  "x-horizontal": {
    logo: "/branding/poster-logo.png",
    qr: "/branding/poster-qr.png",
    bg: "/branding/poster-bg-x.png",
    comparisonLeftBg: "",
    comparisonRightBg: "",
    comparisonSupportBg: "",
  },
  "comparison-template": {
    logo: "",
    qr: "",
    bg: "",
    comparisonLeftBg: "",
    comparisonRightBg: "",
    comparisonSupportBg: "",
  },
};

export const defaultPosterConfigByVariant: Record<PosterVariant, PosterConfig> = {
    "facebook-instagram": {
      accentColor: "#00a7f4",
      backgroundColor: "#020617",
      transparentBackground: false,
      opacity: 82,
    topLine1: "STOP LOSING CLIENTS",
    topLine2: "YOU ALREADY PAID TO ATTRACT",
    middleLine1: "Most businesses don't have a lead problem.",
    middleLine2: "They have a follow-up problem.",
    xBadgeText: "AI Powered",
    xInfoPanelEyebrow: "Campaign Angle",
    xInfoPanelTitle: "They have a follow-up problem.",
    xInfoPanelBody: "Answer - Qualify - Route 24/7",
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
    logoPos: { x: 10, y: 8 },
    logoSize: 72,
    comparisonHeadline: "Same leads. Different outcome.",
    comparisonLeftTitle: "Without SynoSys",
    comparisonRightTitle: "With SynoSys",
    comparisonLeftBullets: createComparisonBullets([
      { id: "without-1", text: "Missed calls", icon: "phone-missed" },
      { id: "without-2", text: "Slow follow-up", icon: "clock-3" },
      { id: "without-3", text: "Lost clients", icon: "user-x" },
    ]),
    comparisonRightBullets: createComparisonBullets([
      { id: "with-1", text: "Fast response", icon: "zap" },
      { id: "with-2", text: "24/7 intake", icon: "calendar-clock" },
      { id: "with-3", text: "More bookings", icon: "calendar-check" },
    ]),
    comparisonSupportText: "The faster business wins.",
    comparisonWebsiteText: "synosys.io",
    comparisonBusinessName: "The faster business wins.",
    comparisonHeadlineSize: 34,
    comparisonTitleSize: 28,
    comparisonBulletSize: 18,
    comparisonSupportSize: 22,
    comparisonWebsiteSize: 28,
    comparisonBusinessNameSize: 14,
    comparisonLeftPanelColor: "#d8394a",
    comparisonRightPanelColor: "#1d7fe8",
    comparisonSupportPanelColor: "#081a31",
    comparisonShowLeftPanel: true,
    comparisonShowRightPanel: true,
    comparisonShowSupportPanel: true,
    comparisonLeftPanelOpacity: 92,
    comparisonRightPanelOpacity: 92,
    comparisonSupportPanelOpacity: 88,
    comparisonDividerColor: "rgba(255,255,255,0.72)",
    comparisonDividerX: 50,
    comparisonPanelBottomInset: 18,
    comparisonShowDividers: true,
    comparisonDividerStyle: "soft",
    comparisonHeadlineColor: "#f8fafc",
    comparisonTextColor: "#ffffff",
    comparisonMutedTextColor: "rgba(255,255,255,0.82)",
    comparisonTextGlowColor: "#ffffff",
    comparisonTextGlowIntensity: 18,
    comparisonTextDepth: 3,
    comparisonTextDepthOpacity: 30,
    comparisonLeftIconColor: "#ffd0d5",
    comparisonRightIconColor: "#c4f56c",
    comparisonRowGap: 20,
    comparisonIconSize: 28,
    comparisonShowSupportBackplate: true,
    comparisonSupportBackplateColor: "#081a31",
    comparisonSupportBackplateOpacity: 48,
    comparisonSupportBackplateBlur: 26,
    comparisonSupportBackplateWidth: 46,
    comparisonSupportBackplateHeight: 10,
    comparisonShowLeftGlow: true,
    comparisonLeftGlowColor: "#ff99aa",
    comparisonLeftGlowX: 18,
    comparisonLeftGlowY: 76,
    comparisonLeftGlowSize: 18,
    comparisonLeftGlowOpacity: 22,
    comparisonShowRightGlow: true,
    comparisonRightGlowColor: "#8fd8ff",
    comparisonRightGlowX: 82,
    comparisonRightGlowY: 78,
    comparisonRightGlowSize: 20,
    comparisonRightGlowOpacity: 24,
  },
    "x-horizontal": {
      accentColor: "#00a7f4",
      backgroundColor: "#020617",
      transparentBackground: false,
      opacity: 76,
    topLine1: "TURN X ATTENTION",
    topLine2: "INTO QUALIFIED CONVERSATIONS",
    middleLine1:
      "Lead with one strong promise, support it with a short proof point, and keep the next step visible without crowding the frame.",
    middleLine2: "Make the hook, proof, and CTA land in one glance.",
    xBadgeText: "Built for X",
    xInfoPanelEyebrow: "Campaign Angle",
    xInfoPanelTitle: "They have a follow-up problem.",
    xInfoPanelBody: "Answer - Qualify - Route 24/7",
    footerName: "SynoSys AI Lead Systems",
    footerTagline: "Capture - Qualify - Book Faster",
    footerEmail: "Ali@synosys.io",
    footerPhone: "519-991-4046",
    footerWeb: "synosys.io/x",
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    textAlign: "center",
    topLine1Size: 36,
    topLine2Size: 20,
    middleLine1Size: 15,
    middleLine2Size: 18,
    footerNameSize: 17,
    footerMetaSize: 10,
    headlinePos: { x: 35, y: 16 },
    messagePos: { x: 35, y: 39 },
    footerPos: { x: 35, y: 71 },
    logoPos: { x: 6, y: 8 },
    logoSize: 72,
    comparisonHeadline: "Same leads. Different outcome.",
    comparisonLeftTitle: "Without SynoSys",
    comparisonRightTitle: "With SynoSys",
    comparisonLeftBullets: createComparisonBullets([
      { id: "without-1", text: "Missed calls", icon: "phone-missed" },
      { id: "without-2", text: "Slow follow-up", icon: "clock-3" },
      { id: "without-3", text: "Lost clients", icon: "user-x" },
    ]),
    comparisonRightBullets: createComparisonBullets([
      { id: "with-1", text: "Fast response", icon: "zap" },
      { id: "with-2", text: "24/7 intake", icon: "calendar-clock" },
      { id: "with-3", text: "More bookings", icon: "calendar-check" },
    ]),
    comparisonSupportText: "The faster business wins.",
    comparisonWebsiteText: "synosys.io",
    comparisonBusinessName: "The faster business wins.",
    comparisonHeadlineSize: 34,
    comparisonTitleSize: 28,
    comparisonBulletSize: 18,
    comparisonSupportSize: 22,
    comparisonWebsiteSize: 28,
    comparisonBusinessNameSize: 14,
    comparisonLeftPanelColor: "#d8394a",
    comparisonRightPanelColor: "#1d7fe8",
    comparisonSupportPanelColor: "#081a31",
    comparisonShowLeftPanel: true,
    comparisonShowRightPanel: true,
    comparisonShowSupportPanel: true,
    comparisonLeftPanelOpacity: 92,
    comparisonRightPanelOpacity: 92,
    comparisonSupportPanelOpacity: 88,
    comparisonDividerColor: "rgba(255,255,255,0.72)",
    comparisonDividerX: 50,
    comparisonPanelBottomInset: 18,
    comparisonShowDividers: true,
    comparisonDividerStyle: "soft",
    comparisonHeadlineColor: "#f8fafc",
    comparisonTextColor: "#ffffff",
    comparisonMutedTextColor: "rgba(255,255,255,0.82)",
    comparisonTextGlowColor: "#ffffff",
    comparisonTextGlowIntensity: 18,
    comparisonTextDepth: 3,
    comparisonTextDepthOpacity: 30,
    comparisonLeftIconColor: "#ffd0d5",
    comparisonRightIconColor: "#c4f56c",
    comparisonRowGap: 20,
    comparisonIconSize: 28,
    comparisonShowSupportBackplate: true,
    comparisonSupportBackplateColor: "#081a31",
    comparisonSupportBackplateOpacity: 48,
    comparisonSupportBackplateBlur: 26,
    comparisonSupportBackplateWidth: 46,
    comparisonSupportBackplateHeight: 10,
    comparisonShowLeftGlow: true,
    comparisonLeftGlowColor: "#ff99aa",
    comparisonLeftGlowX: 18,
    comparisonLeftGlowY: 76,
    comparisonLeftGlowSize: 18,
    comparisonLeftGlowOpacity: 22,
    comparisonShowRightGlow: true,
    comparisonRightGlowColor: "#8fd8ff",
    comparisonRightGlowX: 82,
    comparisonRightGlowY: 78,
    comparisonRightGlowSize: 20,
    comparisonRightGlowOpacity: 24,
  },
    "comparison-template": {
      accentColor: "#8fd8ff",
      backgroundColor: "#071b34",
      transparentBackground: false,
      opacity: 18,
    topLine1: "SAME LEADS.",
    topLine2: "DIFFERENT OUTCOME.",
    middleLine1: "The faster business wins.",
    middleLine2: "synosys.io",
    xBadgeText: "Comparison",
    xInfoPanelEyebrow: "Campaign Angle",
    xInfoPanelTitle: "Same leads. Different outcome.",
    xInfoPanelBody: "Compare the cost of slow follow-up against 24/7 response.",
    footerName: "SynoSys",
    footerTagline: "The faster business wins.",
    footerEmail: "hello@synosys.io",
    footerPhone: "519-991-4046",
    footerWeb: "synosys.io",
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    textAlign: "center",
    topLine1Size: 36,
    topLine2Size: 30,
    middleLine1Size: 22,
    middleLine2Size: 28,
    footerNameSize: 17,
    footerMetaSize: 12,
    headlinePos: { x: 50, y: 4.4 },
    messagePos: { x: 50, y: 61.2 },
    footerPos: { x: 50, y: 80.8 },
    logoPos: { x: 50, y: 90.6 },
    logoSize: 56,
    comparisonHeadline: "Same leads. Different outcome.",
    comparisonLeftTitle: "Without SynoSys",
    comparisonRightTitle: "With SynoSys",
    comparisonLeftBullets: createComparisonBullets([
      { id: "without-1", text: "Missed calls", icon: "phone-missed" },
      { id: "without-2", text: "Slow follow-up", icon: "clock-3" },
      { id: "without-3", text: "Lost clients", icon: "user-x" },
    ]),
    comparisonRightBullets: createComparisonBullets([
      { id: "with-1", text: "Fast response", icon: "zap" },
      { id: "with-2", text: "24/7 intake", icon: "calendar-clock" },
      { id: "with-3", text: "More bookings", icon: "calendar-check" },
    ]),
    comparisonSupportText: "The faster business wins.",
    comparisonWebsiteText: "synosys.io",
    comparisonBusinessName: "The faster business wins.",
    comparisonHeadlineSize: 30,
    comparisonTitleSize: 24,
    comparisonBulletSize: 14,
    comparisonSupportSize: 18,
    comparisonWebsiteSize: 24,
    comparisonBusinessNameSize: 10,
    comparisonLeftPanelColor: "#d63a4a",
    comparisonRightPanelColor: "#1884f1",
    comparisonSupportPanelColor: "#0b1e39",
    comparisonShowLeftPanel: true,
    comparisonShowRightPanel: true,
    comparisonShowSupportPanel: true,
    comparisonLeftPanelOpacity: 88,
    comparisonRightPanelOpacity: 88,
    comparisonSupportPanelOpacity: 84,
    comparisonDividerColor: "rgba(255,255,255,0.72)",
    comparisonDividerX: 50,
    comparisonPanelBottomInset: 0,
    comparisonShowDividers: true,
    comparisonDividerStyle: "soft",
    comparisonHeadlineColor: "#f8fafc",
    comparisonTextColor: "#ffffff",
    comparisonMutedTextColor: "rgba(255,255,255,0.82)",
    comparisonTextGlowColor: "#f8fbff",
    comparisonTextGlowIntensity: 26,
    comparisonTextDepth: 4,
    comparisonTextDepthOpacity: 38,
    comparisonLeftIconColor: "#ffc7cf",
    comparisonRightIconColor: "#a6f04f",
    comparisonRowGap: 14,
    comparisonIconSize: 18,
    comparisonShowSupportBackplate: true,
    comparisonSupportBackplateColor: "#0b1e39",
    comparisonSupportBackplateOpacity: 56,
    comparisonSupportBackplateBlur: 34,
    comparisonSupportBackplateWidth: 42,
    comparisonSupportBackplateHeight: 9,
    comparisonShowLeftGlow: true,
    comparisonLeftGlowColor: "#ff9aae",
    comparisonLeftGlowX: 20,
    comparisonLeftGlowY: 74,
    comparisonLeftGlowSize: 22,
    comparisonLeftGlowOpacity: 26,
    comparisonShowRightGlow: true,
    comparisonRightGlowColor: "#8fd8ff",
    comparisonRightGlowX: 82,
    comparisonRightGlowY: 72,
    comparisonRightGlowSize: 26,
    comparisonRightGlowOpacity: 32,
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
  {
    id: "comparison-template-default",
    variant: "comparison-template",
    label: "Comparison Poster",
    description:
      "Reference-inspired split comparison poster for before-vs-after messaging.",
    config: {
      comparisonHeadline: "Same leads. Different outcome.",
      comparisonLeftTitle: "Without SynoSys",
      comparisonRightTitle: "With SynoSys",
      comparisonSupportText: "The faster business wins.",
      comparisonWebsiteText: "synosys.io",
      comparisonBusinessName: "The faster business wins.",
      headlinePos: { x: 50, y: 4.4 },
      messagePos: { x: 50, y: 61.2 },
      footerPos: { x: 50, y: 80.8 },
      logoPos: { x: 50, y: 90.6 },
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
