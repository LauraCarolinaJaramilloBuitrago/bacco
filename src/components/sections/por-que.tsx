import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { Smoke } from "@/components/effects/smoke";
import { ACCENT_HEX } from "@/data/artist";
import { Eyebrow, Reveal } from "./shared";

// Sin iconos ni tarjetas: título y frase bajo un filo de color.
const PILLARS = [
  { title: "Alegría", text: "La pista como celebración: energía que se contagia desde el primer beat.", c: ACCENT_HEX.firefly },
  { title: "Creatividad", text: "Un concepto propio, sofisticado y cultural, que busca diferenciarse.", c: ACCENT_HEX.heliconia },
  { title: "Desenfreno", text: "Soltar el control y dejarse llevar por el groove hasta el amanecer.", c: ACCENT_HEX.river },
];

export function PorQue() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1.15]);

  return (
    <section ref={ref} id="por-que" className="relative isolate overflow-hidden py-32 sm:py-44">
      {/* La foto se funde en los bordes para no cortar el fondo uniforme */}
      <div className="absolute inset-0 -z-20 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_75%,transparent)]">
        <m.img
          src="/img/jungle-macaw.webp"
          alt=""
          loading="lazy"
          style={{ y, scale }}
          className="h-full w-full object-cover opacity-50"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-ink/40" />
      <Smoke className="-z-10" rate={0.45} intensity={0.28} followPointer={false} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow accent="heliconia">¿Por qué BACCO?</Eyebrow>
          <blockquote className="font-display mt-8 text-[clamp(1.55rem,5vw,3.8rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-white">
            De Baco, dios romano del vino, <span className="text-glow">la fiesta</span> y la celebración.
          </blockquote>
          <p className="mt-6 max-w-2xl text-base leading-relaxed sm:mt-8 sm:text-lg text-white">
            Un nombre con carga simbólica e histórica. BACCO es quien trae la fiesta y un espíritu vibrante a cualquier
            lugar donde toque.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12}>
              <article
                data-hot
                className="border-t-2 pt-6 [text-shadow:0_1px_14px_rgb(0_0_0/0.65)]"
                style={{ borderColor: p.c }}
              >
                <h3 className="font-display text-lg font-extrabold uppercase text-white sm:text-xl">{p.title}</h3>
                <p className="mt-3 leading-relaxed text-white">{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
