import type { CSSProperties, SVGProps } from "react";

export function CoffeeBean(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <ellipse cx="12" cy="12" rx="6.2" ry="9.4" fill="currentColor" />
      <path
        d="M12 3.5 Q9.5 12 12 20.5"
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 5.5 Q13.5 12 12 18.5"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * A single steam curl. Compose several with staggered animation delays
 * to fake a rising steam plume.
 */
export function SteamPuff({
  delay = 0,
  className = "",
  style,
}: {
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`absolute bottom-0 left-1/2 animate-steam ${className}`}
      style={{ animationDelay: `${delay}s`, ...style }}
    >
      <svg viewBox="0 0 24 40" width="20" height="34" aria-hidden="true">
        <path
          d="M12 38 C 5 32, 19 26, 12 20 C 5 14, 19 8, 12 2"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

/**
 * Floating coffee beans decoratively arranged. Non-interactive; positions
 * itself absolutely inside a `relative` parent. Tuned for the hero section.
 */
export function FloatingBeans({ className = "" }: { className?: string }) {
  const beans: {
    top: string;
    left?: string;
    right?: string;
    size: string;
    tone: string;
    rotate: string;
    delay: string;
    duration: string;
    dx: string;
    dy: string;
  }[] = [
    { top: "8%", left: "6%", size: "w-9 h-9", tone: "text-primary/25", rotate: "-15deg", delay: "0s", duration: "11s", dx: "6px", dy: "-14px" },
    { top: "18%", right: "10%", size: "w-6 h-6", tone: "text-primary/20", rotate: "22deg", delay: "1.4s", duration: "9s", dx: "-4px", dy: "-10px" },
    { top: "48%", left: "-2%", size: "w-11 h-11", tone: "text-foreground/8", rotate: "18deg", delay: "0.7s", duration: "13s", dx: "8px", dy: "-16px" },
    { top: "60%", right: "-2%", size: "w-8 h-8", tone: "text-primary/20", rotate: "-24deg", delay: "2s", duration: "10s", dx: "-6px", dy: "-12px" },
    { top: "78%", left: "22%", size: "w-5 h-5", tone: "text-foreground/10", rotate: "8deg", delay: "0.3s", duration: "12s", dx: "5px", dy: "-14px" },
    { top: "86%", right: "24%", size: "w-7 h-7", tone: "text-primary/18", rotate: "-8deg", delay: "1.8s", duration: "11s", dx: "-5px", dy: "-10px" },
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {beans.map((b, i) => (
        <CoffeeBean
          key={i}
          className={`absolute ${b.size} ${b.tone} animate-float-bean`}
          style={
            {
              top: b.top,
              left: b.left,
              right: b.right,
              "--r": b.rotate,
              "--dx": b.dx,
              "--dy": b.dy,
              "--dur": b.duration,
              animationDelay: b.delay,
              transform: `rotate(${b.rotate})`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Big soft yellow radial glow used as a background decoration.
 */
export function YellowGlow({
  className = "",
  size = 500,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full animate-glow-pulse ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at center, rgba(245, 184, 0, 0.55), rgba(245, 184, 0, 0.15) 45%, transparent 70%)",
        filter: "blur(40px)",
      }}
    />
  );
}

/**
 * Scrolling brand ticker — horizontal marquee. Words repeat so the loop
 * never has visible gaps.
 */
export function BrandTicker({ items }: { items: string[] }) {
  const track = [...items, ...items, ...items, ...items];
  return (
    <div className="relative w-full overflow-hidden bg-primary text-primary-foreground border-y border-primary-foreground/10">
      <div className="animate-marquee flex whitespace-nowrap py-2 text-[11px] font-semibold uppercase tracking-[0.28em]">
        {track.map((word, i) => (
          <span key={i} className="flex items-center gap-3 px-4 shrink-0">
            {word}
            <CoffeeBean className="w-3 h-3 opacity-70" style={{ transform: "rotate(20deg)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Ornamental Fraunces divider with a bean center — used between sections
 * to signal a "chapter" change without a heavy horizontal rule.
 */
export function BeanDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px flex-1 bg-border" />
      <CoffeeBean className="w-4 h-4 text-primary/70" style={{ transform: "rotate(-15deg)" }} />
      <CoffeeBean className="w-3 h-3 text-foreground/30" style={{ transform: "rotate(20deg)" }} />
      <CoffeeBean className="w-4 h-4 text-primary/70" style={{ transform: "rotate(-5deg)" }} />
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
