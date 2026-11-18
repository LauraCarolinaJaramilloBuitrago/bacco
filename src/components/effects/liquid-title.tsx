import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Título líquido: feTurbulence + feDisplacementMap.
 * El agua "se agita" con la velocidad del puntero y vuelve a calmarse.
 */
export function LiquidTitle({ text, className }: { text: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    const disp = dispRef.current;
    if (!disp) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      disp.setAttribute("scale", "6");
      return;
    }
    let target = 10;
    let current = 10;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    // El filtro solo se recalcula mientras el agua se agita; en reposo el bucle se detiene
    const loop = () => {
      current += (target - current) * 0.08;
      target += (10 - target) * 0.04;
      disp.setAttribute("scale", current.toFixed(2));
      if (Math.abs(current - 10) < 0.05 && Math.abs(target - 10) < 0.05) {
        disp.setAttribute("scale", "10");
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      target = Math.min(55, 10 + v * 0.9);
      if (v > 4 && !raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={`liquid-${id}`} x="-10%" y="-20%" width="120%" height="140%">
          {/* Ruido estático: animar baseFrequency re-rasteriza el título gigante en cada cuadro */}
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.026" numOctaves="1" seed="4" result="noise" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <h1
        className={cn("font-display font-black uppercase leading-[0.82] tracking-[-0.04em] text-white text-glow", className)}
        style={{ filter: `url(#liquid-${id})` }}
      >
        {text}
      </h1>
    </>
  );
}
