import { LazyMotion } from "motion/react";
import { SmokeBackdrop } from "@/components/effects/smoke-backdrop";
import { PlayerProvider } from "@/components/player/player-context";
import { Cursor } from "@/components/effects/cursor";
import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Bio } from "@/components/sections/bio";
import { Ruta } from "@/components/sections/ruta";
import { PorQue } from "@/components/sections/por-que";
import { Musica } from "@/components/sections/musica";
import { Galeria } from "@/components/sections/galeria";
import { Proyeccion } from "@/components/sections/proyeccion";
import { Rider } from "@/components/sections/rider";
import { Booking } from "@/components/sections/booking";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export default function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
    <PlayerProvider>
    <div className="relative min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Humo de seda constante detrás de todo el sitio: late con el bajo y se mueve al bajar */}
      <SmokeBackdrop />
      <Cursor />
      <a href="#raiz" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-leaf-deep focus:px-4 focus:py-2 focus:text-white">
        Saltar al contenido
      </a>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Bio />
        <Ruta />
        <PorQue />
        <Musica />
        <Galeria />
        <Proyeccion />
        <Rider />
        <Booking />
      </main>
    </div>
    </PlayerProvider>
    </LazyMotion>
  );
}
