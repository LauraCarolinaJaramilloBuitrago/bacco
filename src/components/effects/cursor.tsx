import { useEffect, useRef } from "react";

/**
 * Luz de linterna en la selva: halo verde que sigue el puntero (solo punteros finos).
 * Sobre enlaces/botones se expande y vira a turquesa.
 */
export function Cursor() {
  const halo = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const h = halo.current!;
    const d = dot.current!;
    h.style.display = d.style.display = "block";
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let hx = x;
    let hy = y;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const hot = (e.target as Element | null)?.closest?.("a,button,[data-hot]");
      h.dataset.hot = hot ? "1" : "0";
      d.dataset.hot = hot ? "1" : "0";
    };
    const loop = () => {
      hx += (x - hx) * (reduce ? 1 : 0.12);
      hy += (y - hy) * (reduce ? 1 : 0.12);
      h.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%)`;
      d.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
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
      <div
        ref={halo}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden size-[380px] rounded-full mix-blend-screen transition-[width,height,background] duration-500 data-[hot=1]:size-[200px] data-[hot=1]:bg-[radial-gradient(circle,rgb(25_211_197/0.22),transparent_65%)]"
        style={{ background: "radial-gradient(circle, rgb(63 191 90 / 0.13), transparent 65%)" }}
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[71] hidden size-2 rounded-full bg-white transition-[width,height,background,box-shadow] duration-300 data-[hot=1]:size-9 data-[hot=1]:bg-transparent data-[hot=1]:shadow-[inset_0_0_0_1.5px_#19d3c5,0_0_20px_#19d3c5]"
      />
    </>
  );
}
