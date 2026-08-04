"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Globe } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({
  current,
  variant = "light",
}: {
  current: Locale;
  variant?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(locale: Locale) {
    if (locale === current) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setLocale(locale);
      setOpen(false);
    });
  }

  const triggerBase =
    variant === "dark"
      ? "bg-white/15 backdrop-blur ring-1 ring-white/25 text-white"
      : "bg-card border border-border text-foreground";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-label="Change language"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[11px] font-semibold uppercase tracking-widest transition disabled:opacity-60 ${triggerBase}`}
      >
        <Globe className="w-3.5 h-3.5" />
        {LOCALE_LABELS[current].short}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-card border border-border shadow-card-lg overflow-hidden animate-rise z-50"
        >
          {LOCALES.map((loc) => {
            const isActive = loc === current;
            const l = LOCALE_LABELS[loc];
            return (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => pick(loc)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-muted transition ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="text-lg leading-none">{l.flag}</span>
                <span className="flex-1 font-medium">{l.name}</span>
                {isActive && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
