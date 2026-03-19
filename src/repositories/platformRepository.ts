import { defaultBrandKits } from "../defaults";
import type { BrandKit, CampaignRecord, LeadRecord } from "../types/platform";

const STORAGE_KEYS = {
  brandKits: "synosys.platform.brandKits",
  campaigns: "synosys.platform.campaigns",
  leads: "synosys.platform.leads",
} as const;

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

const readCollection = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse storage key: ${key}`, error);
    return fallback;
  }
};

const writeCollection = <T,>(key: string, value: T) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const platformRepository = {
  listBrandKits(): BrandKit[] {
    return readCollection(STORAGE_KEYS.brandKits, defaultBrandKits);
  },
  saveBrandKits(brandKits: BrandKit[]) {
    writeCollection(STORAGE_KEYS.brandKits, brandKits);
  },
  listCampaigns(): CampaignRecord[] {
    return readCollection(STORAGE_KEYS.campaigns, []);
  },
  saveCampaigns(campaigns: CampaignRecord[]) {
    writeCollection(STORAGE_KEYS.campaigns, campaigns);
  },
  listLeads(): LeadRecord[] {
    return readCollection(STORAGE_KEYS.leads, []);
  },
  saveLeads(leads: LeadRecord[]) {
    writeCollection(STORAGE_KEYS.leads, leads);
  },
};
