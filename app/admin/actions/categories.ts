"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { categorySchema, reorderSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

async function uniqueSlug(base: string, excludeId?: string) {
  const raw = slugify(base) || "category";
  let candidate = raw;
  let n = 1;
  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${raw}-${n}`;
  }
}

export async function createCategory(input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.parse(input);
  const slug = await uniqueSlug(parsed.name);
  const last = await prisma.category.findFirst({
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const displayOrder = (last?.displayOrder ?? -1) + 1;

  const category = await prisma.category.create({
    data: {
      name: parsed.name,
      nameAz: parsed.nameAz || null,
      nameRu: parsed.nameRu || null,
      slug,
      displayOrder,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/menu");
  revalidatePath("/");
  return category;
}

export async function updateCategory(id: string, input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.parse(input);
  const slug = await uniqueSlug(parsed.name, id);

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.name,
      nameAz: parsed.nameAz || null,
      nameRu: parsed.nameRu || null,
      slug,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/menu");
  revalidatePath("/");
  return updated;
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function reorderCategories(input: { ids: string[] }) {
  await requireAdmin();
  const parsed = reorderSchema.parse(input);

  await prisma.$transaction(
    parsed.ids.map((id, idx) =>
      prisma.category.update({ where: { id }, data: { displayOrder: idx } })
    )
  );
  revalidatePath("/admin");
  revalidatePath("/menu");
  revalidatePath("/");
}
