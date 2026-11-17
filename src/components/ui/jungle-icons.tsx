import { m } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Disc3, Flame, House, Images, MapPin, MessageCircle, SkipBack, SkipForward, SlidersVertical, Sparkles, Wine, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIconState, type StateIconProps } from "./animated-state-icons";

/*
  Íconos de BACCO: Lucide (trazo limpio) para la interfaz.
  Las marcas (Instagram, YouTube, TikTok, SoundCloud, Facebook) siguen dibujadas a mano
  porque Lucide ya no incluye logotipos.
*/

const EASE = [0.32, 0.72, 0, 1] as const;
const base = (size: number) => ({ width: size, height: size });

type P = StateIconProps;
const withHover = (p: P): P => ({ trigger: "hover", ...p });

/** Adapta las props del sistema (size, color, className) a las de Lucide */
const lucide = (p: P): LucideProps => ({
  size: p.size ?? 24,
  color: p.color ?? "currentColor",
  strokeWidth: 2,
  "aria-hidden": true,
  className: cn("shrink-0", p.className),
});

type Dir = "down" | "left" | "right" | "up-right";
export function ArrowIcon({ dir = "right", ...props }: P & { dir?: Dir }) {
  const A = { down: ArrowDown, left: ArrowLeft, right: ArrowRight, "up-right": ArrowUpRight }[dir];
  return <A {...lucide(props)} />;
}
export const PinIcon = (p: P) => <MapPin {...lucide(p)} />;
export const HomeIcon = (p: P) => <House {...lucide(p)} />;
export const SparkleIcon = (p: P) => <Sparkles {...lucide(p)} />;
export const WineIcon = (p: P) => <Wine {...lucide(p)} />;
export const FlameIcon = (p: P) => <Flame {...lucide(p)} />;
export const FaderIcon = (p: P) => <SlidersVertical {...lucide(p)} />;
export const GalleryIcon = (p: P) => <Images {...lucide(p)} />;
export const ChatIcon = (p: P) => <MessageCircle {...lucide(p)} />;
export function SkipIcon({ dir = "next", ...props }: P & { dir?: "next" | "prev" }) {
  const S = dir === "next" ? SkipForward : SkipBack;
  return <S {...lucide(props)} />;
}
/** Disco; con `slash` va tachado (sin CDs ni vinilos) */
export function DiscIcon({ slash = false, ...props }: P & { slash?: boolean }) {
  const { size = 24, color = "currentColor", className } = props;
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={base(size)}>
      <Disc3 size={size} color={color} strokeWidth={2} aria-hidden />
      {slash && (
        <svg aria-hidden viewBox="0 0 24 24" className="absolute inset-0" style={base(size)} fill="none">
          <path d="M4 20L20 4" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

/* ─── Marcas (dibujadas en trazo, mismo estilo) ─── */

export function InstagramIcon(props: P) {
  const { size = 40, color = "currentColor", className } = props;
  const [on, ref] = useIconState<SVGSVGElement>({ duration: 2400, ...withHover(props) });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 40 40" fill="none" className={cn("shrink-0", className)} style={base(size)}>
      <m.rect x="7" y="7" width="26" height="26" rx="8" stroke={color} strokeWidth={2} animate={on ? { rotate: -8 } : { rotate: 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ transformOrigin: "20px 20px" }} />
      <m.circle cx="20" cy="20" r="6" stroke={color} strokeWidth={2} animate={on ? { scale: [1, 0.7, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.5 }} style={{ transformOrigin: "20px 20px" }} />
      <m.circle cx="27.5" cy="12.5" r="1.8" fill={color} animate={on ? { scale: [1, 1.8, 1], opacity: [1, 0.4, 1] } : { scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ transformOrigin: "27.5px 12.5px" }} />
    </svg>
  );
}

export function YouTubeIcon(props: P) {
  const { size = 40, color = "currentColor", className } = props;
  const [on, ref] = useIconState<SVGSVGElement>({ duration: 2400, ...withHover(props) });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 40 40" fill="none" className={cn("shrink-0", className)} style={base(size)}>
      <rect x="5" y="10" width="30" height="20" rx="6" stroke={color} strokeWidth={2} />
      <m.path d="M17 15v10l8.5-5L17 15z" fill={color} animate={on ? { scale: 1.25, x: 1 } : { scale: 1, x: 0 }} transition={{ type: "spring", stiffness: 400, damping: 14 }} style={{ transformOrigin: "21px 20px" }} />
    </svg>
  );
}

/** Nota TikTok con aberración cromática en los colores de acento */
export function TikTokIcon(props: P) {
  const { size = 40, color = "currentColor", className } = props;
  const [on, ref] = useIconState<SVGSVGElement>({ duration: 2400, ...withHover(props) });
  const note = "M23 6v19.5a5.5 5.5 0 11-5.5-5.5M23 6c.8 4.2 3.8 7 8 7.3";
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 40 40" fill="none" className={cn("shrink-0 overflow-visible", className)} style={base(size)}>
      <m.path d={note} stroke="#19d3c5" strokeWidth={2} strokeLinecap="round" animate={on ? { x: -1.8, y: -1.2, opacity: 1 } : { x: 0, y: 0, opacity: 0 }} transition={{ duration: 0.25 }} />
      <m.path d={note} stroke="#ff4f6d" strokeWidth={2} strokeLinecap="round" animate={on ? { x: 1.8, y: 1.2, opacity: 1 } : { x: 0, y: 0, opacity: 0 }} transition={{ duration: 0.25 }} />
      <path d={note} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

/** Nube SoundCloud con barras que ecualizan */
export function SoundCloudIcon(props: P) {
  const { size = 40, color = "currentColor", className } = props;
  const [on, ref] = useIconState<SVGSVGElement>({ duration: 2400, ...withHover(props) });
  const bars = [
    { x: 6, h: 6 },
    { x: 10, h: 9 },
    { x: 14, h: 12 },
  ];
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 40 40" fill="none" className={cn("shrink-0", className)} style={base(size)}>
      {bars.map((b, i) => (
        <m.line
          key={b.x} x1={b.x} x2={b.x} y1={29 - b.h} y2="29" stroke={color} strokeWidth={2} strokeLinecap="round"
          animate={on ? { scaleY: [1, 1.6, 0.6, 1.3, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.8, repeat: on ? Infinity : 0, delay: i * 0.12 }}
          style={{ transformOrigin: `${b.x}px 29px` }}
        />
      ))}
      <path d="M18 29h13.5a5.5 5.5 0 000-11 8.5 8.5 0 00-13.5-4.6V29z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

export function FacebookIcon(props: P) {
  const { size = 40, color = "currentColor", className } = props;
  const [on, ref] = useIconState<SVGSVGElement>({ duration: 2400, ...withHover(props) });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 40 40" fill="none" className={cn("shrink-0", className)} style={base(size)}>
      <circle cx="20" cy="20" r="14" stroke={color} strokeWidth={2} />
      <m.path
        d="M22 34V16c0-2.8 1.4-4.5 4.4-4.5H28"
        stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
      <m.path d="M17 21.5h10" stroke={color} strokeWidth={2.2} strokeLinecap="round" animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }} transition={{ duration: 0.3, delay: on ? 0.35 : 0 }} />
    </svg>
  );
}

/* ─── Galería: marco con montaña; el sol sale cuando está activa ─── */
