/**
 * One-off menu import for Procoffee Next.
 * Deletes all existing categories (and their items) and inserts the real menu.
 * Run with:
 *   npx tsx prisma/import-menu.ts
 *
 * Prices are in AZN (₼). Items with a "S — X · M — Y" subtitle have two size prices;
 * the row shows the smaller (Small) price by default so the "from" is clear.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type MenuItem = {
  title: string;
  titleAz?: string;
  subtitle?: string;
  price: string;
};

type MenuCategory = {
  name: string;
  nameAz?: string;
  items: MenuItem[];
};

const menu: MenuCategory[] = [
  {
    name: "Espresso",
    nameAz: "Espresso Klassik",
    items: [
      { title: "Espresso Single", price: "3.50" },
      { title: "Espresso Double", price: "4.00" },
      { title: "Café Latte", price: "5.30", subtitle: "S — 5.30 ₼ · M — 6.00 ₼" },
      { title: "Cappuccino", price: "5.30", subtitle: "S — 5.30 ₼ · M — 6.00 ₼" },
      { title: "Espresso Macchiato", price: "4.00", subtitle: "S — 4.00 ₼ · M — 5.00 ₼" },
      { title: "Cortado", price: "5.00" },
      { title: "Flat White", price: "5.80" },
      { title: "Americano", price: "4.50", subtitle: "S — 4.50 ₼ · M — 5.30 ₼" },
    ],
  },
  {
    name: "Raff & Special",
    nameAz: "Raff & Special",
    items: [
      { title: "Raff", price: "7.90" },
      { title: "Xırt Xırt Raff", titleAz: "Xırt Xırt Raf", price: "8.30" },
      { title: "Halva Raff", price: "8.30" },
      { title: "Café Mocha", price: "7.50" },
      { title: "Mocha Caramel", price: "8.00" },
      { title: "Pistachio Latte", price: "8.00" },
      { title: "Salted Caramel", price: "7.50" },
      { title: "Spanish Latte", price: "8.00" },
    ],
  },
  {
    name: "Cold Coffees",
    nameAz: "Soyuq Kahvələr",
    items: [
      { title: "Iced Café Latte", price: "7.00" },
      { title: "Iced Americano", price: "6.10" },
      { title: "Affogato", price: "6.90" },
      { title: "Orange Coffee", price: "10.00" },
      { title: "Espresso Tonic", price: "8.00" },
      { title: "Passion Fruit", price: "8.00" },
      { title: "Classic Day", price: "7.00" },
      { title: "Mango Passion Fruit", price: "8.00" },
      { title: "Bubble Gum Aloe", price: "8.00" },
      { title: "Moxito", price: "8.00" },
      { title: "Raspberry Passion Fruit", price: "7.00" },
      { title: "Lemon", price: "7.00" },
      { title: "BubbleGum Strawberry", price: "7.00" },
      { title: "Iced Spanish Latte", price: "8.90" },
      { title: "Iced Mocha", price: "7.90" },
      { title: "Ice Caramel Mocha", price: "7.90" },
      { title: "Ice Raff", price: "8.90" },
      { title: "Ice Xırt Xırt Raff", titleAz: "Ice Xırt Xırt Raf", price: "9.90" },
      { title: "Ice Pistachio Latte", titleAz: "İce Pistachio Latte", price: "9.90" },
    ],
  },
  {
    name: "Matcha Bar",
    nameAz: "Matcha Bar",
    items: [
      { title: "Ice Strawberry Matcha", price: "9.90" },
      { title: "Ice Pistachio Matcha", price: "9.90" },
      { title: "Ice Cherry Matcha", titleAz: "Ice Chery Matcha", price: "9.90" },
      { title: "Matcha Affogato", titleAz: "Matcha Affagato", price: "7.00" },
      { title: "Matcha Latte", price: "8.00" },
      { title: "Ice Matcha Latte", titleAz: "İce Matcha Latte", price: "9.00" },
    ],
  },
  {
    name: "Milk Shakes",
    nameAz: "Milk Shake",
    items: [
      { title: "Nutella", price: "9.90" },
      { title: "Strawberry", price: "9.90" },
      { title: "Raspberry", price: "9.90" },
      { title: "Banana", price: "9.90" },
      { title: "Vanilla", price: "9.90" },
    ],
  },
  {
    name: "Hot Drinks",
    nameAz: "İsti İçkilər",
    items: [
      { title: "Hot Chocolate", titleAz: "İsti şokolad", price: "6.50", subtitle: "S — 6.50 ₼ · M — 7.00 ₼" },
      { title: "Sahlep", price: "6.50", subtitle: "S — 6.50 ₼ · M — 7.00 ₼" },
      { title: "White Chocolate", price: "6.50", subtitle: "S — 6.50 ₼ · M — 7.00 ₼" },
      { title: "Chai Tea", price: "6.50", subtitle: "S — 6.50 ₼ · M — 7.00 ₼" },
    ],
  },
  {
    name: "Brew Bar",
    nameAz: "Brew Bar",
    items: [
      { title: "V60", price: "8.00" },
      { title: "Chemex", price: "8.00" },
      { title: "Aeropress", price: "8.00", subtitle: "Small · Medium" },
      { title: "Turkish Coffee", titleAz: "Türk Qəhvəsi", price: "6.00" },
    ],
  },
  {
    name: "Teas",
    nameAz: "Çaylar",
    items: [
      { title: "Black Tea", price: "10.00" },
      { title: "Melissa", price: "10.00" },
      { title: "Jasmine", price: "10.00" },
      { title: "Green Tea", price: "10.00" },
      { title: "Mix Black Tea", price: "10.00" },
    ],
  },
  {
    name: "Lemonades",
    nameAz: "Limonadlar",
    items: [
      { title: "Orange", titleAz: "Portağal", price: "8.50" },
      { title: "Apple", titleAz: "Alma", price: "7.50" },
      { title: "Grapefruit", titleAz: "Greyfrut", price: "9.00" },
    ],
  },
  {
    name: "Cocktails",
    nameAz: "Kokteyllər",
    items: [
      { title: "Negroni", price: "14.00" },
      { title: "Aperol Spritz", price: "14.00" },
      { title: "Espresso Martini", price: "14.00" },
      { title: "Gin Basil Smash", price: "14.00" },
      { title: "Cosmopolitan", price: "14.00" },
      { title: "Gin Tonic", titleAz: "Cin Tonic", price: "12.00" },
      { title: "Long Island", price: "13.00" },
    ],
  },
  {
    name: "Cold Drinks",
    nameAz: "Soyuq İçkilər",
    items: [
      { title: "Cola", price: "4.00" },
      { title: "Cola Zero", price: "4.00" },
      { title: "Fanta", price: "4.00" },
      { title: "Sprite", price: "4.00" },
      { title: "Premium Water (still)", titleAz: "Premium Sirab Qazsız", price: "3.50" },
      { title: "Premium Water (sparkling)", titleAz: "Premium Sirab Qazlı", price: "3.50" },
      { title: "Istisu 250 ml", titleAz: "İstisu 250 ml", price: "2.50" },
      { title: "Istisu 500 ml", titleAz: "İstisu 500 ml", price: "4.00" },
      { title: "Red Bull", price: "5.90" },
    ],
  },
];

async function main() {
  console.log(`\n⚠️  About to delete all existing categories and items.`);
  console.log(`   Then insert ${menu.length} categories with ${menu.reduce((n, c) => n + c.items.length, 0)} items.\n`);

  const deleted = await prisma.category.deleteMany({});
  console.log(`✓ Deleted ${deleted.count} existing categories.\n`);

  for (const [i, cat] of menu.entries()) {
    // Ensure a unique slug (handle collisions defensively)
    let slug = slugify(cat.name);
    let n = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${slugify(cat.name)}-${n}`;
    }

    const category = await prisma.category.create({
      data: {
        name: cat.name,
        nameAz: cat.nameAz ?? null,
        slug,
        displayOrder: i,
        items: {
          create: cat.items.map((item, j) => ({
            title: item.title,
            titleAz: item.titleAz ?? null,
            subtitle: item.subtitle ?? null,
            price: item.price,
            available: true,
            displayOrder: j,
          })),
        },
      },
    });
    console.log(`✓ ${category.name.padEnd(20)} → ${cat.items.length} items`);
  }

  console.log(`\n✅ Import complete.`);
}

main()
  .catch((e) => {
    console.error("\n❌ Import failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
