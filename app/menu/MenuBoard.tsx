"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BeanDivider, CoffeeBean } from "@/lib/decorations";
import ItemDetailDialog, { type DialogItem } from "./ItemDetailDialog";

export type MenuItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export default function MenuBoard({
  populated,
  chapterLabel,
}: {
  populated: MenuCategory[];
  chapterLabel: string;
}) {
  const [selected, setSelected] = useState<DialogItem | null>(null);

  return (
    <>
      {populated.map((category, ci) => (
        <section
          key={category.id}
          id={`c-${category.id}`}
          className="scroll-mt-nav relative pt-10 first:pt-6"
        >
          {ci > 0 && <BeanDivider className="mb-10 -mt-2" />}

          <div className="relative">
            <CoffeeBean
              aria-hidden="true"
              className={`absolute top-0 w-16 h-16 text-primary/12 pointer-events-none ${
                ci % 2 === 0 ? "-right-3 -rotate-12" : "-left-3 rotate-12"
              }`}
            />
            <div className="relative flex items-baseline justify-between gap-3 mb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {chapterLabel} {String(ci + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 font-heading text-3xl font-medium tracking-tight leading-none">
                  {category.name}
                </h2>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {category.items.length}
              </span>
            </div>
          </div>

          <ul className="space-y-3 relative">
            {category.items.map((item, i) => (
              <MenuItemCard
                key={item.id}
                item={item}
                index={i}
                categoryName={category.name}
                onOpen={setSelected}
              />
            ))}
          </ul>
        </section>
      ))}

      <ItemDetailDialog item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function MenuItemCard({
  item,
  index,
  categoryName,
  onOpen,
}: {
  item: MenuItem;
  index: number;
  categoryName: string;
  onOpen: (item: DialogItem) => void;
}) {
  return (
    <li className="animate-rise" style={{ animationDelay: `${0.03 * index}s` }}>
      <button
        type="button"
        onClick={() => onOpen({ ...item, categoryName })}
        className={`card-hover group relative w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-3 text-left ${
          item.available ? "" : "opacity-70"
        }`}
      >
        <div className="relative w-[92px] h-[92px] rounded-xl overflow-hidden bg-muted shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="92px"
              className={`object-cover transition duration-500 ${
                item.available ? "group-hover:scale-[1.05]" : "grayscale"
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageOff className="w-4 h-4" />
            </div>
          )}
          {!item.available && (
            <div className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-wide font-semibold bg-background/95 text-foreground px-1.5 py-0.5 rounded shadow-sm">
              Sold out
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 self-stretch flex flex-col justify-center py-0.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-[17px] font-medium leading-tight tracking-tight flex-1 min-w-0 line-clamp-2">
              {item.title}
            </h3>
            <span className="text-[15px] font-medium tabular-nums shrink-0">
              {formatPrice(item.price)}
            </span>
          </div>
          {item.subtitle && (
            <p className="mt-1 text-[13px] text-muted-foreground italic leading-snug line-clamp-2">
              {item.subtitle}
            </p>
          )}
          {item.description && !item.subtitle && (
            <p className="mt-1 text-[13px] text-muted-foreground leading-snug line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}
