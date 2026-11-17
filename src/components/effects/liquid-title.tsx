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
    const onMove = (e: PointerEvent) => {
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      target = Math.min(55, 10 + v * 0.9);
    };
    const loop = () => {
      current += (target - current) * 0.08;
      target += (10 - target) * 0.04;
      disp.setAttribute("scale", current.toFixed(2));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={`liquid-${id}`} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.022" numOctaves="2" seed="4" result="noise">
            <animate
              attributeName="baseFrequency"
              dur="16s"
              values="0.008 0.022;0.014 0.034;0.008 0.022"
              repeatCount="indefinite"
            />
          </feTurbulence>
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
