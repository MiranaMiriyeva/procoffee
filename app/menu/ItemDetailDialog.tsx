"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X, ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CoffeeBean } from "@/lib/decorations";

export type DialogItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  categoryName: string;
};

export default function ItemDetailDialog({
  item,
  onClose,
}: {
  item: DialogItem | null;
  onClose: () => void;
}) {
  const open = !!item;

  useEffect(() => {
    if (!open) return;
    // Prevent body scroll behind the sheet.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md animate-rise"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-background rounded-t-[2rem] sm:rounded-[2rem] shadow-card-xl max-h-[92dvh] overflow-hidden flex flex-col"
      >
        {/* Grab handle (mobile only) */}
        <div className="sm:hidden pt-2 pb-1 flex justify-center">
          <span className="block h-1.5 w-10 rounded-full bg-foreground/15" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 sm:top-4 z-10 w-9 h-9 rounded-full bg-background/85 backdrop-blur hover:bg-background flex items-center justify-center shadow-card text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {/* Image */}
          <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className={`object-cover ${item.available ? "" : "grayscale"}`}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageOff className="w-8 h-8" />
              </div>
            )}
            <CoffeeBean className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/30 rotate-12 pointer-events-none" />
            {!item.available && (
              <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wide font-semibold bg-background/95 text-foreground px-2 py-1 rounded shadow-sm">
                Sold out
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {item.categoryName}
              </p>
              <div className="mt-2 flex items-start justify-between gap-4">
                <h2
                  id="item-title"
                  className="font-heading text-3xl font-medium tracking-tight leading-[1.05] flex-1"
                >
                  {item.title}
                </h2>
                <span className="font-heading text-2xl font-medium tabular-nums shrink-0">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            {item.subtitle && (
              <p className="text-base text-muted-foreground italic leading-relaxed">
                {item.subtitle}
              </p>
            )}

            {item.description && (
              <p className="text-[15px] text-foreground/80 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            )}

            {!item.description && !item.subtitle && (
              <p className="text-sm text-muted-foreground">
                No description yet.
              </p>
            )}
          </div>

          <div className="p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-full bg-foreground text-background font-medium hover:opacity-90 active:scale-[0.98] transition"
            >
              Back to menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
