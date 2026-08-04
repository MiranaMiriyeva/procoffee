import "server-only";
import { cookies } from "next/headers";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./i18n";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const raw = c.get(LOCALE_COOKIE)?.value;
  if (raw && (LOCALES as readonly string[]).includes(raw)) return raw as Locale;
  return DEFAULT_LOCALE;
}
