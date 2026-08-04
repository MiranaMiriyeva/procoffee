import { prisma } from "@/lib/prisma";
import CategoryManager from "./CategoryManager";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Menu</h1>
        <p className="text-muted-foreground mt-1">
          Manage categories and items. Drag to reorder — customers see the same order.
        </p>
      </div>
      <CategoryManager initial={categories} />
    </div>
  );
}
