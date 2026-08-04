"use client";

import { useEffect, useRef, useState } from "react";

export default function MenuCategoryNav({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(categories[0]?.id ?? null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most intersecting section as active.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^c-/, "");
          setActiveId(id);
        }
      },
      {
        // Offset so a section registers as "active" once its title is under the sticky nav.
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0,
      }
    );

    categories.forEach(({ id }) => {
      const el = document.getElementById(`c-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  // Auto-scroll the active chip into view.
  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(`c-${id}`);
    if (!el) return;
    // Custom scroll accounting for the sticky nav (h-14 header ≈ 56 + nav row ≈ 48 = ~104).
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - 110;
    window.scrollTo({ top: targetY, behavior: "smooth" });
    setActiveId(id);
  }

  return (
    <div
      ref={navRef}
      className="no-scrollbar flex items-center gap-1.5 px-3 py-2 overflow-x-auto"
    >
      {categories.map((c) => {
        const isActive = c.id === activeId;
        return (
          <a
            key={c.id}
            href={`#c-${c.id}`}
            data-cat={c.id}
            onClick={(e) => handleClick(e, c.id)}
            className={`inline-flex items-center justify-center shrink-0 h-9 px-4 rounded-full text-sm font-medium leading-none transition whitespace-nowrap ${
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.name}
          </a>
        );
      })}
    </div>
  );
}
