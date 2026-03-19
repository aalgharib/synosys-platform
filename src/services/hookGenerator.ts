import type {
  BrandKit,
  CampaignInput,
  HookVariant,
  IndustryTemplate,
} from "../types/platform";
import { createId } from "../utils/createId";

interface HookGenerationContext {
  brandKit: BrandKit;
  inputs: CampaignInput;
  template: IndustryTemplate;
}

const buildSupportingText = (
  angle: string,
  market: string,
  audience: string,
  platform: string,
) => `${angle} for ${audience} on ${platform}${market ? ` in ${market}` : ""}.`;

export const generateHookVariants = ({
  brandKit,
  inputs,
  template,
}: HookGenerationContext): HookVariant[] => {
  const market = inputs.cityRegion || brandKit.market;
  const offer = inputs.serviceOffer;
  const audience = inputs.targetAudience;
  const tone = brandKit.toneOfVoice;
  const urgency = inputs.urgency;
  const keywordA = template.hookKeywords[0];
  const keywordB = template.hookKeywords[1] ?? template.hookKeywords[0];
  const angleA = template.copyAngles[0];
  const angleB = template.copyAngles[1] ?? template.copyAngles[0];
  const angleC = template.copyAngles[2] ?? template.copyAngles[0];

  const variants: Omit<HookVariant, "id">[] = [
    {
      style: "short",
      platform: "social",
      headline: `${offer} for ${audience}`,
      supportingText: buildSupportingText(angleA, market, audience, "social"),
      tone,
      selected: true,
    },
    {
      style: "short",
      platform: "ads",
      headline: `${keywordA} starts here`,
      supportingText: buildSupportingText(angleB, market, audience, "ads"),
      tone,
      selected: false,
    },
    {
      style: "short",
      platform: "flyers",
      headline: `${urgency}: ${offer}`,
      supportingText: buildSupportingText(angleC, market, audience, "flyers"),
      tone,
      selected: false,
    },
    {
      style: "bold",
      platform: "ads",
      headline: `Stop losing ${audience} before they ever book`,
      supportingText: buildSupportingText(angleA, market, audience, "ads"),
      tone,
      selected: true,
    },
    {
      style: "bold",
      platform: "social",
      headline: `${market ? `${market}: ` : ""}${keywordB} without the follow-up gap`,
      supportingText: buildSupportingText(angleB, market, audience, "social"),
      tone,
      selected: false,
    },
    {
      style: "bold",
      platform: "landing page",
      headline: `Turn every inquiry into a booked next step`,
      supportingText: buildSupportingText(angleC, market, audience, "landing page"),
      tone,
      selected: false,
    },
    {
      style: "premium",
      platform: "flyers",
      headline: `${brandKit.brandName} helps ${audience} move faster`,
      supportingText: buildSupportingText(angleA, market, audience, "flyers"),
      tone,
      selected: false,
    },
    {
      style: "premium",
      platform: "ads",
      headline: `A more consistent way to book ${offer.toLowerCase()}`,
      supportingText: buildSupportingText(angleB, market, audience, "ads"),
      tone,
      selected: false,
    },
    {
      style: "platform",
      platform: "youtube",
      headline: `${keywordA.toUpperCase()} THAT GETS CLICKS`,
      supportingText: buildSupportingText(angleC, market, audience, "youtube"),
      tone,
      selected: true,
    },
    {
      style: "platform",
      platform: "instagram",
      headline: `${offer} + faster response = better conversions`,
      supportingText: buildSupportingText(angleA, market, audience, "instagram"),
      tone,
      selected: false,
    },
  ];

  return variants.map((variant) => ({
    ...variant,
    id: createId("hook"),
  }));
};
