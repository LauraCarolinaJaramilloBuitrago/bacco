import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { Eyebrow, Reveal, SectionTitle } from "./shared";
import { GenreSlider } from "./genre-slider";

export function Bio() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 14 });
  const sry = useSpring(ry, { stiffness: 120, damping: 14 });
  const backX = useTransform(sry, (v) => v * -1.6);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section id="raiz" className="relative px-4 py-28 sm:px-6 sm:py-36">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
        {/* Pila de fotos con inclinación 3D */}
        <Reveal>
          <div
            className="relative mx-auto aspect-[4/5] w-full max-w-[460px] [perspective:1200px]"
            onPointerMove={onMove}
            onPointerLeave={reset}
            data-hot
          >
            <m.img
              src="/img/b11-sm.webp"
              alt="BACCO sentado sobre una roca al atardecer"
              loading="lazy"
              style={{ x: backX, rotate: -7 }}
              className="absolute -left-4 top-10 w-[58%] rounded-[28px] border border-white/15 object-cover shadow-2xl sm:-left-10"
            />
            <m.div
              style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
              className="absolute bottom-0 right-0 w-[78%] overflow-hidden rounded-[32px] border border-white/15 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9),0_0_60px_-20px_rgb(63_191_90/0.6)]"
            >
              <img src="/img/b15.webp" alt="BACCO entre helechos en la selva" loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 text-sm font-bold text-white" style={{ transform: "translateZ(40px)" }}>
                Mocoa · 604 m s. n. m.
              </p>
            </m.div>
            <div aria-hidden className="absolute -right-6 -top-6 size-32 animate-morph bg-river/40 blur-2xl" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow>Biografía</Eyebrow>
            <SectionTitle className="mt-5">
              Raíz de selva,
              <br />
              pulso de pista
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-7 space-y-5 text-base leading-[1.75] sm:text-[17px] text-white">
              <p>
                <strong className="font-bold">Manuel Alejandro Lasso López</strong>, conocido como{" "}
                <strong className="font-bold">BACCO</strong>, es oriundo de Mocoa, Putumayo: tierra de ríos, cascadas y
                montaña donde los Andes se encuentran con la Amazonía.
              </p>
              <p>
                Lleva cuatro años detrás de las tornamesas con un estilo versátil, inspirado por referentes del género
                como Yame y David Meiser.
              </p>
              <p>
                A sus 26 años se ha dado a conocer en la escena local y ha llevado su sonido a Bogotá, Yaguará,
                Pitalito, Isnos y Puerto Asís, un avance firme en su trayectoria como DJ.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2} className="mt-9">
            <GenreSlider />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
