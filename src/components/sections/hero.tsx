import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { m, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { VolumeIcon } from "@/components/ui/animated-state-icons";
import { ArrowIcon, PinIcon } from "@/components/ui/jungle-icons";
import { LiquidTitle } from "@/components/effects/liquid-title";
import { Smoke } from "@/components/effects/smoke";
import { SiriWave } from "@/components/ui/siri-wave";
import { usePlayer } from "@/components/player/player-context";
import { buttonVariants } from "@/components/ui/button-variants";
import { LINKS } from "@/data/artist";
import { cn } from "@/lib/utils";

type Ripple = { id: number; x: number; y: number };

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const cutY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  // Parallax con el puntero para la figura de BACCO
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const figX = useTransform(sx, (v) => v * 22);
  const figY = useTransform(sy, (v) => v * 14);
  const blobX = useTransform(sx, (v) => v * -40);
  const blobY = useTransform(sy, (v) => v * -30);

  // Orbe de luz: puntos fluidos en reposo, onda de voz cuando suena un set.
  // Sigue el puntero (parallax) y "late" con cada toque.
  const { isPlaying } = usePlayer();
  // La onda se monta con retraso: el iframe y el contexto WebGL no compiten en el mismo instante
  const [showWave, setShowWave] = useState(false);
  useEffect(() => {
    if (!isPlaying) {
      setShowWave(false);
      return;
    }
    const id = window.setTimeout(() => setShowWave(true), 900);
    return () => window.clearTimeout(id);
  }, [isPlaying]);
  const kick = useMotionValue(1);
  const orbScale = useSpring(kick, { stiffness: 220, damping: 12 });
  const orbX = useTransform(sx, (v) => v * 70);
  const orbY = useTransform(sy, (v) => v * 50);

  // Centro de la figura (relativo a la sección) para anclar el orbe detrás de BACCO
  const figRef = useRef<HTMLDivElement>(null);
  const [orb, setOrb] = useState({ x: 0, y: 0, w: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const sec = ref.current;
      const fig = figRef.current;
      if (!sec || !fig) return;
      const a = sec.getBoundingClientRect();
      const b = fig.getBoundingClientRect();
      setOrb({ x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height * 0.42, w: b.width * 5.5 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    if (figRef.current) ro.observe(figRef.current);
    return () => ro.disconnect();
  }, []);

  const [ripples, setRipples] = useState<Ripple[]>([]);

  const onMove = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // Gota en el agua: anillos al hacer clic/tocar
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("a,button")) return;
    kick.set(1.22);
    window.setTimeout(() => kick.set(1), 140);
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((rs) => [...rs.slice(-5), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    window.setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 1800);
  };

  return (
    <section
      id="inicio"
      ref={ref}
      onPointerMove={onMove}
      onPointerDown={onDown}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Helechos del Putumayo */}
      <m.div style={{ y: bgY }} className="absolute inset-0 -z-20">
        <img src="/img/fern.webp" alt="" className="h-[120%] w-full object-cover opacity-45 saturate-[1.15]" />
      </m.div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_70%_40%,transparent_0%,rgb(4_10_6/0.4)_55%,rgb(4_10_6/0.5)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink/50 to-transparent" />

      <Smoke className="z-0" intensity={0.22} />

      {/* Orbe de luz (mix-blend-screen): vive a nivel de sección para mezclarse con los helechos */}
      <div aria-hidden className="pointer-events-none absolute" style={{ left: orb.x, top: orb.y, width: 0, height: 0 }}>
        <m.div
          style={{ x: orbX, y: orbY, scale: orbScale, width: orb.w, height: orb.w, marginLeft: -orb.w / 2, marginTop: -orb.w / 2 }}
          className="relative mix-blend-screen"
        >
          {/* El humo vive en el fondo global (SmokeBackdrop); aquí solo la onda cuando suena */}
          {showWave && (
            <SiriWave
              variant="wave"
              size={800}
              renderScale={0.4}
              className="absolute inset-0 size-full rounded-none"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </m.div>
      </div>

      {ripples.map((r) => (
        <span key={r.id} aria-hidden className="pointer-events-none absolute z-10" style={{ left: r.x, top: r.y }}>
          {[0, 0.18, 0.36].map((d) => (
            <m.span
              key={d}
              className="absolute left-0 top-0 -ml-[130px] -mt-[130px] size-[260px] rounded-full border border-river"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1.6, delay: d, ease: "easeOut" }}
            />
          ))}
        </span>
      ))}

      <m.div
        style={{ opacity: fade }}
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-0 lg:pt-24"
      >
        <div className="relative z-20 order-2 lg:order-1">
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="glass mb-4 inline-flex sm:mb-6 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white"
          >
            <PinIcon size={18} color="#ff4f6d" trigger="loop" />
            DJ · Mocoa, Putumayo — Colombia
          </m.p>

          <m.div
            initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <LiquidTitle text="Bacco" className="text-[clamp(3.9rem,16vw,11.5rem)]" />
          </m.div>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white sm:mt-6 sm:text-xl"
          >
            Frecuencias de selva para la pista. Techno, indie dance, progressive, hard groove y raw techno desde el
            piedemonte amazónico.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a href="#musica" className={buttonVariants({ size: "lg" })}>
              <VolumeIcon size={22} trigger="hover" invert />
              Escuchar sets
            </a>
            <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              Booking
            </a>
          </m.div>
        </div>

        {/* Figura recortada del presskit sobre burbuja líquida */}
        <div ref={figRef} className="relative order-1 mx-auto w-[min(50vw,250px)] sm:w-[min(62vw,320px)] lg:order-2 lg:w-full lg:max-w-[440px]">
          <m.div
            aria-hidden
            style={{ x: blobX, y: blobY }}
            className="absolute inset-[6%] -z-10 animate-morph bg-[conic-gradient(from_200deg,#17723a,#19d3c5,#3fbf5a,#f5b841,#17723a)] opacity-70 blur-2xl"
          />
          <m.div
            aria-hidden
            style={{ x: blobX, y: blobY }}
            className="absolute inset-[14%] -z-10 animate-morph rounded-full border border-white/20 [animation-delay:-5s]"
          />
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <m.div style={{ y: cutY }}>
              <m.img
                src="/img/bacco-cutout.webp"
                alt="BACCO con camiseta negra de su marca"
                style={{ x: figX, y: figY }}
                className="relative w-full drop-shadow-[0_30px_60px_rgb(0_0_0/0.8)] [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,#000_72%,transparent),linear-gradient(to_right,transparent,#000_16%)] [-webkit-mask-composite:source-in]"
              />
            </m.div>
          </m.div>
        </div>
      </m.div>

      <a
        href="#raiz"
        aria-label="Bajar a la biografía"
        className={cn(
          "absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 md:flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-white",
        )}
      >
        Entrar
        <m.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="glass flex size-10 items-center justify-center rounded-full">
          <ArrowIcon dir="down" size={18} trigger="loop" duration={900} />
        </m.span>
      </a>
    </section>
  );
}
