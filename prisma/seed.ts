import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding. " +
        "Open your .env file and fill them in, then re-run `npm run db:seed`."
    );
  }

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { passwordHash },
    create: { email: adminEmail.toLowerCase(), passwordHash },
  });
  console.log(`✓ Admin user ready: ${admin.email}`);

  // Only seed sample menu data if the DB is empty — don't clobber real content.
  const existingCategoryCount = await prisma.category.count();
  if (existingCategoryCount > 0) {
    console.log(`✓ Skipping sample menu (${existingCategoryCount} categories already exist)`);
    return;
  }

  const espresso = await prisma.category.create({
    data: {
      name: "Espresso",
      slug: "espresso",
      displayOrder: 0,
      items: {
        create: [
          {
            title: "Espresso",
            subtitle: "Single shot, dark & smooth",
            description: "Our house blend, pulled fresh.",
            price: "3.00",
            available: true,
            displayOrder: 0,
          },
          {
            title: "Cappuccino",
            subtitle: "Espresso + steamed milk + foam",
            price: "4.50",
            available: true,
            displayOrder: 1,
          },
          {
            title: "Latte",
            subtitle: "Silky milk, rich espresso",
            price: "4.75",
            available: true,
            displayOrder: 2,
          },
          {
            title: "Flat White",
            subtitle: "Double shot, velvety microfoam",
            price: "4.75",
            available: true,
            displayOrder: 3,
          },
        ],
      },
    },
  });
  console.log(`✓ Category created: ${espresso.name}`);

  const cold = await prisma.category.create({
    data: {
      name: "Cold Drinks",
      slug: "cold-drinks",
      displayOrder: 1,
      items: {
        create: [
          {
            title: "Iced Americano",
            subtitle: "Cold water, two shots",
            price: "4.00",
            available: true,
            displayOrder: 0,
          },
          {
            title: "Iced Latte",
            subtitle: "Espresso over cold milk & ice",
            price: "5.00",
            available: true,
            displayOrder: 1,
          },
          {
            title: "Cold Brew",
            subtitle: "12-hour steep, smooth & strong",
            description: "Steeped overnight for a naturally sweet, low-acid brew.",
            price: "5.25",
            available: false,
            displayOrder: 2,
          },
        ],
      },
    },
  });
  console.log(`✓ Category created: ${cold.name}`);

  const pastries = await prisma.category.create({
    data: {
      name: "Pastries",
      slug: "pastries",
      displayOrder: 2,
      items: {
        create: [
          {
            title: "Butter Croissant",
            subtitle: "Baked fresh each morning",
            price: "3.50",
            available: true,
            displayOrder: 0,
          },
          {
            title: "Almond Croissant",
            subtitle: "Filled with almond cream, toasted flakes",
            price: "4.50",
            available: true,
            displayOrder: 1,
          },
          {
            title: "Blueberry Muffin",
            subtitle: "Wild blueberries, lemon zest",
            price: "3.75",
            available: true,
            displayOrder: 2,
          },
        ],
      },
    },
  });
  console.log(`✓ Category created: ${pastries.name}`);

  // Seed default site settings if none exist.
  const settingCount = await prisma.siteSetting.count();
  if (settingCount === 0) {
    const defaults: [string, string][] = [
      ["shopName", "Procoffee"],
      ["tagline", "Freshly brewed, all day."],
      [
        "about",
        "A neighborhood coffee bar built on great beans, warm regulars, and a little quiet in the middle of the day.",
      ],
      ["hours", "Mon–Fri  7:00 – 19:00\nSat–Sun  8:00 – 17:00"],
      ["address", ""],
      ["phone", ""],
      ["email", ""],
      ["instagramUrl", ""],
    ];
    await prisma.siteSetting.createMany({
      data: defaults.map(([key, value]) => ({ key, value })),
    });
    console.log(`✓ Site settings seeded (${defaults.length} keys)`);
  } else {
    console.log(`✓ Skipping site settings (${settingCount} keys already exist)`);
  }

  console.log("\n✅ Seed complete. Log in at /admin/login with your ADMIN_EMAIL / ADMIN_PASSWORD.");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
