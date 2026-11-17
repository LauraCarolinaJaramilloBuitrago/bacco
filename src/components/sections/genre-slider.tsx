import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ACCENT_HEX, GENRE_INFO } from "@/data/artist";
import { cn } from "@/lib/utils";

/** Deslizador de subgéneros: cada tarjeta cuenta cómo suena ese estilo. */
export function GenreSlider() {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const n = GENRE_INFO.length;

  const read = useCallback(() => {
    const t = track.current;
    if (!t) return;
    let best = 0;
    let dist = Infinity;
    Array.from(t.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - t.scrollLeft);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };
    t.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
    };
  }, [read]);

  const go = (i: number) => {
    const t = track.current;
    const el = t?.children[Math.max(0, Math.min(n - 1, i))] as HTMLElement | undefined;
    if (t && el) t.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
  };

  const info = GENRE_INFO[active];
  const color = ACCENT_HEX[info.accent];

  return (
    <div role="group" aria-roledescription="carrusel" aria-label="Subgéneros: cómo suena cada uno">
      <ul
        ref={track}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {GENRE_INFO.map((g, i) => {
          const c = ACCENT_HEX[g.accent];
          return (
            <li
              key={g.name}
              aria-label={`${i + 1} de ${n}: ${g.name}`}
              className={cn(
                "glass relative w-[86%] shrink-0 snap-start overflow-hidden rounded-[24px] p-5 transition-opacity duration-300 sm:w-[78%] sm:p-6",
                i === active ? "opacity-100" : "opacity-60",
              )}
              style={{ boxShadow: `inset 0 0 0 1px ${c}55` }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-6 font-display text-[7rem] font-black leading-none text-white/[0.05]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-2xl">
                  {g.name}
                </h3>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ background: `${c}26`, boxShadow: `inset 0 0 0 1px ${c}80` }}
                >
                  {g.bpm} BPM
                </span>
              </div>
              <p className="relative mt-4 text-[15px] leading-relaxed text-white">{g.sound}</p>
              <ul className="relative mt-5 flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <li key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label="Género anterior"
          className="glass flex size-11 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-35"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
        <div className="flex flex-1 flex-col gap-2" aria-live="polite">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {info.name}
          </span>
          <span className="h-[3px] overflow-hidden rounded-full bg-white/15">
            <span
              className="block h-full rounded-full transition-[width,background] duration-300"
              style={{ width: `${((active + 1) / n) * 100}%`, background: color }}
            />
          </span>
        </div>
        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === n - 1}
          aria-label="Género siguiente"
          className="glass flex size-11 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-35"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
