/**
 * Item-level image importer for Procoffee Next.
 * Matches each menu item by keyword (e.g. "cappuccino", "matcha", "negroni")
 * and assigns a themed Unsplash photo. Photos are downloaded + uploaded to your
 * Vercel Blob store so they serve from Vercel's CDN (fast + stable URLs).
 *
 * Run:
 *   npx tsx prisma/add-images.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.
 * Won't overwrite items that already have a photo.
 * If an Unsplash URL fails, that item is left blank (shows placeholder icon).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

/**
 * Ordered patterns — first match wins. More specific patterns should come first
 * (e.g. "espresso martini" before "espresso", "iced americano" before "iced").
 */
const MAPPINGS: { key: string; pattern: RegExp; url: string }[] = [
  // Cocktails — specific ones first
  { key: "negroni", pattern: /negroni/i, url: "https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=800&auto=format&fit=crop&q=80" },
  { key: "aperol", pattern: /aperol/i, url: "https://images.unsplash.com/photo-1560508601-5e8bd41e8a68?w=800&auto=format&fit=crop&q=80" },
  { key: "espresso-martini", pattern: /espresso.*martini/i, url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80" },
  { key: "cocktail-cosmo", pattern: /cosmopolitan|long.*island|gin.*basil|gin.*tonic|cin.*tonic/i, url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80" },

  // Energy / soft / water
  { key: "red-bull", pattern: /red.*bull/i, url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80" },
  { key: "soda", pattern: /cola|fanta|sprite/i, url: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&auto=format&fit=crop&q=80" },
  { key: "water", pattern: /water|sirab|istisu|̇stisu/i, url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&auto=format&fit=crop&q=80" },

  // Matcha — specific first
  { key: "strawberry-matcha", pattern: /strawberry.*matcha/i, url: "https://images.unsplash.com/photo-1587049016823-c9fdcbaebbc5?w=800&auto=format&fit=crop&q=80" },
  { key: "pistachio-matcha", pattern: /pistachio.*matcha/i, url: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&auto=format&fit=crop&q=80" },
  { key: "matcha-latte", pattern: /matcha.*latte|matcha.*affogato/i, url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&auto=format&fit=crop&q=80" },
  { key: "matcha", pattern: /matcha/i, url: "https://images.unsplash.com/photo-1536520807083-4d6d9e10b8b7?w=800&auto=format&fit=crop&q=80" },

  // Milkshakes — flavor-specific
  { key: "milkshake-nutella", pattern: /nutella/i, url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80" },
  { key: "milkshake-strawberry", pattern: /^strawberry$|strawberry.*shake|strawberry.*milk/i, url: "https://images.unsplash.com/photo-1553787499-6f9133860278?w=800&auto=format&fit=crop&q=80" },
  { key: "milkshake-banana", pattern: /banana/i, url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80" },
  { key: "milkshake-vanilla", pattern: /vanilla/i, url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&auto=format&fit=crop&q=80" },
  { key: "milkshake-raspberry", pattern: /raspberry/i, url: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80" },

  // Lemonades
  { key: "orange", pattern: /orange|portağal/i, url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&auto=format&fit=crop&q=80" },
  { key: "grapefruit", pattern: /grapefruit|greyfrut/i, url: "https://images.unsplash.com/photo-1608651218-1b8a89e37e7c?w=800&auto=format&fit=crop&q=80" },
  { key: "apple", pattern: /^apple$|alma/i, url: "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?w=800&auto=format&fit=crop&q=80" },
  { key: "lemonade", pattern: /lemon|passion|mango|bubble.*gum|moxito|classic.*day|aloe/i, url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&auto=format&fit=crop&q=80" },

  // Tea
  { key: "green-tea", pattern: /green.*tea/i, url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80" },
  { key: "jasmine-tea", pattern: /jasmine|melissa/i, url: "https://images.unsplash.com/photo-1597318985207-33ac1ce78c8c?w=800&auto=format&fit=crop&q=80" },
  { key: "chai", pattern: /chai/i, url: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop&q=80" },
  { key: "black-tea", pattern: /tea|çay/i, url: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&auto=format&fit=crop&q=80" },

  // Brew methods
  { key: "v60", pattern: /v60/i, url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=80" },
  { key: "chemex", pattern: /chemex/i, url: "https://images.unsplash.com/photo-1512034400317-de97d7d6c3ed?w=800&auto=format&fit=crop&q=80" },
  { key: "aeropress", pattern: /aeropress/i, url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80" },
  { key: "turkish-coffee", pattern: /turkish|türk|qəhvə/i, url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80" },

  // Hot chocolate & similar
  { key: "hot-chocolate", pattern: /hot.*chocolate|isti.*şokolad|şokolad/i, url: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=800&auto=format&fit=crop&q=80" },
  { key: "white-chocolate", pattern: /white.*chocolate/i, url: "https://images.unsplash.com/photo-1571679654681-ba01b9e1e117?w=800&auto=format&fit=crop&q=80" },
  { key: "sahlep", pattern: /sahlep/i, url: "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=800&auto=format&fit=crop&q=80" },

  // Iced/cold coffee — before hot equivalents
  { key: "iced-americano", pattern: /iced.*americano/i, url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80" },
  { key: "iced-latte", pattern: /iced.*(latte|spanish)/i, url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80" },
  { key: "iced-mocha", pattern: /iced.*mocha|ice.*(caramel.*mocha|mocha)/i, url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80" },
  { key: "iced-raff", pattern: /ice.*(raff|raf)/i, url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80" },
  { key: "espresso-tonic", pattern: /espresso.*tonic/i, url: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=800&auto=format&fit=crop&q=80" },
  { key: "affogato", pattern: /affogato/i, url: "https://images.unsplash.com/photo-1560801356-fd2eb62dcbfe?w=800&auto=format&fit=crop&q=80" },
  { key: "iced-coffee", pattern: /ice|iced|cold/i, url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80" },

  // Espresso family (hot)
  { key: "espresso-shot", pattern: /^espresso (single|double)$|espresso$/i, url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&auto=format&fit=crop&q=80" },
  { key: "macchiato", pattern: /macchiato/i, url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80" },
  { key: "cortado", pattern: /cortado/i, url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80" },
  { key: "flat-white", pattern: /flat.*white/i, url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80" },
  { key: "americano", pattern: /americano/i, url: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=800&auto=format&fit=crop&q=80" },
  { key: "cappuccino", pattern: /cappuccino/i, url: "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=800&auto=format&fit=crop&q=80" },
  { key: "cafe-latte", pattern: /café.*latte|cafe.*latte|^latte$/i, url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80" },

  // Raff & specialty
  { key: "salted-caramel", pattern: /salted.*caramel/i, url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=80" },
  { key: "caramel", pattern: /caramel/i, url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80" },
  { key: "mocha", pattern: /mocha|café.*mocha/i, url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80" },
  { key: "pistachio-latte", pattern: /pistachio/i, url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80" },
  { key: "spanish-latte", pattern: /spanish.*latte/i, url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80" },
  { key: "halva-raff", pattern: /halva/i, url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80" },
  { key: "raff", pattern: /raff|raf/i, url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80" },
];

/** Cache: keyword key → Vercel Blob URL (upload each unique image once). */
const cache = new Map<string, string>();

async function upload(key: string, sourceUrl: string): Promise<string | null> {
  if (cache.has(key)) return cache.get(key)!;

  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.log(`   ⊘ ${key} — source returned ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const blob = await put(`menu/item-${key}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
      allowOverwrite: true,
    });
    cache.set(key, blob.url);
    return blob.url;
  } catch (err) {
    console.log(`   ❌ ${key} — ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

function findMapping(title: string) {
  for (const m of MAPPINGS) {
    if (m.pattern.test(title)) return m;
  }
  return null;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing in .env.");
  }

  const items = await prisma.item.findMany({
    where: { imageUrl: null },
    orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
  });

  console.log(`\nMatching ${items.length} items to themed photos…\n`);

  let filled = 0;
  let skipped = 0;

  for (const item of items) {
    const mapping = findMapping(item.title);
    if (!mapping) {
      console.log(`⊘  ${item.title.padEnd(30)} — no keyword match`);
      skipped += 1;
      continue;
    }

    const url = await upload(mapping.key, mapping.url);
    if (!url) {
      skipped += 1;
      continue;
    }

    await prisma.item.update({ where: { id: item.id }, data: { imageUrl: url } });
    console.log(`✓  ${item.title.padEnd(30)} → ${mapping.key}`);
    filled += 1;
  }

  console.log(
    `\n✅ Done. ${filled} items filled with ${cache.size} unique photos. Skipped ${skipped}.`
  );
  console.log(`   Refresh /menu to see photos.`);
  console.log(`   Any photo can be replaced individually via /admin.`);
}

main()
  .catch((e) => {
    console.error("\n❌ Failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
