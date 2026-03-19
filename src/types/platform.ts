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

export type IndustryId =
  | "law-firms"
  | "real-estate"
  | "consulting"
  | "healthcare";

export type CampaignGoal =
  | "lead-capture"
  | "book-consultations"
  | "promote-offer"
  | "event-promo";

export type CampaignStatus = "draft" | "ready";

export type HookStyle = "short" | "bold" | "premium" | "platform";

export type AssetChannel =
  | "ads"
  | "social-posts"
  | "thumbnails"
  | "flyers"
  | "promos";

export type AssetFormat = "poster" | "thumbnail" | "social" | "flyer" | "promo";

export type AssetDestinationTool = "poster" | "youtube" | "none";

export type CTAIntent = "primary" | "secondary" | "qr";

export type LeadSource =
  | "website"
  | "phone"
  | "landing-page"
  | "social"
  | "referral"
  | "manual";

export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "booked"
  | "closed";

export interface BrandKit {
  id: string;
  brandName: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  toneOfVoice: string;
  defaultCtaText: string;
  bookingLink: string;
  market: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryTemplate {
  id: IndustryId;
  label: string;
  description: string;
  defaultOffer: string;
  defaultAudience: string;
  defaultGoal: CampaignGoal;
  defaultUrgency: string;
  promptPreset: string;
  hookKeywords: string[];
  copyAngles: string[];
  recommendedChannels: AssetChannel[];
}

export interface CampaignInput {
  name: string;
  businessType: string;
  serviceOffer: string;
  targetAudience: string;
  cityRegion: string;
  campaignGoal: CampaignGoal;
  urgency: string;
  platformFocus: string;
  ctaText: string;
  bookingLink: string;
  qrTargetLink: string;
}

export interface HookVariant {
  id: string;
  style: HookStyle;
  platform: string;
  headline: string;
  supportingText: string;
  tone: string;
  selected: boolean;
}

export interface CTAOption {
  id: string;
  label: string;
  text: string;
  url: string;
  intent: CTAIntent;
}

export interface AssetConcept {
  id: string;
  channel: AssetChannel;
  format: AssetFormat;
  title: string;
  headline: string;
  subheadline: string;
  body: string;
  ctaText: string;
  qrTargetLink: string;
  exportLabel: string;
  destinationTool: AssetDestinationTool;
  suggestedUse: string;
  platform: string;
  hookId?: string;
}

export interface AssetGroup {
  id: string;
  title: string;
  category: AssetChannel;
  description: string;
  items: AssetConcept[];
}

export interface CampaignPhase2Scaffold {
  landingPageCopyStatus: "not-started";
  adCopyStatus: "not-started";
  emailFollowUpStatus: "not-started";
  smsFollowUpStatus: "not-started";
  performanceDashboardStatus: "not-started";
}

export interface QRMetadata {
  targetLink: string;
  label: string;
  ready: boolean;
}

export interface CampaignPack {
  generatedAt: string;
  posterConcepts: AssetConcept[];
  thumbnailConcepts: AssetConcept[];
  socialCreativeVariants: AssetConcept[];
  promoAssets: AssetConcept[];
  hookVariants: HookVariant[];
  ctaOptions: CTAOption[];
  assetGroups: AssetGroup[];
  qrMetadata: QRMetadata;
  brandChannels: string[];
  phase2: CampaignPhase2Scaffold;
}

export interface CampaignRecord {
  id: string;
  status: CampaignStatus;
  templateId: IndustryId;
  brandKitId: string;
  inputs: CampaignInput;
  selectedHookIds: string[];
  generatedHooks: HookVariant[];
  selectedCtaId: string | null;
  ctaOptions: CTAOption[];
  assetGroups: AssetGroup[];
  qrMetadata: QRMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRecord {
  id: string;
  campaignId: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  notes: string;
  booked: boolean;
  contactName: string;
}

export interface PosterDraft {
  id: string;
  title: string;
  config: Partial<PosterConfig>;
  images?: Partial<PosterImages>;
}

export interface ThumbnailDraft {
  id: string;
  title: string;
  config: Partial<ThumbnailConfig>;
  images?: Partial<ImageConfig>;
}
