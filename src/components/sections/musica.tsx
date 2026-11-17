import { useState } from "react";
import { usePlayer } from "@/components/player/player-context";
import { AnimatePresence, m } from "motion/react";
import { PlayPauseIcon } from "@/components/ui/animated-state-icons";
import { ArrowIcon, SoundCloudIcon, YouTubeIcon } from "@/components/ui/jungle-icons";
import { ACCENT_HEX, LINKS, TRACKS, type Track } from "@/data/artist";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Eyebrow, Reveal, SectionTitle } from "./shared";

/** El src se fija al montar: silenciar/pausar no recarga el iframe */
function SetFrame({ track }: { track: Track }) {
  const { embedUrl, frameRef, onFrameLoad } = usePlayer();
  const [src] = useState(() => embedUrl(track));
  return (
    <m.iframe
      ref={frameRef}
      onLoad={onFrameLoad}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      src={src}
      title={`Reproductor: ${track.title}`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className="absolute inset-0 h-full w-full"
    />
  );
}

function Eq({ on, color }: { on: boolean; color: string }) {
  return (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden>
      {[0, 0.2, 0.4, 0.1].map((d, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-bottom rounded-full", on ? "animate-eq" : "scale-y-[0.3]")}
          style={{ height: "100%", background: color, animationDelay: `${d}s` }}
        />
      ))}
    </span>
  );
}

export function Musica() {
  const player = usePlayer();
  const current = player.track;
  const playing = player.loaded;

  // Clic en el set activo = pausa / reanuda; en otro = cambia de set
  const pick = (i: number) => {
    if (i === player.index && player.loaded) player.toggle();
    else player.play(i);
  };

  const c = ACCENT_HEX[current.accent];

  return (
    <section id="musica" className="relative px-4 py-28 sm:px-6 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <Eyebrow accent="firefly">Música</Eyebrow>
            <SectionTitle className="mt-5">Frecuencias</SectionTitle>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap gap-3">
            <a href={LINKS.youtube} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <YouTubeIcon size={20} /> YouTube
            </a>
            <a href={LINKS.soundcloud} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <SoundCloudIcon size={20} /> SoundCloud
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Escenario / reproductor */}
          <Reveal>
            <div
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-canopy transition-shadow duration-700"
              style={{ boxShadow: `0 0 0 1px ${c}33, 0 40px 120px -40px ${c}` }}
            >
              <div className={cn("relative w-full", current.kind === "soundcloud" && playing ? "aspect-[4/3] sm:aspect-video" : "aspect-video")}>
                <AnimatePresence mode="wait">
                  {playing ? (
                    <SetFrame key={`f-${current.id}`} track={current} />
                  ) : (
                    <m.button
                      key={`c-${current.id}`}
                      type="button"
                      onClick={() => player.play()}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="group absolute inset-0 block h-full w-full"
                      aria-label={`Reproducir ${current.title}`}
                    >
                      <img src={current.cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                      <span
                        className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-leaf-deep transition duration-500 group-hover:scale-110 sm:size-24"
                        style={{ boxShadow: `0 0 0 10px ${c}22, 0 0 60px ${c}` }}
                      >
                        <PlayPauseIcon size={44} color="#fff" state={false} />
                      </span>
                      <span className="absolute bottom-5 left-5 right-5 text-left sm:bottom-7 sm:left-7">
                        <span className="block text-xs font-bold uppercase tracking-[0.25em] text-white">{current.label}</span>
                        <span className="font-display mt-1.5 block text-xl font-extrabold uppercase text-white sm:mt-2 sm:text-3xl">{current.title}</span>
                      </span>
                    </m.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>

          {/* Lista */}
          <Reveal delay={0.1}>
            <ul className="flex h-full flex-col gap-3" aria-label="Sets y tracks">
              {TRACKS.map((t, i) => {
                const on = t.id === current.id;
                const sounding = on && player.isPlaying;
                const tc = ACCENT_HEX[t.accent];
                return (
                  <li key={t.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-pressed={sounding}
                      aria-label={sounding ? `Pausar ${t.title}` : `Reproducir ${t.title}`}
                      className={cn(
                        "group relative flex h-full w-full items-center gap-4 overflow-hidden rounded-[22px] p-3 text-left transition duration-500",
                        on ? "bg-moss" : "glass hover:bg-moss/70",
                      )}
                      style={{ boxShadow: on ? `inset 0 0 0 1.5px ${tc}, 0 0 40px -12px ${tc}` : undefined }}
                    >
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-[72px]">
                        <img src={t.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
                          <PlayPauseIcon size={26} color="#fff" state={sounding} />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                          {String(i + 1).padStart(2, "0")} · {t.label}
                        </span>
                        <span className="font-display mt-1 block truncate text-[13px] font-bold uppercase text-white sm:text-[15px]">{t.title}</span>
                      </span>
                      <Eq on={sounding} color={tc} />
                    </button>
                  </li>
                );
              })}
              <li>
                <a
                  href={current.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-end gap-2 px-2 pt-1 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-river"
                >
                  Abrir “{current.title}” en {current.kind === "youtube" ? "YouTube" : "SoundCloud"}
                  <ArrowIcon dir="up-right" size={16} />
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
