import { m } from "motion/react";
import { cn } from "@/lib/utils";
import type { Accent } from "@/data/artist";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; accent?: Accent; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.26em] sm:text-[13px] text-white", className)}>
      {children}
    </p>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-[clamp(1.85rem,5.4vw,4.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white", className)}>
      {children}
    </h2>
  );
}

/** Hoja SVG usada como separador/ornamento */
export function Leaf({ className, color = "#3fbf5a" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 2C18 7 20 13 12 22 4 13 6 7 12 2Z" fill={color} />
      <path d="M12 5v15" stroke="#040a06" strokeWidth="1.2" />
    </svg>
  );
}
