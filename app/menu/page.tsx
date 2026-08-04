import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { BeanDivider, BrandTicker, YellowGlow } from "@/lib/decorations";
import { WhatsappIcon } from "@/lib/brand-icons";
import { pickLocalized, t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import MenuCategoryNav from "./MenuCategoryNav";
import MenuBoard, { type MenuCategory } from "./MenuBoard";
import LanguageSwitcher from "../LanguageSwitcher";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu" };

export default async function MenuPage() {
  const locale = await getLocale();
  const strings = t(locale);

  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        items: { orderBy: { displayOrder: "asc" } },
      },
    }),
  ]);

  const populated: MenuCategory[] = categories
    .filter((c) => c.items.length > 0)
    .map((c) => ({
      id: c.id,
      name: pickLocalized(c as Record<string, unknown>, "name", locale),
      items: c.items.map((i) => ({
        id: i.id,
        title: pickLocalized(i as Record<string, unknown>, "title", locale),
        subtitle: pickLocalized(i as Record<string, unknown>, "subtitle", locale) || null,
        description:
          pickLocalized(i as Record<string, unknown>, "description", locale) || null,
        price: i.price.toString(),
        imageUrl: i.imageUrl,
        available: i.available,
      })),
    }));

  const tickerItems = [
    strings.brand.freshlyBrewed,
    strings.brand.orderAtBar,
    strings.brand.smallBatch,
    strings.brand.openToday,
  ];

  // Prefer WhatsApp for the footer "reach us" button; fall back to phone.
  const whatsapp = settings.whatsappUrl.trim();
  const phone = settings.phone.trim();

  return (
    <div className="flex flex-1 flex-col relative overflow-x-clip">
      <YellowGlow className="-top-40 -right-40 opacity-60" size={520} />
      <YellowGlow className="top-[50vh] -left-40 opacity-30" size={460} />

      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <BrandTicker items={tickerItems} />
        <div className="mx-auto max-w-md px-3 h-14 flex items-center gap-2">
          <Link
            href="/"
            aria-label={strings.actions.back}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 flex items-center gap-2 justify-center min-w-0">
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-primary/15 ring-1 ring-primary/25 shrink-0">
              <Image
                src={settings.logoUrl}
                alt={settings.shopName}
                fill
                sizes="28px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-heading font-semibold text-sm tracking-tight truncate">
              {settings.shopName}
            </span>
          </div>
          <LanguageSwitcher current={locale} />
        </div>

        {populated.length > 0 && (
          <MenuCategoryNav
            categories={populated.map((c) => ({ id: c.id, name: c.name }))}
          />
        )}
      </header>

      {populated.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-24 px-5">
          <div className="text-center max-w-sm space-y-3">
            <h1 className="font-heading text-3xl">{strings.menu.comingSoonTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {strings.menu.comingSoonBody}
            </p>
          </div>
        </div>
      ) : (
        <>
          <section className="mx-auto max-w-md w-full px-5 pt-7 pb-3 relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {strings.menu.theMenu}
            </p>
            <h1 className="mt-2 font-heading text-5xl font-medium tracking-[-0.03em] leading-[0.95]">
              {strings.menu.whatsOn}{" "}
              <span className="italic font-normal">{strings.menu.whatsOnItalic}</span>
            </h1>
          </section>

          <div className="mx-auto max-w-md w-full px-5 pb-16 relative">
            <MenuBoard populated={populated} chapterLabel={strings.menu.chapter} />
          </div>

          <footer className="mx-auto max-w-md w-full px-5 pb-10 relative">
            <BeanDivider className="mb-8" />
            <div className="card-hover rounded-2xl bg-card border border-border p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {strings.menu.orderAtCounter}
                </p>
                <p className="text-sm font-medium mt-0.5 truncate">
                  {strings.menu.seeYouAtTheBar}
                </p>
              </div>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition shrink-0 shadow-card"
                >
                  <WhatsappIcon className="w-4 h-4" />
                  WhatsApp
                </a>
              ) : phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition shrink-0 shadow-card"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {strings.actions.call}
                </a>
              ) : null}
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-muted-foreground text-center">
              © {new Date().getFullYear()} {settings.shopName}
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
