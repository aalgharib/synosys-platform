import {
  defaultCampaignPhase2Scaffold,
  industryTemplates,
} from "../defaults";
import type {
  AssetConcept,
  AssetGroup,
  BrandKit,
  CampaignInput,
  CampaignPack,
  CTAOption,
  IndustryId,
  IndustryTemplate,
  PosterDraft,
  ThumbnailDraft,
} from "../types/platform";
import { createId } from "../utils/createId";
import { generateHookVariants } from "./hookGenerator";

interface CampaignGenerationRequest {
  brandKit: BrandKit;
  inputs: CampaignInput;
  templateId: IndustryId;
}

const buildCtaOptions = (
  brandKit: BrandKit,
  inputs: CampaignInput,
  template: IndustryTemplate,
): CTAOption[] => {
  const primaryUrl = inputs.bookingLink || brandKit.bookingLink;
  const primaryText = inputs.ctaText || brandKit.defaultCtaText;

  return [
    {
      id: createId("cta"),
      label: "Primary CTA",
      text: primaryText,
      url: primaryUrl,
      intent: "primary",
    },
    {
      id: createId("cta"),
      label: "Secondary CTA",
      text: `See how ${template.label.toLowerCase()} workflows respond faster`,
      url: primaryUrl,
      intent: "secondary",
    },
    {
      id: createId("cta"),
      label: "QR CTA",
      text: `Scan to ${primaryText.toLowerCase()}`,
      url: inputs.qrTargetLink || primaryUrl,
      intent: "qr",
    },
  ];
};

const createAssetConcept = (
  overrides: Partial<AssetConcept> & Pick<AssetConcept, "channel" | "format" | "title">,
): AssetConcept => ({
  id: createId("asset"),
  headline: "",
  subheadline: "",
  body: "",
  ctaText: "",
  qrTargetLink: "",
  exportLabel: "",
  destinationTool: "none",
  suggestedUse: "",
  platform: "",
  ...overrides,
});

const groupAssets = (
  posterConcepts: AssetConcept[],
  thumbnailConcepts: AssetConcept[],
  socialCreativeVariants: AssetConcept[],
  promoAssets: AssetConcept[],
): AssetGroup[] => [
  {
    id: createId("group"),
    title: "Ads & Social",
    category: "ads",
    description: "Campaign variants organized for paid and organic distribution.",
    items: socialCreativeVariants,
  },
  {
    id: createId("group"),
    title: "Thumbnails",
    category: "thumbnails",
    description: "Hook-driven thumbnail concepts built for click-through testing.",
    items: thumbnailConcepts,
  },
  {
    id: createId("group"),
    title: "Flyers & Promos",
    category: "flyers",
    description: "Print and promo-ready concepts tied to your booking CTA.",
    items: [...posterConcepts, ...promoAssets],
  },
];

export const getIndustryTemplate = (templateId: IndustryId) =>
  industryTemplates.find((template) => template.id === templateId) ??
  industryTemplates[0];

export const createCampaignInputFromTemplate = (
  templateId: IndustryId,
  brandKit: BrandKit,
): CampaignInput => {
  const template = getIndustryTemplate(templateId);

  return {
    name: `${template.label} Conversion Campaign`,
    businessType: template.label,
    serviceOffer: template.defaultOffer,
    targetAudience: template.defaultAudience,
    cityRegion: brandKit.market,
    campaignGoal: template.defaultGoal,
    urgency: template.defaultUrgency,
    platformFocus: template.recommendedChannels[0] ?? "social-posts",
    ctaText: brandKit.defaultCtaText,
    bookingLink: brandKit.bookingLink,
    qrTargetLink: brandKit.bookingLink,
  };
};

export const generateCampaignPack = ({
  brandKit,
  inputs,
  templateId,
}: CampaignGenerationRequest): CampaignPack => {
  const template = getIndustryTemplate(templateId);
  const hookVariants = generateHookVariants({ brandKit, inputs, template });
  const ctaOptions = buildCtaOptions(brandKit, inputs, template);
  const primaryCta = ctaOptions[0];
  const qrCta = ctaOptions[2];
  const [leadHook, boldHook, thumbnailHook] = hookVariants;

  const posterConcepts = [
    createAssetConcept({
      channel: "flyers",
      format: "poster",
      title: "Lead Capture Poster",
      headline: leadHook?.headline ?? inputs.serviceOffer,
      subheadline: `${template.copyAngles[0]} for ${inputs.targetAudience}`,
      body: `Built for ${inputs.businessType} teams that need faster response, stronger qualification, and a consistent way to convert inquiries in ${inputs.cityRegion || brandKit.market}.`,
      ctaText: primaryCta.text,
      qrTargetLink: qrCta.url,
      exportLabel: `${inputs.name}-poster-lead-capture`,
      destinationTool: "poster",
      suggestedUse: "Front desk, print promos, and local outreach.",
      platform: "flyer",
      hookId: leadHook?.id,
    }),
    createAssetConcept({
      channel: "promos",
      format: "promo",
      title: "Booking Promo Flyer",
      headline: boldHook?.headline ?? primaryCta.text,
      subheadline: `${inputs.serviceOffer} with clear next steps`,
      body: `${brandKit.brandName} keeps campaigns on-brand while routing interested leads to your booking flow.`,
      ctaText: primaryCta.text,
      qrTargetLink: qrCta.url,
      exportLabel: `${inputs.name}-promo-booking`,
      destinationTool: "poster",
      suggestedUse: "Promo handouts, event materials, and QR-driven outreach.",
      platform: "promo",
      hookId: boldHook?.id,
    }),
  ];

  const thumbnailConcepts = [
    createAssetConcept({
      channel: "thumbnails",
      format: "thumbnail",
      title: "CTR Thumbnail",
      headline: thumbnailHook?.headline ?? "BOOK MORE LEADS",
      subheadline: inputs.serviceOffer.toUpperCase(),
      body: `Use for ${inputs.platformFocus} traffic with a ${brandKit.toneOfVoice.toLowerCase()} tone.`,
      ctaText: primaryCta.text,
      qrTargetLink: qrCta.url,
      exportLabel: `${inputs.name}-thumbnail-ctr`,
      destinationTool: "youtube",
      suggestedUse: "Video cover, webinar promo, or YouTube CTA test.",
      platform: "youtube",
      hookId: thumbnailHook?.id,
    }),
    createAssetConcept({
      channel: "thumbnails",
      format: "thumbnail",
      title: "Local Authority Thumbnail",
      headline: `${inputs.cityRegion || brandKit.market || template.label} READY`,
      subheadline: template.hookKeywords[0].toUpperCase(),
      body: `Built to reinforce local trust and faster conversion for ${inputs.targetAudience}.`,
      ctaText: primaryCta.text,
      qrTargetLink: qrCta.url,
      exportLabel: `${inputs.name}-thumbnail-local-authority`,
      destinationTool: "youtube",
      suggestedUse: "Local awareness and niche education campaigns.",
      platform: "youtube",
    }),
  ];

  const socialCreativeVariants = hookVariants.slice(0, 4).map((hook, index) =>
    createAssetConcept({
      channel: index % 2 === 0 ? "ads" : "social-posts",
      format: "social",
      title: `${hook.style[0].toUpperCase() + hook.style.slice(1)} ${hook.platform} variant`,
      headline: hook.headline,
      subheadline: inputs.serviceOffer,
      body: `${hook.supportingText} CTA: ${primaryCta.text}.`,
      ctaText: primaryCta.text,
      qrTargetLink: qrCta.url,
      exportLabel: `${inputs.name}-${hook.platform}-${hook.style}`,
      destinationTool: "none",
      suggestedUse: "Use as social copy and creative briefing.",
      platform: hook.platform,
      hookId: hook.id,
    }),
  );

  const promoAssets = hookVariants.slice(4, 7).map((hook, index) =>
    createAssetConcept({
      channel: "promos",
      format: index === 0 ? "flyer" : "promo",
      title: `${hook.style[0].toUpperCase() + hook.style.slice(1)} promo`,
      headline: hook.headline,
      subheadline: `${template.promptPreset} for ${inputs.cityRegion || brandKit.market}`,
      body: `Pair this concept with ${primaryCta.text.toLowerCase()} to keep response speed and booking intent front and center.`,
      ctaText: primaryCta.text,
      qrTargetLink: qrCta.url,
      exportLabel: `${inputs.name}-promo-${hook.style}`,
      destinationTool: "poster",
      suggestedUse: "Promo asset for offers, events, and local distribution.",
      platform: "promo",
      hookId: hook.id,
    }),
  );

  const assetGroups = groupAssets(
    posterConcepts,
    thumbnailConcepts,
    socialCreativeVariants,
    promoAssets,
  );

  return {
    generatedAt: new Date().toISOString(),
    posterConcepts,
    thumbnailConcepts,
    socialCreativeVariants,
    promoAssets,
    hookVariants,
    ctaOptions,
    assetGroups,
    qrMetadata: {
      targetLink: qrCta.url,
      label: qrCta.text,
      ready: Boolean(qrCta.url),
    },
    brandChannels: template.recommendedChannels,
    phase2: defaultCampaignPhase2Scaffold,
  };
};

export const createPosterDraftFromAsset = (
  asset: AssetConcept,
  brandKit: BrandKit,
): PosterDraft => ({
  id: createId("poster-draft"),
  title: asset.title,
  config: {
    accentColor: brandKit.primaryColor,
    topLine1: asset.headline,
    topLine2: asset.subheadline,
    middleLine1: asset.body,
    middleLine2: asset.ctaText,
    footerName: brandKit.brandName,
    footerTagline: brandKit.toneOfVoice,
    footerWeb: asset.qrTargetLink || brandKit.bookingLink,
    fontFamily: brandKit.fontFamily,
  },
  images: {
    logo: brandKit.logo ?? undefined,
  },
});

export const createThumbnailDraftFromAsset = (
  asset: AssetConcept,
  brandKit: BrandKit,
): ThumbnailDraft => ({
  id: createId("thumbnail-draft"),
  title: asset.title,
  config: {
    accentColor: brandKit.primaryColor,
    mainHook: asset.headline,
    glowHook: asset.subheadline,
    fontFamily: brandKit.fontFamily,
    backgroundColor: brandKit.secondaryColor,
  },
  images: {
    logo: brandKit.logo ?? undefined,
  },
});
