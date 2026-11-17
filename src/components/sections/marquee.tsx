import { GENRES, ACCENT_HEX } from "@/data/artist";
import { Leaf } from "./shared";

const colors = [ACCENT_HEX.leaf, ACCENT_HEX.river, ACCENT_HEX.firefly, ACCENT_HEX.heliconia];

export function Marquee() {
  const items = [0, 1, 2, 3].flatMap((copy) => GENRES.map((g, j) => ({ key: `${copy}-${g}`, g, n: copy * GENRES.length + j, hidden: copy > 0 })));
  return (
    <div className="relative z-10 -rotate-[1.5deg] border-y border-white/10 bg-canopy/80 py-5 backdrop-blur-sm" aria-label="Géneros">
      <div className="mask-fade-x overflow-hidden">
        <ul className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
          {items.map(({ key, g, n, hidden }) => (
            <li key={key} className="flex items-center gap-10" aria-hidden={hidden}>
              <span className="font-display whitespace-nowrap text-xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                {g}
              </span>
              <Leaf className="size-6 shrink-0 rotate-45" color={colors[n % colors.length]} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
