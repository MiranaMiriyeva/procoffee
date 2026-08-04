"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SETTING_KEYS, type SiteSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/require-admin";

const settingsSchema = z.object({
  shopName: z.string().trim().max(80),
  tagline: z.string().trim().max(160),
  taglineAz: z.string().trim().max(160),
  taglineRu: z.string().trim().max(160),
  about: z.string().trim().max(2000),
  aboutAz: z.string().trim().max(2000),
  aboutRu: z.string().trim().max(2000),
  heroImageUrl: z.string().trim().max(2000),
  logoUrl: z.string().trim().max(2000),
  address: z.string().trim().max(400),
  hours: z.string().trim().max(400),
  hoursAz: z.string().trim().max(400),
  hoursRu: z.string().trim().max(400),
  phone: z.string().trim().max(60),
  email: z.union([z.literal(""), z.string().email()]),
  instagramUrl: z.string().trim().max(400),
  facebookUrl: z.string().trim().max(400),
  whatsappUrl: z.string().trim().max(400),
});

export async function updateSettings(input: SiteSettings) {
  await requireAdmin();
  const parsed = settingsSchema.parse(input);

  await prisma.$transaction(
    SETTING_KEYS.map((key) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: parsed[key] ?? "" },
        create: { key, value: parsed[key] ?? "" },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}
