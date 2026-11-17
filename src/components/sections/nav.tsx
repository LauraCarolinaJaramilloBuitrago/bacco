import { useEffect, useState } from "react";
import { m } from "motion/react";
import { VolumeIcon } from "@/components/ui/animated-state-icons";
import { ChatIcon, FaderIcon, HomeIcon, PinIcon } from "@/components/ui/jungle-icons";
import { MiniPlayer } from "@/components/player/mini-player";
import { cn } from "@/lib/utils";

/* Escritorio: píldora superior con texto */
const TOP_ITEMS = [
  { id: "raiz", label: "Raíz" },
  { id: "ruta", label: "Ruta" },
  { id: "musica", label: "Música" },
  { id: "galeria", label: "Galería" },
  { id: "rider", label: "Rider" },
  { id: "booking", label: "Booking" },
];

/* Móvil: barra de pestañas inferior estilo app (Mercado Libre / Facebook) */
const TABS = [
  { id: "inicio", label: "Inicio", Icon: HomeIcon, also: ["raiz"] },
  { id: "ruta", label: "Ruta", Icon: PinIcon, also: ["por-que"] },
  { id: "musica", label: "Música", Icon: MusicTabIcon, also: ["galeria"] },
  { id: "rider", label: "Rider", Icon: FaderIcon, also: ["proyeccion"] },
  { id: "booking", label: "Booking", Icon: ChatIcon, also: [] },
];

function MusicTabIcon({ size, state }: { size?: number; state?: boolean }) {
  // Activa = suenan las ondas
  return <VolumeIcon size={size} state={!state} />;
}

export function Nav() {
  const [active, setActive] = useState("inicio");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // La barra superior queda fija: lleva el control del set
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const tabActive = (t: (typeof TABS)[number]) => active === t.id || t.also.includes(active);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
        <nav
          aria-label="Principal"
          className={cn(
            "flex w-full max-w-6xl items-center justify-between gap-2 rounded-full py-1.5 pl-3 pr-1.5 transition-all duration-500 sm:px-4 sm:py-2",
            scrolled ? "glass shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)]" : "border border-transparent",
          )}
        >
          <a href="#inicio" className="font-display flex h-10 items-center px-2 text-base font-black tracking-[-0.02em] text-white sm:text-lg">
            BACCO<span className="ml-0.5 text-[10px] align-top">.999</span>
          </a>
          <ul className="hidden items-center gap-0.5 md:flex">
            {TOP_ITEMS.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="relative flex h-10 items-center rounded-full px-3 text-sm font-semibold text-white lg:px-4"
                  aria-current={active === it.id ? "true" : undefined}
                >
                  {active === it.id && (
                    <m.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-leaf-deep/70 shadow-[0_0_24px_-4px_rgb(63_191_90/0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{it.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <MiniPlayer />
        </nav>
      </header>

      {/* Barra de pestañas inferior (solo móvil/tablet) */}
      <nav
        aria-label="Secciones"
        className="glass fixed inset-x-0 bottom-0 z-50 rounded-none border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((t) => {
            const on = tabActive(t);
            return (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={on ? "page" : undefined}
                  className="relative flex h-16 flex-col items-center justify-center gap-1 text-white"
                >
                  {on && (
                    <m.span
                      layoutId="tab-indicator"
                      aria-hidden
                      className="absolute top-0 h-[3px] w-10 rounded-full bg-leaf shadow-[0_0_14px_#3fbf5a]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={cn("flex size-8 items-center justify-center rounded-full transition duration-300", on && "bg-leaf-deep/60")}>
                    <t.Icon size={22} state={on} />
                  </span>
                  <span className={cn("text-[11px] leading-none tracking-wide text-white", on ? "font-bold" : "font-medium")}>{t.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
