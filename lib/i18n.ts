export const LOCALES = ["en", "az", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, { short: string; name: string; flag: string }> = {
  en: { short: "EN", name: "English", flag: "🇬🇧" },
  az: { short: "AZ", name: "Azərbaycanca", flag: "🇦🇿" },
  ru: { short: "RU", name: "Русский", flag: "🇷🇺" },
};

/**
 * Resolve a localized field with a fallback to the base value.
 * Example: pickLocalized({ title: "Latte", titleAz: "Latte", titleRu: "Латте" }, "title", "ru")
 * → "Латте"; if titleRu were empty, it would return "Latte".
 */
export function pickLocalized<T extends Record<string, unknown>>(
  obj: T,
  baseKey: string,
  locale: Locale
): string {
  const base = String(obj[baseKey] ?? "");
  if (locale === "en") return base;
  const suffix = locale === "az" ? "Az" : "Ru";
  const localizedKey = `${baseKey}${suffix}`;
  const value = obj[localizedKey];
  if (typeof value === "string" && value.trim()) return value;
  return base;
}

/** Same but for nullable fields — returns the resolved string or null. */
export function pickLocalizedNullable<T extends Record<string, unknown>>(
  obj: T,
  baseKey: string,
  locale: Locale
): string | null {
  const resolved = pickLocalized(obj, baseKey, locale);
  return resolved ? resolved : null;
}

// ─── UI strings ────────────────────────────────────────────

type Dict = {
  brand: {
    nowBrewing: string;
    freshlyBrewed: string;
    orderAtBar: string;
    smallBatch: string;
    openToday: string;
    sinceDayOne: string;
  };
  actions: {
    menu: string;
    order: string;
    viewMenu: string;
    back: string;
    backToMenu: string;
    all: string;
    call: string;
    seeAll: string;
    close: string;
  };
  home: {
    aFewFavorites: string;
    onTheBarToday: string;
    onTheBarTodayItalic: string;
    todayLabel: string;
    findUsLabel: string;
  };
  menu: {
    theMenu: string;
    whatsOn: string;
    whatsOnItalic: string;
    chapter: string;
    countItems: (n: number) => string;
    comingSoonTitle: string;
    comingSoonBody: string;
    orderAtCounter: string;
    seeYouAtTheBar: string;
    noDescription: string;
    soldOut: string;
    itemsLabel: string;
  };
  info: {
    hours: string;
    address: string;
    call: string;
    email: string;
    openInMaps: string;
  };
  lang: {
    language: string;
  };
};

const en: Dict = {
  brand: {
    nowBrewing: "Now brewing",
    freshlyBrewed: "Freshly brewed",
    orderAtBar: "Order at the bar",
    smallBatch: "Small batch",
    openToday: "Open today",
    sinceDayOne: "Since day one",
  },
  actions: {
    menu: "Menu",
    order: "Order",
    viewMenu: "View the menu",
    back: "Back",
    backToMenu: "Back to menu",
    all: "All",
    call: "Call",
    seeAll: "See all",
    close: "Close",
  },
  home: {
    aFewFavorites: "A few favorites",
    onTheBarToday: "On the bar",
    onTheBarTodayItalic: "today",
    todayLabel: "Today",
    findUsLabel: "Find us",
  },
  menu: {
    theMenu: "The menu",
    whatsOn: "What’s on",
    whatsOnItalic: "today",
    chapter: "Chapter",
    countItems: (n) => `${n} ${n === 1 ? "item" : "items"}`,
    comingSoonTitle: "Menu coming soon",
    comingSoonBody: "We’re still setting up. Check back in a moment.",
    orderAtCounter: "Order at the counter",
    seeYouAtTheBar: "See you at the bar",
    noDescription: "No description yet.",
    soldOut: "Sold out",
    itemsLabel: "items",
  },
  info: {
    hours: "Hours",
    address: "Address",
    call: "Call",
    email: "Email",
    openInMaps: "Open in Maps",
  },
  lang: { language: "Language" },
};

const az: Dict = {
  brand: {
    nowBrewing: "İndi hazırlanır",
    freshlyBrewed: "Təzə dəmlənmiş",
    orderAtBar: "Barda sifariş",
    smallBatch: "Kiçik partiya",
    openToday: "Bu gün açıq",
    sinceDayOne: "İlk gündən bəri",
  },
  actions: {
    menu: "Menyu",
    order: "Sifariş",
    viewMenu: "Menyuya bax",
    back: "Geri",
    backToMenu: "Menyuya qayıt",
    all: "Hamısı",
    call: "Zəng",
    seeAll: "Hamısına bax",
    close: "Bağla",
  },
  home: {
    aFewFavorites: "Sevimlilərdən",
    onTheBarToday: "Bu gün",
    onTheBarTodayItalic: "barda",
    todayLabel: "Bu gün",
    findUsLabel: "Bizi tap",
  },
  menu: {
    theMenu: "Menyu",
    whatsOn: "Bu gün",
    whatsOnItalic: "menyuda",
    chapter: "Bölmə",
    countItems: (n) => `${n} məhsul`,
    comingSoonTitle: "Menyu tezliklə",
    comingSoonBody: "Hələ hazırlaşırıq. Bir azdan yenidən yoxlayın.",
    orderAtCounter: "Sifariş piştaxtada",
    seeYouAtTheBar: "Barda görüşərik",
    noDescription: "Təsvir yoxdur.",
    soldOut: "Bitib",
    itemsLabel: "məhsul",
  },
  info: {
    hours: "İş saatları",
    address: "Ünvan",
    call: "Zəng",
    email: "E-poçt",
    openInMaps: "Xəritədə aç",
  },
  lang: { language: "Dil" },
};

const ru: Dict = {
  brand: {
    nowBrewing: "Свежая партия",
    freshlyBrewed: "Свежесваренный",
    orderAtBar: "Заказ у бариста",
    smallBatch: "Малая партия",
    openToday: "Сегодня открыто",
    sinceDayOne: "С первого дня",
  },
  actions: {
    menu: "Меню",
    order: "Заказ",
    viewMenu: "Открыть меню",
    back: "Назад",
    backToMenu: "К меню",
    all: "Всё",
    call: "Позвонить",
    seeAll: "Всё",
    close: "Закрыть",
  },
  home: {
    aFewFavorites: "Немного любимого",
    onTheBarToday: "Сегодня в",
    onTheBarTodayItalic: "баре",
    todayLabel: "Сегодня",
    findUsLabel: "Найти нас",
  },
  menu: {
    theMenu: "Меню",
    whatsOn: "Что",
    whatsOnItalic: "сегодня",
    chapter: "Глава",
    countItems: (n) => `${n} ${n === 1 ? "позиция" : "позиций"}`,
    comingSoonTitle: "Меню скоро",
    comingSoonBody: "Мы всё ещё настраиваем. Загляните позже.",
    orderAtCounter: "Заказ у бариста",
    seeYouAtTheBar: "Ждём у бара",
    noDescription: "Описание пока нет.",
    soldOut: "Закончилось",
    itemsLabel: "позиций",
  },
  info: {
    hours: "Часы",
    address: "Адрес",
    call: "Позвонить",
    email: "Почта",
    openInMaps: "Открыть на карте",
  },
  lang: { language: "Язык" },
};

export const UI: Record<Locale, Dict> = { en, az, ru };

export function t(locale: Locale): Dict {
  return UI[locale];
}
