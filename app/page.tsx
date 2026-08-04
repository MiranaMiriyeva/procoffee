import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings, localizeSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import { InstagramIcon, FacebookIcon, WhatsappIcon } from "@/lib/brand-icons";
import {
  BeanDivider,
  BrandTicker,
  CoffeeBean,
  FloatingBeans,
  SteamPuff,
  YellowGlow,
} from "@/lib/decorations";
import { pickLocalized, t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import LanguageSwitcher from "./LanguageSwitcher";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const strings = t(locale);

  const [rawSettings, featuredRaw] = await Promise.all([
    getSettings(),
    prisma.item.findMany({
      where: { available: true, imageUrl: { not: null } },
      orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
      take: 3,
      include: { category: true },
    }),
  ]);

  const settings = localizeSettings(rawSettings, locale);
  const featured = featuredRaw.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    price: item.price.toString(),
    title: pickLocalized(item as Record<string, unknown>, "title", locale),
    categoryName: pickLocalized(
      item.category as Record<string, unknown>,
      "name",
      locale
    ),
  }));

  const hasContact = settings.phone || settings.email;
  const hasSocials =
    settings.instagramUrl || settings.facebookUrl || settings.whatsappUrl;
  const hero = renderHeadline(settings.taglineLocalized);

  const tickerItems = [
    strings.brand.freshlyBrewed,
    strings.brand.openToday,
    strings.brand.orderAtBar,
    strings.brand.smallBatch,
    strings.brand.sinceDayOne,
  ];

  return (
    <div className="flex flex-1 flex-col relative overflow-x-clip">
      <YellowGlow className="-top-40 -right-40 opacity-80" size={560} />
      <YellowGlow className="top-[60vh] -left-40 opacity-40" size={520} />

      <BrandTicker items={tickerItems} />

      {/* ─── header ─── */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-md px-5 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary/15 ring-1 ring-primary/25 shrink-0">
              <Image
                src={settings.logoUrl}
                alt={settings.shopName}
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-heading font-semibold tracking-tight truncate">
              {settings.shopName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageSwitcher current={locale} />
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 h-9 px-3.5 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition"
            >
              {strings.actions.menu}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── hero (image + text overlay in one card) ─── */}
      <section className="mx-auto max-w-md w-full px-5 pt-6 pb-5 relative">
        <div className="relative aspect-[4/5] w-full rounded-[2.25rem] overflow-hidden shadow-card-xl animate-rise">
          {settings.heroImageUrl ? (
            <>
              <Image
                src={settings.heroImageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#e0a900]">
              <div
                className="absolute inset-0 opacity-25 mix-blend-multiply"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 20%, rgba(0,0,0,0.25), transparent 45%), radial-gradient(circle at 75% 80%, rgba(0,0,0,0.18), transparent 45%)",
                }}
              />
              <FloatingBeans />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>
          )}

          <div className="absolute top-4 inset-x-4 flex items-start justify-between text-white">
            <div className="relative flex items-center gap-2.5">
              <div className="absolute -top-4 left-3.5 w-12 h-12 text-white/70 pointer-events-none">
                <SteamPuff delay={0} />
                <SteamPuff delay={0.9} style={{ left: "calc(50% - 8px)" }} />
                <SteamPuff delay={1.7} style={{ left: "calc(50% + 8px)" }} />
              </div>
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white/15 backdrop-blur ring-1 ring-white/25 shadow-glow">
                <Image
                  src={settings.logoUrl}
                  alt={settings.shopName}
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-heading font-semibold text-sm tracking-tight drop-shadow">
                {settings.shopName}
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-[10px] font-semibold uppercase tracking-[0.22em]">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
                <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              {strings.brand.nowBrewing}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <h1 className="font-heading font-medium text-[32px] sm:text-[38px] leading-[1] tracking-[-0.02em] drop-shadow">
              {hero}
            </h1>
            {settings.aboutLocalized && (
              <p className="mt-3 text-[13px] leading-relaxed text-white/85 max-w-[92%] line-clamp-3">
                {settings.aboutLocalized}
              </p>
            )}
            <div className="mt-4 flex items-center gap-1.5 opacity-80">
              <CoffeeBean className="w-3.5 h-3.5" />
              <CoffeeBean className="w-3 h-3 opacity-70" />
              <CoffeeBean className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── main CTA ─── */}
      <section className="mx-auto max-w-md w-full px-5 pb-8 relative">
        <Link
          href="/menu"
          className="group relative flex items-center justify-between w-full rounded-2xl bg-foreground text-background h-[72px] px-6 shadow-card-lg hover:shadow-card-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/40 blur-2xl" />
          <div className="relative text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-70">
              {strings.actions.order}
            </p>
            <p className="font-heading text-2xl font-medium leading-tight">
              {strings.actions.viewMenu}
            </p>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
            <span className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow transition group-hover:translate-x-0.5">
              <ArrowRight className="w-5 h-5" />
            </span>
          </div>
        </Link>

        {(settings.hoursLocalized || settings.address) && (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {settings.hoursLocalized && (
              <div className="card-hover rounded-2xl bg-card border border-border p-3.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {strings.home.todayLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug line-clamp-2">
                  {firstLine(settings.hoursLocalized)}
                </p>
              </div>
            )}
            {settings.address && (
              <a
                href={mapLink(settings.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover rounded-2xl bg-card border border-border p-3.5"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {strings.home.findUsLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug line-clamp-2">
                  {firstLine(settings.address)}
                </p>
              </a>
            )}
          </div>
        )}
      </section>

      {/* ─── featured items ─── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-md w-full px-5 pb-10 relative">
          <BeanDivider className="mb-8" />
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {strings.home.aFewFavorites}
              </p>
              <h2 className="mt-1 font-heading text-3xl font-medium tracking-tight">
                {strings.home.onTheBarToday}{" "}
                <span className="italic font-normal">
                  {strings.home.onTheBarTodayItalic}
                </span>
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {strings.actions.all}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ul className="space-y-3">
            {featured.map((item, i) => (
              <li
                key={item.id}
                className="card-hover flex items-center gap-3 rounded-2xl bg-card border border-border p-2.5 animate-rise"
                style={{ animationDelay: `${0.06 * i}s` }}
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                    {item.categoryName}
                  </p>
                  <p className="font-heading text-base font-medium leading-tight truncate">
                    {item.title}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums shrink-0 pr-1">
                  {formatPrice(item.price)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── contact & socials ─── */}
      {(hasContact || hasSocials || settings.hoursLocalized) && (
        <section className="mx-auto max-w-md w-full px-5 pb-10 relative">
          <BeanDivider className="mb-8" />
          <div className="relative rounded-3xl bg-accent text-accent-foreground overflow-hidden shadow-card-lg">
            <CoffeeBean className="absolute -top-6 -right-6 w-28 h-28 text-primary/30 rotate-12 pointer-events-none" />
            <CoffeeBean className="absolute -bottom-4 -left-4 w-20 h-20 text-primary/12 -rotate-12 pointer-events-none" />

            <div className="p-6 space-y-5 relative">
              {settings.hoursLocalized && (
                <InfoRow icon={<Clock className="w-4 h-4" />} label={strings.info.hours}>
                  <p className="whitespace-pre-line">{settings.hoursLocalized}</p>
                </InfoRow>
              )}
              {settings.address && (
                <InfoRow icon={<MapPin className="w-4 h-4" />} label={strings.info.address}>
                  <a
                    href={mapLink(settings.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                  >
                    <p className="whitespace-pre-line">{settings.address}</p>
                    <p className="text-xs opacity-70 mt-1 underline underline-offset-4">
                      {strings.info.openInMaps}
                    </p>
                  </a>
                </InfoRow>
              )}
              {settings.phone && (
                <InfoRow icon={<Phone className="w-4 h-4" />} label={strings.info.call}>
                  <a href={`tel:${settings.phone}`} className="hover:opacity-80">
                    {settings.phone}
                  </a>
                </InfoRow>
              )}
              {settings.email && (
                <InfoRow icon={<Mail className="w-4 h-4" />} label={strings.info.email}>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:opacity-80 break-all"
                  >
                    {settings.email}
                  </a>
                </InfoRow>
              )}
            </div>

            {hasSocials && (
              <div className="border-t border-accent-foreground/10 px-6 py-4 flex items-center gap-2 justify-center relative">
                {settings.instagramUrl && (
                  <SocialIcon href={settings.instagramUrl} label="Instagram">
                    <InstagramIcon className="w-4 h-4" />
                  </SocialIcon>
                )}
                {settings.facebookUrl && (
                  <SocialIcon href={settings.facebookUrl} label="Facebook">
                    <FacebookIcon className="w-4 h-4" />
                  </SocialIcon>
                )}
                {settings.whatsappUrl && (
                  <SocialIcon href={settings.whatsappUrl} label="WhatsApp">
                    <WhatsappIcon className="w-4 h-4" />
                  </SocialIcon>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="mx-auto max-w-md w-full px-5 pb-8 text-center relative">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          © {new Date().getFullYear()} {settings.shopName}
        </p>
      </footer>
    </div>
  );
}

function renderHeadline(tagline: string) {
  const trimmed = tagline.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(" ");
  if (parts.length < 2) return <span>{trimmed}</span>;
  const lastWord = parts.pop()!;
  const rest = parts.join(" ");
  return (
    <>
      {rest} <span className="italic font-normal">{lastWord}</span>
    </>
  );
}

function firstLine(text: string) {
  return text.split("\n")[0]?.trim() ?? text;
}

function mapLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address.replace(/\n/g, ", ")
  )}`;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-accent-foreground/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-0.5">
          {label}
        </p>
        <div className="text-[15px] leading-snug">{children}</div>
      </div>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-accent-foreground/10 hover:bg-accent-foreground/20 flex items-center justify-center transition"
    >
      {children}
    </a>
  );
}
