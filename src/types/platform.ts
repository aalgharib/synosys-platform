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

export type PosterVariant =
  | "facebook-instagram"
  | "x-horizontal"
  | "comparison-template";

export type PosterTextAlign = "left" | "center" | "right";

export type ComparisonIconId =
  | "phone-missed"
  | "clock-3"
  | "user-x"
  | "zap"
  | "calendar-clock"
  | "calendar-check"
  | "badge-check"
  | "message-circle-more"
  | "headset"
  | "shield-check"
  | "trending-up"
  | "phone-off";

export interface ComparisonBulletItem {
  id: string;
  text: string;
  icon: ComparisonIconId;
  customIcon?: string | null;
}

export type PosterElementId =
  | "accent-panel"
  | "message-card"
  | "footer-card"
  | "qr-card"
  | "badge"
  | "info-panel";

export type PosterElementRole = "content" | "utility" | "decor";

export interface PosterElementState {
  id: PosterElementId;
  role: PosterElementRole;
  visible: boolean;
  removable: boolean;
}

export interface PosterConfig {
  accentColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  opacity: number;
  topLine1: string;
  topLine2: string;
  middleLine1: string;
  middleLine2: string;
  xBadgeText: string;
  xInfoPanelEyebrow: string;
  xInfoPanelTitle: string;
  xInfoPanelBody: string;
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
  logoPos: { x: number; y: number };
  logoSize: number;
  comparisonHeadline: string;
  comparisonLeftTitle: string;
  comparisonRightTitle: string;
  comparisonLeftBullets: ComparisonBulletItem[];
  comparisonRightBullets: ComparisonBulletItem[];
  comparisonSupportText: string;
  comparisonWebsiteText: string;
  comparisonBusinessName: string;
  comparisonHeadlineSize: number;
  comparisonTitleSize: number;
  comparisonBulletSize: number;
  comparisonSupportSize: number;
  comparisonWebsiteSize: number;
  comparisonBusinessNameSize: number;
  comparisonLeftPanelColor: string;
  comparisonRightPanelColor: string;
  comparisonSupportPanelColor: string;
  comparisonShowLeftPanel: boolean;
  comparisonShowRightPanel: boolean;
  comparisonShowSupportPanel: boolean;
  comparisonLeftPanelOpacity: number;
  comparisonRightPanelOpacity: number;
  comparisonSupportPanelOpacity: number;
  comparisonDividerColor: string;
  comparisonDividerX: number;
  comparisonPanelBottomInset: number;
  comparisonShowDividers: boolean;
  comparisonDividerStyle: "solid" | "soft" | "glow";
  comparisonHeadlineColor: string;
  comparisonTextColor: string;
  comparisonMutedTextColor: string;
  comparisonTextGlowColor: string;
  comparisonTextGlowIntensity: number;
  comparisonTextDepth: number;
  comparisonTextDepthOpacity: number;
  comparisonLeftIconColor: string;
  comparisonRightIconColor: string;
  comparisonRowGap: number;
  comparisonIconSize: number;
  comparisonShowSupportBackplate: boolean;
  comparisonSupportBackplateColor: string;
  comparisonSupportBackplateOpacity: number;
  comparisonSupportBackplateBlur: number;
  comparisonSupportBackplateWidth: number;
  comparisonSupportBackplateHeight: number;
  comparisonShowLeftGlow: boolean;
  comparisonLeftGlowColor: string;
  comparisonLeftGlowX: number;
  comparisonLeftGlowY: number;
  comparisonLeftGlowSize: number;
  comparisonLeftGlowOpacity: number;
  comparisonShowRightGlow: boolean;
  comparisonRightGlowColor: string;
  comparisonRightGlowX: number;
  comparisonRightGlowY: number;
  comparisonRightGlowSize: number;
  comparisonRightGlowOpacity: number;
}

export interface PosterImages {
  logo: string;
  qr: string;
  bg: string;
  comparisonLeftBg: string;
  comparisonRightBg: string;
  comparisonSupportBg: string;
}

export interface ImageConfig {
  logo: string;
  bg: string;
  person: string | null;
  qr?: string;
}

export type ThumbnailLayoutSide = "person-left" | "person-right";

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
  layoutSide: ThumbnailLayoutSide;
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
  variant?: PosterVariant;
  config: Partial<PosterConfig>;
  elements?: Partial<Record<PosterElementId, Partial<PosterElementState>>>;
  images?: Partial<PosterImages>;
}

export interface ThumbnailDraft {
  id: string;
  title: string;
  config: Partial<ThumbnailConfig>;
  images?: Partial<ImageConfig>;
}
