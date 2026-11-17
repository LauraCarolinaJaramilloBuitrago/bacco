import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { m, useScroll, useSpring } from "motion/react";
import { ACCENT_HEX, ROUTE } from "@/data/artist";
import { cn } from "@/lib/utils";
import { Eyebrow, Reveal, SectionTitle } from "./shared";

/**
 * Firma visual del sitio: un río que se dibuja con el scroll y conecta
 * cada ciudad y colectivo por donde ha pasado BACCO.
 */
export function Ruta() {
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState({ w: 0, h: 0, d: "" });

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 75%", "end 55%"] });
  const draw = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });

  const measure = () => {
    const el = wrap.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const pts = nodes.current
      .filter(Boolean)
      .map((n) => {
        const r = n!.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
    if (!pts.length) return;
    const desktop = window.innerWidth >= 768;
    const amp = desktop ? 140 : 22;
    let d = `M ${pts[0].x} 0 L ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dir = i % 2 === 0 ? 1 : -1;
      const dy = (b.y - a.y) / 3;
      d += ` C ${a.x + amp * dir} ${a.y + dy}, ${b.x + amp * dir} ${b.y - dy}, ${b.x} ${b.y}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x} ${box.height}`;
    setGeo({ w: box.width, h: box.height, d });
  };

  useLayoutEffect(measure, []);
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  return (
    <section id="ruta" className="relative px-4 py-28 sm:px-6 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl md:mx-auto md:text-center">
          <Eyebrow accent="river" className="md:justify-center">
            La ruta del río
          </Eyebrow>
          <SectionTitle className="mt-5">De Mocoa a la capital</SectionTitle>
          <p className="mt-5 text-base leading-relaxed sm:text-[17px] text-white">
            Como el agua que baja de la montaña, su sonido ha corrido por colectivos y pistas del sur de Colombia.
            Diez colectivos, seis ciudades.
          </p>
        </Reveal>

        <div ref={wrap} className="relative mt-20">
          {geo.d && (
            <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={geo.w} height={geo.h}>
              <defs>
                <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3fbf5a" />
                  <stop offset="45%" stopColor="#19d3c5" />
                  <stop offset="100%" stopColor="#f5b841" />
                </linearGradient>
              </defs>
              <m.path
                d={geo.d}
                fill="none"
                stroke="url(#river)"
                strokeWidth={10}
                strokeLinecap="round"
                style={{ pathLength: draw, filter: "blur(10px)", opacity: 0.6 }}
              />
              <m.path d={geo.d} fill="none" stroke="url(#river)" strokeWidth={3} strokeLinecap="round" style={{ pathLength: draw }} />
            </svg>
          )}

          <ol className="relative space-y-14 md:space-y-6">
            {ROUTE.map((s, i) => {
              const right = i % 2 === 1;
              const c = ACCENT_HEX[s.accent];
              return (
                <li key={s.city} className="relative grid grid-cols-1 md:grid-cols-2 md:gap-24">
                  <span
                    ref={(el) => {
                      nodes.current[i] = el;
                    }}
                    aria-hidden
                    className="absolute left-5 top-8 z-10 -translate-x-1/2 md:left-1/2"
                  >
                  </span>

                  <Reveal className={cn("pl-14 md:pl-0", right ? "md:col-start-2" : "md:col-start-1 md:text-right")}>
                    <article
                      data-hot
                      className="group glass relative overflow-hidden rounded-[28px] p-6 transition duration-500 hover:-translate-y-1 sm:p-7"
                      style={{ boxShadow: `inset 0 1px 0 ${c}55` }}
                    >
                      <span
                        aria-hidden
                        className="absolute -top-16 size-40 rounded-full opacity-0 blur-3xl transition duration-700 group-hover:opacity-60"
                        style={{ background: c, [right ? "left" : "right"]: -40 }}
                      />
                      <div className={cn("relative flex items-center gap-3", !right && "md:flex-row-reverse")}>
                        <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">{s.city}</h3>
                        {s.home && (
                          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: "#17723a" }}>
                            Casa
                          </span>
                        )}
                      </div>
                      <p className="relative mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-white">{s.region}</p>
                      <p className="relative mt-3 text-[15px] leading-relaxed sm:text-base text-white">{s.note}</p>
                      <ul className={cn("relative mt-5 flex flex-wrap gap-2", !right && "md:justify-end")} aria-label={`Colectivos en ${s.city}`}>
                        {s.collectives.map((col) => (
                          <li
                            key={col}
                            className="rounded-full border px-3 py-1.5 text-[13px] font-semibold text-white"
                            style={{ borderColor: `${c}66` }}
                          >
                            {col}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
