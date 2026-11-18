import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Puff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  grow: number;
  life: number;
  max: number;
  rot: number;
  vr: number;
  a: number;
};

interface SmokeProps {
  className?: string;
  /** Bocanadas por frame desde el suelo */
  rate?: number;
  /** El cursor deja estela de humo */
  followPointer?: boolean;
  /** RGB "r,g,b" del humo */
  tint?: string;
  intensity?: number;
}

/** Humo/neblina de selva en canvas 2D: sprites radiales que suben, crecen y se disuelven. */
export function Smoke({ className, rate = 0.3, followPointer = true, tint = "210,255,230", intensity = 0.2 }: SmokeProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 128;
    const s = sprite.getContext("2d")!;
    const grad = s.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, `rgba(${tint},0.5)`);
    grad.addColorStop(0.45, `rgba(${tint},0.16)`);
    grad.addColorStop(1, `rgba(${tint},0)`);
    s.fillStyle = grad;
    s.fillRect(0, 0, 128, 128);

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const puffs: Puff[] = [];
    const spawn = (x: number, y: number, trail = false) => {
      if (puffs.length > 110) return;
      puffs.push({
        x,
        y,
        vx: (Math.random() - 0.5) * (trail ? 0.9 : 0.3),
        vy: -(0.15 + Math.random() * (trail ? 0.3 : 0.55)),
        r: trail ? 18 + Math.random() * 30 : 50 + Math.random() * 90,
        grow: 0.2 + Math.random() * 0.35,
        life: 0,
        max: trail ? 160 + Math.random() * 120 : 320 + Math.random() * 320,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.004,
        a: 0.5 + Math.random() * 0.5,
      });
    };

    // Siembra inicial para que no arranque vacío
    for (let i = 0; i < 40; i++) {
      spawn(Math.random() * w, h * (0.4 + Math.random() * 0.7));
      puffs[puffs.length - 1].life = Math.random() * 200;
    }

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (!followPointer || e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      if (Math.random() < 0.5) spawn(x, y, true);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let acc = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      acc += rate;
      while (acc >= 1) {
        acc -= 1;
        spawn(Math.random() * w, h + 60);
      }
      ctx.clearRect(0, 0, w, h);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        if (p.life > p.max) {
          puffs.splice(i, 1);
          continue;
        }
        p.x += p.vx + Math.sin((p.life + p.rot * 90) * 0.012) * 0.18;
        p.y += p.vy;
        p.r += p.grow;
        p.rot += p.vr;
        const t = p.life / p.max;
        ctx.globalAlpha = Math.sin(Math.PI * t) * intensity * p.a;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(sprite, -p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [rate, followPointer, tint, intensity]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
