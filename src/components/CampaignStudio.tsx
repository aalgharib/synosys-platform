import {
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  LayoutTemplate,
  Megaphone,
  Save,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { defaultBrandKits, industryTemplates } from "../defaults";
import {
  createCampaignInputFromTemplate,
  createPosterDraftFromAsset,
  createThumbnailDraftFromAsset,
  generateCampaignPack,
  getIndustryTemplate,
} from "../services/campaignGenerator";
import { generateHookVariants } from "../services/hookGenerator";
import type {
  AssetGroup,
  BrandKit,
  CampaignGoal,
  CampaignInput,
  CampaignPack,
  CampaignRecord,
  CTAOption,
  HookVariant,
  IndustryId,
  PosterDraft,
  ThumbnailDraft,
} from "../types/platform";
import { createId } from "../utils/createId";
import BrandKitManager from "./BrandKitManager";

interface CampaignStudioProps {
  brandKits: BrandKit[];
  campaigns: CampaignRecord[];
  onSaveBrandKits: (brandKits: BrandKit[]) => void;
  onSaveCampaigns: (campaigns: CampaignRecord[]) => void;
  onOpenPosterDraft: (draft: PosterDraft) => void;
  onOpenThumbnailDraft: (draft: ThumbnailDraft) => void;
  onOpenLeadTracker: () => void;
}

type CampaignStudioSection = "builder" | "brand-kits" | "saved";

const sections: {
  id: CampaignStudioSection;
  label: string;
  icon: typeof Megaphone;
}[] = [
  { id: "builder", label: "Campaign Builder", icon: Megaphone },
  { id: "brand-kits", label: "Brand Kits", icon: BriefcaseBusiness },
  { id: "saved", label: "Saved Campaigns", icon: BookOpen },
];

const emptyPackFromRecord = (campaign: CampaignRecord): CampaignPack => {
  const posterConcepts = campaign.assetGroups
    .flatMap((group) => group.items)
    .filter((asset) => asset.destinationTool === "poster");
  const thumbnailConcepts = campaign.assetGroups
    .flatMap((group) => group.items)
    .filter((asset) => asset.destinationTool === "youtube");
  const socialCreativeVariants = campaign.assetGroups
    .flatMap((group) => group.items)
    .filter((asset) => asset.format === "social");
  const promoAssets = campaign.assetGroups
    .flatMap((group) => group.items)
    .filter((asset) => asset.format === "promo" || asset.format === "flyer");

  return {
    generatedAt: campaign.updatedAt,
    posterConcepts,
    thumbnailConcepts,
    socialCreativeVariants,
    promoAssets,
    hookVariants: campaign.generatedHooks,
    ctaOptions: campaign.ctaOptions,
    assetGroups: campaign.assetGroups,
    qrMetadata: campaign.qrMetadata,
    brandChannels: getIndustryTemplate(campaign.templateId).recommendedChannels,
    phase2: {
      landingPageCopyStatus: "not-started",
      adCopyStatus: "not-started",
      emailFollowUpStatus: "not-started",
      smsFollowUpStatus: "not-started",
      performanceDashboardStatus: "not-started",
    },
  };
};

const sortCampaigns = (campaigns: CampaignRecord[]) =>
  [...campaigns].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

export default function CampaignStudio({
  brandKits,
  campaigns,
  onSaveBrandKits,
  onSaveCampaigns,
  onOpenPosterDraft,
  onOpenThumbnailDraft,
  onOpenLeadTracker,
}: CampaignStudioProps) {
  const baseBrandKit = brandKits[0] ?? defaultBrandKits[0];
  const brandKitOptions = brandKits.length ? brandKits : [baseBrandKit];
  const [activeSection, setActiveSection] =
    useState<CampaignStudioSection>("builder");
  const [selectedBrandKitId, setSelectedBrandKitId] = useState(baseBrandKit.id);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<IndustryId>("real-estate");
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const resolvedSelectedBrandKitId = brandKitOptions.some(
    (brandKit) => brandKit.id === selectedBrandKitId,
  )
    ? selectedBrandKitId
    : brandKitOptions[0].id;

  const selectedBrandKit =
    brandKitOptions.find(
      (brandKit) => brandKit.id === resolvedSelectedBrandKitId,
    ) ?? baseBrandKit;

  const [inputs, setInputs] = useState<CampaignInput>(() =>
    createCampaignInputFromTemplate(selectedTemplateId, baseBrandKit),
  );
  const [hookVariants, setHookVariants] = useState<HookVariant[]>([]);
  const [ctaOptions, setCtaOptions] = useState<CTAOption[]>([]);
  const [selectedCtaId, setSelectedCtaId] = useState<string | null>(null);
  const [currentPack, setCurrentPack] = useState<CampaignPack | null>(null);

  const selectedTemplate = useMemo(
    () => getIndustryTemplate(selectedTemplateId),
    [selectedTemplateId],
  );

  const applyBrandKitDefaults = (
    nextBrandKit: BrandKit,
    previous: CampaignInput,
  ): CampaignInput => ({
    ...previous,
    ctaText: previous.ctaText || nextBrandKit.defaultCtaText,
    bookingLink: previous.bookingLink || nextBrandKit.bookingLink,
    qrTargetLink: previous.qrTargetLink || nextBrandKit.bookingLink,
    cityRegion: previous.cityRegion || nextBrandKit.market,
  });

  const validateInputs = () => {
    const nextErrors = [
      !inputs.name.trim() && "Campaign name is required.",
      !inputs.serviceOffer.trim() && "Service or offer is required.",
      !inputs.targetAudience.trim() && "Target audience is required.",
      !inputs.campaignGoal && "Campaign goal is required.",
    ].filter(Boolean) as string[];

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleTemplateChange = (templateId: IndustryId) => {
    setSelectedTemplateId(templateId);
    setInputs(createCampaignInputFromTemplate(templateId, selectedBrandKit));
    setHookVariants([]);
    setCtaOptions([]);
    setCurrentPack(null);
    setCurrentCampaignId(null);
  };

  const handleBrandKitChange = (brandKitId: string) => {
    const nextBrandKit =
      brandKitOptions.find((brandKit) => brandKit.id === brandKitId) ??
      selectedBrandKit;

    setSelectedBrandKitId(brandKitId);
    setInputs((previous) => applyBrandKitDefaults(nextBrandKit, previous));
  };

  const handleGenerateHooks = () => {
    if (!validateInputs()) {
      return;
    }

    const generatedHooks = generateHookVariants({
      brandKit: selectedBrandKit,
      inputs,
      template: selectedTemplate,
    });

    setHookVariants(generatedHooks);
  };

  const handleGenerateCampaignPack = () => {
    if (!validateInputs()) {
      return;
    }

    const pack = generateCampaignPack({
      brandKit: selectedBrandKit,
      inputs,
      templateId: selectedTemplateId,
    });

    setCurrentPack(pack);
    setHookVariants(pack.hookVariants);
    setCtaOptions(pack.ctaOptions);
    setSelectedCtaId(pack.ctaOptions[0]?.id ?? null);
  };

  const handleToggleHook = (hookId: string) => {
    setHookVariants((previous) =>
      previous.map((hook) =>
        hook.id === hookId ? { ...hook, selected: !hook.selected } : hook,
      ),
    );
  };

  const handleSaveBrandKit = (brandKit: BrandKit) => {
    const nextBrandKits = brandKits.some((existing) => existing.id === brandKit.id)
      ? brandKits.map((existing) =>
          existing.id === brandKit.id ? brandKit : existing,
        )
      : [brandKit, ...brandKits];

    onSaveBrandKits(nextBrandKits);
    setSelectedBrandKitId(brandKit.id);
  };

  const handleSaveCampaign = () => {
    if (!validateInputs()) {
      return;
    }

    const timestamp = new Date().toISOString();
    const nextCampaign: CampaignRecord = {
      id: currentCampaignId ?? createId("campaign"),
      status: currentPack ? "ready" : "draft",
      templateId: selectedTemplateId,
      brandKitId: selectedBrandKit.id,
      inputs,
      selectedHookIds: hookVariants
        .filter((hook) => hook.selected)
        .map((hook) => hook.id),
      generatedHooks: hookVariants,
      selectedCtaId,
      ctaOptions,
      assetGroups: currentPack?.assetGroups ?? [],
      qrMetadata: currentPack?.qrMetadata ?? {
        targetLink: inputs.qrTargetLink,
        label: inputs.ctaText,
        ready: Boolean(inputs.qrTargetLink),
      },
      createdAt:
        campaigns.find((campaign) => campaign.id === currentCampaignId)?.createdAt ??
        timestamp,
      updatedAt: timestamp,
    };

    const nextCampaigns = campaigns.some(
      (campaign) => campaign.id === nextCampaign.id,
    )
      ? campaigns.map((campaign) =>
          campaign.id === nextCampaign.id ? nextCampaign : campaign,
        )
      : [nextCampaign, ...campaigns];

    onSaveCampaigns(sortCampaigns(nextCampaigns));
    setCurrentCampaignId(nextCampaign.id);
    setActiveSection("saved");
  };

  const handleLoadCampaign = (campaign: CampaignRecord) => {
    setCurrentCampaignId(campaign.id);
    setSelectedBrandKitId(campaign.brandKitId);
    setSelectedTemplateId(campaign.templateId);
    setInputs(campaign.inputs);
    setHookVariants(campaign.generatedHooks);
    setCtaOptions(campaign.ctaOptions);
    setSelectedCtaId(campaign.selectedCtaId);
    setCurrentPack(emptyPackFromRecord(campaign));
    setErrors([]);
    setActiveSection("builder");
  };

  const handleCreateNewCampaign = () => {
    setCurrentCampaignId(null);
    setInputs(createCampaignInputFromTemplate(selectedTemplateId, selectedBrandKit));
    setHookVariants([]);
    setCtaOptions([]);
    setSelectedCtaId(null);
    setCurrentPack(null);
    setErrors([]);
    setActiveSection("builder");
  };

  const brandSummary = `${selectedBrandKit.brandName} / ${
    selectedBrandKit.market || "No market"
  }`;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight">
            Campaign <span className="text-blue-500">Revenue Studio.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Create grouped campaign assets, lock every output to a brand kit,
            and keep lead capture workflows connected to the creative work.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {brandSummary}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {selectedTemplate.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {currentPack ? "Pack ready" : "Draft in progress"}
            </span>
          </div>
        </div>
        <Sparkles className="absolute bottom-6 right-6 h-28 w-28 text-blue-500/20" />
      </div>

      <div className="flex flex-wrap gap-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                activeSection === section.id
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border bg-card text-card-foreground hover:bg-accent"
              }`}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {activeSection === "builder" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            <div className="surface-card p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Campaign Pack Generator
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Build grouped campaign assets around an offer, audience, and
                    CTA.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewCampaign}
                  className="button-secondary px-4 py-3 text-sm font-bold"
                >
                  New Campaign
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Industry Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(event) =>
                      handleTemplateChange(event.target.value as IndustryId)
                    }
                    className="input-base text-sm"
                  >
                    {industryTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Brand Kit
                  </label>
                  <select
                    value={resolvedSelectedBrandKitId}
                    onChange={(event) => handleBrandKitChange(event.target.value)}
                    className="input-base text-sm"
                  >
                    {brandKitOptions.map((brandKit) => (
                      <option key={brandKit.id} value={brandKit.id}>
                        {brandKit.brandName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={inputs.name}
                    onChange={(event) =>
                      setInputs((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className="input-base text-sm"
                  />
                </div>

                <Field
                  label="Business Type"
                  value={inputs.businessType}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      businessType: value,
                    }))
                  }
                />
                <Field
                  label="Service or Offer"
                  value={inputs.serviceOffer}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      serviceOffer: value,
                    }))
                  }
                />
                <Field
                  label="Target Audience"
                  value={inputs.targetAudience}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      targetAudience: value,
                    }))
                  }
                />
                <Field
                  label="City or Region"
                  value={inputs.cityRegion}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      cityRegion: value,
                    }))
                  }
                />
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Campaign Goal
                  </label>
                  <select
                    value={inputs.campaignGoal}
                    onChange={(event) =>
                      setInputs((previous) => ({
                        ...previous,
                        campaignGoal: event.target.value as CampaignGoal,
                      }))
                    }
                    className="input-base text-sm"
                  >
                    <option value="lead-capture">lead-capture</option>
                    <option value="book-consultations">book-consultations</option>
                    <option value="promote-offer">promote-offer</option>
                    <option value="event-promo">event-promo</option>
                  </select>
                </div>
                <Field
                  label="Urgency"
                  value={inputs.urgency}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      urgency: value,
                    }))
                  }
                />
                <Field
                  label="Platform Focus"
                  value={inputs.platformFocus}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      platformFocus: value,
                    }))
                  }
                />
                <Field
                  label="CTA Text"
                  value={inputs.ctaText}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      ctaText: value,
                    }))
                  }
                />
                <Field
                  label="Booking Link"
                  value={inputs.bookingLink}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      bookingLink: value,
                    }))
                  }
                  type="url"
                />
                <Field
                  label="QR Target Link"
                  value={inputs.qrTargetLink}
                  onChange={(value) =>
                    setInputs((previous) => ({
                      ...previous,
                      qrTargetLink: value,
                    }))
                  }
                  type="url"
                  className="md:col-span-2"
                />
              </div>

              {errors.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleGenerateHooks}
                  className="button-secondary px-4 py-3 text-sm font-bold"
                >
                  <Sparkles size={16} />
                  Generate Hooks
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCampaignPack}
                  className="button-primary px-4 py-3 text-sm font-bold"
                >
                  <LayoutTemplate size={16} />
                  Generate Campaign Pack
                </button>
                <button
                  type="button"
                  onClick={handleSaveCampaign}
                  className="button-secondary px-4 py-3 text-sm font-bold"
                >
                  <Save size={16} />
                  Save Campaign
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Industry Template
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Preset angles and defaults for the selected vertical.
                  </p>
                </div>
                <div className="surface-subtle p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{selectedTemplate.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {selectedTemplate.copyAngles.map((angle) => (
                      <div key={angle} className="flex items-start gap-2">
                        <CircleDot size={14} className="mt-0.5 text-blue-600" />
                        <span>{angle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="surface-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Phase 2 Ready
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Architecture scaffolds already included for follow-up and analytics.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Landing page copy generation",
                    "Ad copy generation",
                    "Email follow-up generation",
                    "SMS follow-up generation",
                    "Campaign performance dashboard",
                  ].map((item) => (
                    <div
                      key={item}
                      className="surface-subtle px-4 py-3 text-sm text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Hook Generator
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Short, bold, premium, and platform-specific options tied to the
                    selected brand and market.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground">
                  {hookVariants.length} hooks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hookVariants.length === 0 ? (
                  <div className="md:col-span-2 surface-subtle border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
                    Generate hooks to create variations you can save into the campaign.
                  </div>
                ) : (
                  hookVariants.map((hook) => (
                    <button
                      key={hook.id}
                      type="button"
                      onClick={() => handleToggleHook(hook.id)}
                      className={`rounded-2xl border px-5 py-4 text-left transition ${
                        hook.selected
                          ? "border-primary/20 bg-primary/10"
                          : "surface-subtle hover:bg-accent/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                          {hook.style}
                        </span>
                        {hook.selected ? (
                          <CheckCircle2 size={18} className="text-blue-600" />
                        ) : (
                          <CircleDot size={18} className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-4 text-lg font-bold text-foreground">
                        {hook.headline}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {hook.supportingText}
                      </p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {hook.platform} / {hook.tone}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="surface-card p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">CTA & QR Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Select the campaign CTA and keep the QR target ready for export.
                </p>
              </div>

              <div className="space-y-3">
                {ctaOptions.length === 0 ? (
                  <div className="surface-subtle border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    Generate a campaign pack to create CTA options and QR metadata.
                  </div>
                ) : (
                  ctaOptions.map((cta) => (
                    <button
                      key={cta.id}
                      type="button"
                      onClick={() => setSelectedCtaId(cta.id)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        selectedCtaId === cta.id
                          ? "border-primary/20 bg-primary/10"
                          : "surface-subtle hover:bg-accent/60"
                      }`}
                    >
                      <p className="font-bold text-foreground">{cta.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{cta.text}</p>
                      <p className="mt-2 text-xs text-muted-foreground break-all">
                        {cta.url}
                      </p>
                    </button>
                  ))
                )}
              </div>

              <div className="surface-subtle px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  QR-ready metadata
                </p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {currentPack?.qrMetadata.label ?? "No QR CTA yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground break-all">
                  {currentPack?.qrMetadata.targetLink ||
                    inputs.qrTargetLink ||
                    "Add a QR target link"}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenLeadTracker}
                className="button-secondary w-full px-4 py-3 text-sm font-bold"
              >
                Open Lead Tracker
              </button>
            </div>
          </div>

          <div className="surface-card p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Grouped Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Export-ready organization for ads, social posts, thumbnails,
                  flyers, and promos.
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground">
                {currentPack?.assetGroups.length ?? 0} groups
              </span>
            </div>

            <div className="space-y-6">
              {currentPack?.assetGroups.length ? (
                currentPack.assetGroups.map((group) => (
                  <AssetGroupCard
                    key={group.id}
                    group={group}
                    brandKit={selectedBrandKit}
                    onOpenPosterDraft={onOpenPosterDraft}
                    onOpenThumbnailDraft={onOpenThumbnailDraft}
                  />
                ))
              ) : (
                <div className="surface-subtle border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
                  Generate a campaign pack to organize assets by channel and
                  prepare them for export.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === "brand-kits" && (
        <BrandKitManager
          brandKits={brandKitOptions}
          selectedBrandKitId={resolvedSelectedBrandKitId}
          onSelectBrandKit={setSelectedBrandKitId}
          onSaveBrandKit={handleSaveBrandKit}
        />
      )}

      {activeSection === "saved" && (
        <div className="space-y-6">
          <div className="surface-card flex items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Saved Campaigns</h2>
              <p className="text-sm text-muted-foreground">
                Reopen campaigns with their selected brand kit, hooks, CTA choices,
                and grouped outputs.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateNewCampaign}
              className="button-primary px-4 py-3 text-sm font-bold"
            >
              Start New Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.length === 0 ? (
              <div className="lg:col-span-2 surface-subtle border-dashed px-5 py-12 text-center text-sm text-muted-foreground">
                No campaigns saved yet. Build a pack, choose hooks and CTA
                options, then save it here.
              </div>
            ) : (
              sortCampaigns(campaigns).map((campaign) => {
                const campaignBrandKit = brandKits.find(
                  (brandKit) => brandKit.id === campaign.brandKitId,
                );

                return (
                  <div
                    key={campaign.id}
                    className="surface-card p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          {campaign.inputs.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campaign.inputs.serviceOffer} /{" "}
                          {campaign.inputs.targetAudience}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          campaign.status === "ready"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span>
                          {campaignBrandKit?.brandName ?? "Unknown brand kit"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LayoutTemplate
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span>{getIndustryTemplate(campaign.templateId).label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span>
                          {
                            campaign.generatedHooks.filter((hook) => hook.selected)
                              .length
                          }{" "}
                          selected hooks
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{new Date(campaign.updatedAt).toLocaleString()}</span>
                      <span>
                        {campaign.assetGroups.reduce(
                          (total, group) => total + group.items.length,
                          0,
                        )}{" "}
                        assets
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleLoadCampaign(campaign)}
                        className="button-primary px-4 py-3 text-sm font-bold"
                      >
                        Open Campaign
                      </button>
                      <button
                        type="button"
                        onClick={onOpenLeadTracker}
                        className="button-secondary px-4 py-3 text-sm font-bold"
                      >
                        View Leads
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-base text-sm"
      />
    </div>
  );
}

function AssetGroupCard({
  group,
  brandKit,
  onOpenPosterDraft,
  onOpenThumbnailDraft,
}: {
  group: AssetGroup;
  brandKit: BrandKit;
  onOpenPosterDraft: (draft: PosterDraft) => void;
  onOpenThumbnailDraft: (draft: ThumbnailDraft) => void;
}) {
  return (
    <div className="surface-subtle p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h4 className="text-lg font-bold text-foreground">{group.title}</h4>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-card-foreground">
          {group.items.length} assets
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {group.items.map((asset) => (
          <div
            key={asset.id}
            className="surface-card p-4 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">{asset.title}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {asset.format} / {asset.platform}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-foreground">
                {asset.channel}
              </span>
            </div>

            <div>
              <p className="text-lg font-bold text-foreground">{asset.headline}</p>
              <p className="text-sm font-semibold text-muted-foreground">
                {asset.subheadline}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{asset.body}</p>

            <div className="surface-subtle px-4 py-3 text-sm text-muted-foreground">
              <p className="font-bold text-foreground">{asset.ctaText}</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {asset.qrTargetLink}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {asset.destinationTool === "poster" && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenPosterDraft(createPosterDraftFromAsset(asset, brandKit))
                  }
                  className="button-primary px-4 py-3 text-sm font-bold"
                >
                  Prepare Poster
                </button>
              )}
              {asset.destinationTool === "youtube" && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenThumbnailDraft(createThumbnailDraftFromAsset(asset, brandKit))
                  }
                  className="button-primary px-4 py-3 text-sm font-bold"
                >
                  Prepare Thumbnail
                </button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Export label:{" "}
              <span className="font-bold text-foreground">{asset.exportLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
