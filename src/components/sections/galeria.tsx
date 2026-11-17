import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, m, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { MenuCloseIcon, PlayPauseIcon } from "@/components/ui/animated-state-icons";
import { ArrowIcon } from "@/components/ui/jungle-icons";
import { PHOTOS } from "@/data/artist";
import { cn } from "@/lib/utils";
import { Eyebrow, Reveal, SectionTitle } from "./shared";

const FILTERS = [
  { id: "todo", label: "Todo" },
  { id: "cabina", label: "Cabina" },
  { id: "selva", label: "Selva" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

const AUTOPLAY_MS = 4500;

/** Distancia circular más corta entre i y el activo */
const circ = (i: number, active: number, n: number) => {
  let d = i - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

type Photo = (typeof PHOTOS)[number];

function FilterTabs({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
  return (
    <div role="tablist" aria-label="Filtrar fotos" className="glass inline-flex rounded-full p-1.5">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          role="tab"
          type="button"
          aria-selected={filter === f.id}
          onClick={() => onChange(f.id)}
          className="relative h-10 rounded-full px-5 text-sm font-bold text-white"
        >
          {filter === f.id && (
            <m.span layoutId="gal-pill" className="absolute inset-0 rounded-full bg-leaf-deep" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
          )}
          <span className="relative">{f.label}</span>
        </button>
      ))}
    </div>
  );
}

interface DeckProps {
  list: Photo[];
  active: number;
  go: (dir: number) => void;
  onOpen: (i: number) => void;
  onSelect: (i: number) => void;
}

function CoverflowDeck({ list, active, go, onOpen, onSelect }: DeckProps) {
  const n = list.length;
  const dragX = useMotionValue(0);
  const panned = useRef(false);
  return (
    <m.div
      className="relative mx-auto h-[min(118vw,540px)] touch-pan-y select-none [perspective:1600px] sm:h-[540px]"
      style={{ x: dragX }}
      onPanStart={() => {
        panned.current = true;
      }}
      onPan={(_, info) => dragX.set(info.offset.x * 0.5)}
      onPanEnd={(_, info) => {
        if (info.offset.x < -50 || info.velocity.x < -400) go(1);
        else if (info.offset.x > 50 || info.velocity.x > 400) go(-1);
        animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
        window.setTimeout(() => (panned.current = false), 50);
      }}
    >
      {list.map((p, i) => {
        const d = circ(i, active, n);
        const abs = Math.abs(d);
        const isActive = d === 0;
        return (
          <m.button
            key={p.id}
            type="button"
            tabIndex={-1}
            aria-hidden={!isActive}
            aria-label={isActive ? `Ampliar: ${p.alt}` : `Ver foto: ${p.alt}`}
            onClick={() => {
              if (panned.current) return;
              if (isActive) onOpen(i);
              else onSelect(i);
            }}
            initial={false}
            animate={{
              x: `${d * 58 - 50}%`,
              rotateY: Math.max(-3, Math.min(3, d)) * -22,
              scale: isActive ? 1 : Math.max(0.6, 0.86 - (abs - 1) * 0.1),
              opacity: abs > 3 ? 0 : 1,
            }}
            transition={{ type: "spring", stiffness: 170, damping: 26 }}
            style={{ zIndex: 50 - abs }}
            className="absolute left-1/2 top-0 aspect-[3/4] w-[min(64vw,390px)] overflow-hidden rounded-[26px] border border-white/15 bg-canopy shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]"
          >
            <img src={p.sm} alt="" draggable={false} loading={abs <= 2 ? "eager" : "lazy"} className="pointer-events-none h-full w-full object-cover" />
            {/* Velo oscuro en las laterales */}
            <m.span
              aria-hidden
              className="absolute inset-0 bg-ink"
              initial={false}
              animate={{ opacity: isActive ? 0 : Math.min(0.75, 0.35 + abs * 0.12) }}
              transition={{ duration: 0.4 }}
            />
            {isActive && (
              <m.span
                aria-hidden
                layoutId="active-ring"
                className="absolute inset-0 rounded-[26px] shadow-[inset_0_0_0_2px_#3fbf5a,0_0_60px_-10px_#3fbf5a]"
              />
            )}
          </m.button>
        );
      })}
    </m.div>
  );
}

interface ControlsProps {
  active: number;
  n: number;
  alt?: string;
  autoplay: boolean;
  paused: boolean;
  go: (dir: number) => void;
  onTogglePause: () => void;
}

function GalleryControls({ active, n, alt, autoplay, paused, go, onTogglePause }: ControlsProps) {
  return (
  <div className="mt-6 flex items-center justify-between gap-4">
    <button
      type="button"
      onClick={() => go(-1)}
      className="glass flex size-12 shrink-0 items-center justify-center rounded-full text-white transition hover:shadow-[0_0_24px_-4px_#19d3c5]"
      aria-label="Foto anterior"
    >
      <ArrowIcon dir="left" size={22} />
    </button>

    <div className="min-w-0 flex-1 text-center" aria-live="polite">
      <p className="font-display text-sm font-bold text-white">
        {String(active + 1).padStart(2, "0")} <span className="mx-1">/</span> {String(n).padStart(2, "0")}
      </p>
      <p className="mt-1 truncate text-[15px] font-medium text-white">{alt}</p>
      <div className="mx-auto mt-3 h-[3px] w-28 overflow-hidden rounded-full bg-white/15" aria-hidden>
        <m.div
          key={`${active}-${autoplay}`}
          className="h-full origin-left rounded-full bg-gradient-to-r from-leaf to-river"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: autoplay ? 1 : 0 }}
          transition={{ duration: autoplay ? AUTOPLAY_MS / 1000 : 0.2, ease: "linear" }}
        />
      </div>
    </div>

    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => onTogglePause()}
        className="glass hidden size-12 items-center justify-center rounded-full text-white sm:flex"
        aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}
      >
        <PlayPauseIcon size={20} state={!paused} />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="glass flex size-12 items-center justify-center rounded-full text-white transition hover:shadow-[0_0_24px_-4px_#19d3c5]"
        aria-label="Foto siguiente"
      >
        <ArrowIcon dir="right" size={22} />
      </button>
    </div>
  </div>
  );
}

function ThumbStrip({ list, active, filter, onSelect }: { list: Photo[]; active: number; filter: Filter; onSelect: (i: number) => void }) {
  const strip = useRef<HTMLDivElement>(null);
// Mantener la miniatura activa centrada (sin mover la página)
useEffect(() => {
  const s = strip.current;
  const t = s?.children[active] as HTMLElement | undefined;
  if (s && t) s.scrollTo({ left: t.offsetLeft - s.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
}, [active, filter]);
  return (
  <div
    ref={strip}
    className="mask-fade-x mt-6 flex snap-x gap-2.5 overflow-x-auto px-[45%] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    aria-label="Miniaturas"
  >
    {list.map((p, i) => (
      <button
        key={p.id}
        type="button"
        onClick={() => onSelect(i)}
        aria-label={`Ir a foto ${i + 1}`}
        aria-current={i === active ? "true" : undefined}
        className={cn(
          "relative size-14 shrink-0 snap-center overflow-hidden rounded-xl border-2 transition duration-300 sm:size-16",
          i === active ? "scale-110 border-leaf shadow-[0_0_20px_-2px_#3fbf5a]" : "border-transparent opacity-50 hover:opacity-90",
        )}
      >
        <img src={p.sm} alt="" loading="lazy" className="h-full w-full object-cover" />
      </button>
    ))}
  </div>
  );
}

function Lightbox({ list, open, onClose, goLight }: { list: Photo[]; open: number | null; onClose: () => void; goLight: (dir: number) => void }) {
  const n = list.length;
  const photo = open !== null ? list[open] : null;
// Lightbox: teclado + bloqueo de scroll
useEffect(() => {
  if (open === null) return;
  document.body.style.overflow = "hidden";
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") goLight(1);
    if (e.key === "ArrowLeft") goLight(-1);
  };
  window.addEventListener("keydown", onKey);
  return () => {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  };
}, [open, goLight, onClose]);
  return (
  <AnimatePresence>
    {photo && (
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={photo.alt}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
      >
        <AnimatePresence mode="wait">
          <m.img
            key={photo.id}
            src={photo.src}
            alt={photo.alt}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) goLight(1);
              else if (info.offset.x > 80) goLight(-1);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundImage: `url(${photo.sm})`, backgroundSize: "cover" }}
            className="max-h-[82svh] max-w-full cursor-grab rounded-2xl object-contain shadow-[0_0_120px_-30px_#3fbf5a] active:cursor-grabbing"
          />
        </AnimatePresence>
        <p className="absolute bottom-6 left-1/2 w-[min(90vw,640px)] -translate-x-1/2 text-center text-sm font-semibold text-white">
          {photo.alt} · {open! + 1}/{n}
        </p>
        <button
          type="button"
          onClick={() => onClose()}
          className="glass absolute right-4 top-4 flex size-12 items-center justify-center rounded-full text-white"
          aria-label="Cerrar"
          autoFocus
        >
          <MenuCloseIcon size={26} state />
        </button>
        {[-1, 1].map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goLight(dir);
            }}
            className={cn(
              "glass absolute top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full text-white sm:flex",
              dir < 0 ? "left-3" : "right-3",
            )}
            aria-label={dir < 0 ? "Foto anterior" : "Foto siguiente"}
          >
            <ArrowIcon dir={dir < 0 ? "left" : "right"} size={22} />
          </button>
        ))}
      </m.div>
    )}
  </AnimatePresence>
  );
}


export function Galeria() {
  const [filter, setFilter] = useState<Filter>("todo");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const list = useMemo(() => (filter === "todo" ? PHOTOS : PHOTOS.filter((p) => p.tag === filter)), [filter]);
  const n = list.length;

  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-20% 0px -20% 0px" });
  const reduce = useReducedMotion();

  const go = useCallback((dir: number) => setActive((i) => (i + dir + n) % n), [n]);
  const goLight = useCallback((dir: number) => setOpen((i) => (i === null ? i : (i + dir + n) % n)), [n]);

  // Cambiar filtro: vuelve a la primera foto
  useEffect(() => setActive(0), [filter]);

  // Autoplay: solo visible, sin hover, sin lightbox y sin "reducir movimiento"
  const autoplay = !paused && !hovering && inView && open === null && !reduce;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, active, go]);

  const closeLight = useCallback(() => setOpen(null), []);

  // Lightbox: el cierre y los saltos viven en Lightbox
  const onKeyStage = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "Enter") setOpen(active);
  };

  return (
    <section id="galeria" className="relative overflow-x-clip px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <Eyebrow accent="leaf">Galería</Eyebrow>
            <SectionTitle className="mt-4">Cabina & selva</SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <FilterTabs filter={filter} onChange={setFilter} />
          </Reveal>
        </div>

        {/* Escenario coverflow */}
        <div
          ref={stage}
          role="region"
          aria-roledescription="carrusel"
          aria-label="Fotos de BACCO"
          tabIndex={0}
          onKeyDown={onKeyStage}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          className="relative mt-10 rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-river sm:mt-14"
        >
          <CoverflowDeck list={list} active={active} go={go} onOpen={setOpen} onSelect={setActive} />
          <GalleryControls active={active} n={n} alt={list[active]?.alt} autoplay={autoplay} paused={paused} go={go} onTogglePause={() => setPaused((v) => !v)} />
          <ThumbStrip list={list} active={active} filter={filter} onSelect={setActive} />
        </div>
      </div>

      <Lightbox list={list} open={open} onClose={closeLight} goLight={goLight} />
    </section>
  );
}
