import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ItemManager from "./ItemManager";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: category ? category.name : "Category" };
}

export default async function CategoryItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      items: { orderBy: { displayOrder: "asc" } },
    },
  });
  if (!category) notFound();

  const items = category.items.map((i) => ({
    ...i,
    price: i.price.toString(),
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          All categories
        </Link>
        <h1 className="text-3xl font-semibold">{category.name}</h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} · Drag to reorder
        </p>
      </div>

      <ItemManager categoryId={category.id} initial={items} />
    </div>
  );
}
