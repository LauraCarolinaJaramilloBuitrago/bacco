import { useState } from "react";
import { m } from "motion/react";
import { buttonVariants } from "@/components/ui/button-variants";
import { LINKS } from "@/data/artist";
import { Eyebrow, Reveal, SectionTitle } from "./shared";

const GEAR = [
  { name: "Pioneer CDJ-3000", qty: "×2" },
  { name: "Pioneer DJM-A9", qty: "×1" },
];

export function Rider() {
  const [downloaded, setDownloaded] = useState(false);
  const onDownload = () => {
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2600);
  };
  return (
    <section id="rider" className="relative px-4 py-28 sm:px-6 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <Eyebrow accent="firefly" className="justify-center">
            Rider técnico
          </Eyebrow>
          <SectionTitle className="mt-5">Equipos aceptados</SectionTitle>
        </Reveal>

        <Reveal delay={0.1}>
          <m.div
            data-hot
            whileHover={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative mx-auto mt-14 max-w-4xl"
          >
            <div aria-hidden className="absolute inset-x-[10%] bottom-0 top-[20%] rounded-full bg-river/25 blur-[80px]" />
            <img src="/img/rider-cdj.webp" alt="Dos Pioneer CDJ-3000 y un mezclador DJM-A9" loading="lazy" className="relative w-full drop-shadow-[0_40px_60px_rgb(0_0_0/0.9)]" />
          </m.div>
        </Reveal>

        {/* Equipos en filas simples: nombre y cantidad, sin iconos ni tarjetas */}
        <Reveal delay={0.1}>
          <ul className="mx-auto mt-12 max-w-4xl border-t border-white/15">
            {GEAR.map((g) => (
              <li key={g.name} className="flex items-baseline justify-between gap-4 border-b border-white/15 py-5">
                <span className="font-display text-base font-extrabold uppercase text-white sm:text-lg">{g.name}</span>
                <span className="text-lg font-medium tabular-nums text-white sm:text-xl">{g.qty}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl leading-relaxed text-white">
              Si el promotor no dispone de estos equipos, BACCO se adapta a los que haya disponibles,{" "}
              <strong className="font-bold">excepto CDs y vinilos</strong>.
            </p>
            <a href={LINKS.presskit} download onClick={onDownload} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {downloaded ? "Descargando" : "Presskit PDF"}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
