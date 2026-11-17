import { useMemo } from "react";
import { cn } from "@/lib/utils";

// PRNG con semilla: mismas luciérnagas en cada render
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function Fireflies({ count = 28, className, seed = 7 }: { count?: number; className?: string; seed?: number }) {
  const flies = useMemo(() => {
    const r = rng(seed);
    const colors = ["#f5b841", "#f5b841", "#3fbf5a", "#19d3c5"];
    return Array.from({ length: count }, () => ({
      left: r() * 100,
      top: 20 + r() * 75,
      size: 2 + r() * 3.5,
      dur: 7 + r() * 9,
      delay: -r() * 14,
      dx: (r() - 0.5) * 120,
      dy: -30 - r() * 110,
      color: colors[Math.floor(r() * colors.length)],
    }));
  }, [count, seed]);

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {flies.map((f, i) => (
        <span
          key={i}
          className="absolute animate-float rounded-full"
          style={
            {
              left: `${f.left}%`,
              top: `${f.top}%`,
              width: f.size,
              height: f.size,
              background: f.color,
              boxShadow: `0 0 ${f.size * 4}px ${f.size}px ${f.color}66`,
              animationDelay: `${f.delay}s`,
              "--dur": `${f.dur}s`,
              "--dx": `${f.dx}px`,
              "--dy": `${f.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
