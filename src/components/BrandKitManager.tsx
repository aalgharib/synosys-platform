import { ImagePlus, PlusCircle, Save } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { availableFontFamilies, defaultBrandKits } from "../defaults";
import type { BrandKit } from "../types/platform";
import { createId } from "../utils/createId";

interface BrandKitManagerProps {
  brandKits: BrandKit[];
  selectedBrandKitId: string;
  onSelectBrandKit: (brandKitId: string) => void;
  onSaveBrandKit: (brandKit: BrandKit) => void;
}

const createDraftBrandKit = (): BrandKit => {
  const timestamp = new Date().toISOString();

  return {
    id: createId("brand"),
    brandName: "",
    logo: null,
    primaryColor: defaultBrandKits[0].primaryColor,
    secondaryColor: defaultBrandKits[0].secondaryColor,
    fontFamily: defaultBrandKits[0].fontFamily,
    toneOfVoice: defaultBrandKits[0].toneOfVoice,
    defaultCtaText: defaultBrandKits[0].defaultCtaText,
    bookingLink: defaultBrandKits[0].bookingLink,
    market: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export default function BrandKitManager({
  brandKits,
  selectedBrandKitId,
  onSelectBrandKit,
  onSaveBrandKit,
}: BrandKitManagerProps) {
  const selectedBrandKit =
    brandKits.find((brandKit) => brandKit.id === selectedBrandKitId) ??
    brandKits[0] ??
    createDraftBrandKit();

  const [draft, setDraft] = useState<BrandKit>(selectedBrandKit);

  useEffect(() => {
    setDraft(selectedBrandKit);
  }, [selectedBrandKit]);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;

      if (!result) {
        return;
      }

      setDraft((previous) => ({
        ...previous,
        logo: result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const timestamp = new Date().toISOString();
    const nextBrandKit = {
      ...draft,
      brandName: draft.brandName.trim() || "Untitled Brand Kit",
      updatedAt: timestamp,
      createdAt: draft.createdAt || timestamp,
    };

    onSaveBrandKit(nextBrandKit);
    onSelectBrandKit(nextBrandKit.id);
  };

  const handleCreate = () => {
    setDraft(createDraftBrandKit());
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Brand Kits</h3>
              <p className="text-sm text-muted-foreground">
                Save reusable brand rules for every campaign.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="button-secondary px-3 py-2 text-xs font-bold"
            >
              <PlusCircle size={14} />
              New
            </button>
          </div>

          <div className="space-y-3">
            {brandKits.map((brandKit) => (
              <button
                key={brandKit.id}
                type="button"
                onClick={() => onSelectBrandKit(brandKit.id)}
                className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
                  selectedBrandKitId === brandKit.id
                    ? "border-primary/20 bg-primary/10"
                    : "surface-subtle hover:bg-accent/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-white shadow-sm overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: brandKit.secondaryColor }}
                  >
                    {brandKit.logo ? (
                      <img
                        src={brandKit.logo}
                        alt={brandKit.brandName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImagePlus size={16} className="text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {brandKit.brandName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {brandKit.market || "No market set"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Brand Kit Manager
            </h3>
            <p className="text-sm text-muted-foreground">
              Lock in brand name, tone, CTA defaults, and booking destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Brand Name
              </label>
              <input
                type="text"
                value={draft.brandName}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    brandName: event.target.value,
                  }))
                }
                className="input-base text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Market
              </label>
              <input
                type="text"
                value={draft.market}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    market: event.target.value,
                  }))
                }
                className="input-base text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Primary Color
              </label>
              <input
                type="color"
                value={draft.primaryColor}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    primaryColor: event.target.value,
                  }))
                }
                className="w-full h-11 rounded-xl border-0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Secondary Color
              </label>
              <input
                type="color"
                value={draft.secondaryColor}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    secondaryColor: event.target.value,
                  }))
                }
                className="w-full h-11 rounded-xl border-0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Font Family
              </label>
              <select
                value={draft.fontFamily}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    fontFamily: event.target.value,
                  }))
                }
                className="input-base text-sm"
              >
                {availableFontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tone of Voice
            </label>
            <input
              type="text"
              value={draft.toneOfVoice}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  toneOfVoice: event.target.value,
                }))
              }
              className="input-base text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Default CTA
              </label>
              <input
                type="text"
                value={draft.defaultCtaText}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    defaultCtaText: event.target.value,
                  }))
                }
                className="input-base text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Booking Link
              </label>
              <input
                type="url"
                value={draft.bookingLink}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    bookingLink: event.target.value,
                  }))
                }
                className="input-base text-sm"
              />
            </div>
          </div>

          <div className="surface-subtle flex items-center justify-between gap-4 px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Outputs generated from campaigns will inherit this brand kit.
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="button-primary px-4 py-3 text-sm font-bold"
            >
              <Save size={16} />
              Save Brand Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
