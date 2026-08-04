"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { itemSchema, reorderSchema } from "@/lib/validators";
import { deleteBlob } from "./upload";

export async function createItem(input: unknown) {
  await requireAdmin();
  const parsed = itemSchema.parse(input);

  const last = await prisma.item.findFirst({
    where: { categoryId: parsed.categoryId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const displayOrder = (last?.displayOrder ?? -1) + 1;

  const item = await prisma.item.create({
    data: {
      categoryId: parsed.categoryId,
      title: parsed.title,
      titleAz: parsed.titleAz || null,
      titleRu: parsed.titleRu || null,
      subtitle: parsed.subtitle || null,
      subtitleAz: parsed.subtitleAz || null,
      subtitleRu: parsed.subtitleRu || null,
      description: parsed.description || null,
      descriptionAz: parsed.descriptionAz || null,
      descriptionRu: parsed.descriptionRu || null,
      price: parsed.price,
      imageUrl: parsed.imageUrl || null,
      available: parsed.available,
      displayOrder,
    },
  });
  revalidatePath(`/admin/categories/${parsed.categoryId}`);
  revalidatePath("/menu");
  revalidatePath("/");
  return item;
}

export async function updateItem(id: string, input: unknown) {
  await requireAdmin();
  const parsed = itemSchema.parse(input);

  const existing = await prisma.item.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  const item = await prisma.item.update({
    where: { id },
    data: {
      title: parsed.title,
      titleAz: parsed.titleAz || null,
      titleRu: parsed.titleRu || null,
      subtitle: parsed.subtitle || null,
      subtitleAz: parsed.subtitleAz || null,
      subtitleRu: parsed.subtitleRu || null,
      description: parsed.description || null,
      descriptionAz: parsed.descriptionAz || null,
      descriptionRu: parsed.descriptionRu || null,
      price: parsed.price,
      imageUrl: parsed.imageUrl || null,
      available: parsed.available,
    },
  });

  if (existing?.imageUrl && existing.imageUrl !== parsed.imageUrl) {
    void deleteBlob(existing.imageUrl);
  }

  revalidatePath(`/admin/categories/${parsed.categoryId}`);
  revalidatePath("/menu");
  revalidatePath("/");
  return item;
}

export async function toggleAvailability(id: string, available: boolean) {
  await requireAdmin();
  const item = await prisma.item.update({
    where: { id },
    data: { available },
    select: { id: true, categoryId: true, available: true },
  });
  revalidatePath(`/admin/categories/${item.categoryId}`);
  revalidatePath("/menu");
  revalidatePath("/");
  return item;
}

export async function deleteItem(id: string) {
  await requireAdmin();
  const item = await prisma.item.delete({
    where: { id },
    select: { categoryId: true, imageUrl: true },
  });
  if (item.imageUrl) {
    void deleteBlob(item.imageUrl);
  }
  revalidatePath(`/admin/categories/${item.categoryId}`);
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function reorderItems(
  categoryId: string,
  input: { ids: string[] }
) {
  await requireAdmin();
  const parsed = reorderSchema.parse(input);

  await prisma.$transaction(
    parsed.ids.map((id, idx) =>
      prisma.item.update({
        where: { id },
        data: { displayOrder: idx },
      })
    )
  );
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/menu");
  revalidatePath("/");
}
