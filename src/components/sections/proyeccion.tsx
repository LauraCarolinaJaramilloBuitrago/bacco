import { m } from "motion/react";
import { Eyebrow, Reveal, SectionTitle } from "./shared";

const STEPS = [
  { t: "Hoy", d: "Escena local y regional: Putumayo, Huila y Bogotá." },
  { t: "Producir", d: "Comenzar a producir su propio estilo y mostrar quién es realmente." },
  { t: "Ciudades", d: "Compartirlo en ciudades referentes de Colombia y el mundo." },
  { t: "BAUM", d: "El sueño: debutar en BAUM Festival, ícono por sus artistas, producción y público." },
];

export function Proyeccion() {
  return (
    <section id="proyeccion" className="relative overflow-hidden px-4 py-28 sm:px-6 sm:py-36">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          <Reveal>
            <Eyebrow accent="river">Proyección</Eyebrow>
            <SectionTitle className="mt-5">Rumbo a BAUM</SectionTitle>
            <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-[17px] text-white">
              Su pensamiento es seguir creciendo en la música. Cada set es un paso más río abajo.
            </p>
          </Reveal>

          {/* Lista simple: filas separadas por un filo, sin números ni tarjetas */}
          <ol className="mt-12 border-t border-white/15">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.1}>
                <m.li data-hot whileHover={{ x: 6 }} className="border-b border-white/15 py-5">
                  <span className="font-display block text-base font-extrabold uppercase text-white sm:text-lg">{s.t}</span>
                  <span className="mt-1 block leading-relaxed text-white">{s.d}</span>
                </m.li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.15}>
          <div className="relative mx-auto max-w-[440px]">
            <div aria-hidden className="absolute -inset-6 animate-morph bg-leaf/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-white/10">
              <img src="/img/b16.webp" alt="BACCO concentrado en la mezcla con audífonos bajo luz verde" loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              <p className="font-display absolute bottom-5 left-5 right-5 text-lg font-extrabold sm:bottom-6 sm:left-6 sm:right-6 sm:text-2xl uppercase leading-tight text-white">
                “Darle a conocer al público lo que es realmente.”
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
