"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALES, type Locale } from "@/lib/i18n";

export async function setLocale(locale: string) {
  if (!(LOCALES as readonly string[]).includes(locale)) return;
  const c = await cookies();
  c.set("locale", locale as Locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false, // read on client for immediate UI update if we want
    path: "/",
  });
  revalidatePath("/", "layout");
}
