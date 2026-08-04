import "server-only";
import { prisma } from "./prisma";
import { pickLocalized, type Locale } from "./i18n";

export type SiteSettings = {
  shopName: string;
  tagline: string;
  taglineAz: string;
  taglineRu: string;
  about: string;
  aboutAz: string;
  aboutRu: string;
  heroImageUrl: string;
  logoUrl: string;
  address: string;
  hours: string;
  hoursAz: string;
  hoursRu: string;
  phone: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
};

export const SETTING_KEYS: (keyof SiteSettings)[] = [
  "shopName",
  "tagline",
  "taglineAz",
  "taglineRu",
  "about",
  "aboutAz",
  "aboutRu",
  "heroImageUrl",
  "logoUrl",
  "address",
  "hours",
  "hoursAz",
  "hoursRu",
  "phone",
  "email",
  "instagramUrl",
  "facebookUrl",
  "whatsappUrl",
];

export const DEFAULT_SETTINGS: SiteSettings = {
  shopName: "Procoffee",
  tagline: "Freshly brewed, all day.",
  taglineAz: "",
  taglineRu: "",
  about:
    "A neighborhood coffee bar built on great beans, warm regulars, and a little quiet in the middle of the day.",
  aboutAz: "",
  aboutRu: "",
  heroImageUrl: "",
  logoUrl: "/logo.png",
  address: "",
  hours: "",
  hoursAz: "",
  hoursRu: "",
  phone: "",
  email: "",
  instagramUrl: "",
  facebookUrl: "",
  whatsappUrl: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const merged: SiteSettings = { ...DEFAULT_SETTINGS, ...overrides } as SiteSettings;

  if (!merged.shopName.trim()) merged.shopName = DEFAULT_SETTINGS.shopName;
  if (!merged.tagline.trim()) merged.tagline = DEFAULT_SETTINGS.tagline;
  if (!merged.logoUrl.trim()) merged.logoUrl = DEFAULT_SETTINGS.logoUrl;

  return merged;
}

/**
 * A version of settings with locale-aware fields already resolved.
 */
export type LocalizedSettings = SiteSettings & {
  taglineLocalized: string;
  aboutLocalized: string;
  hoursLocalized: string;
};

export function localizeSettings(s: SiteSettings, locale: Locale): LocalizedSettings {
  return {
    ...s,
    taglineLocalized: pickLocalized(s as Record<string, unknown>, "tagline", locale),
    aboutLocalized: pickLocalized(s as Record<string, unknown>, "about", locale),
    hoursLocalized: pickLocalized(s as Record<string, unknown>, "hours", locale),
  };
}
