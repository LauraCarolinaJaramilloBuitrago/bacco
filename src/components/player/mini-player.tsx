import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { PlayPauseIcon, VolumeIcon } from "@/components/ui/animated-state-icons";
import { ArrowIcon, SkipIcon } from "@/components/ui/jungle-icons";
import { RadialCommandRing, type RingCommand } from "@/components/ui/radial-command-ring";
import { ACCENT_HEX } from "@/data/artist";
import { cn } from "@/lib/utils";
import { usePlayer } from "./player-context";

/** Botón de música de la barra superior: vinilo + anillo radial de comandos */
export function MiniPlayer({ className }: { className?: string }) {
  const p = usePlayer();
  const c = ACCENT_HEX[p.track.accent];
  const status = p.loaded ? (p.paused ? "En pausa" : "Sonando") : "Listo para sonar";
  const [ringOpen, setRingOpen] = useState(false);

  const commands: RingCommand[] = [
    { id: "prev", label: "Set anterior", icon: <SkipIcon dir="prev" size={18} />, onSelect: p.prev, accent: ACCENT_HEX.river },
    {
      id: "toggle",
      label: p.isPlaying ? "Pausar" : "Reproducir",
      icon: <PlayPauseIcon size={22} color="#fff" state={p.isPlaying} />,
      onSelect: p.toggle,
      active: p.isPlaying,
      accent: ACCENT_HEX.leaf,
    },
    { id: "next", label: "Siguiente set", icon: <SkipIcon dir="next" size={18} />, onSelect: p.next, accent: ACCENT_HEX.river },
    {
      id: "mute",
      label: p.muted ? "Activar sonido" : "Silenciar",
      icon: <VolumeIcon size={22} state={p.muted} />,
      onSelect: p.toggleMute,
      active: p.muted,
      accent: ACCENT_HEX.heliconia,
    },
    {
      id: "go",
      label: "Ver sets",
      icon: <ArrowIcon dir="down" size={18} />,
      onSelect: () => document.getElementById("musica")?.scrollIntoView({ behavior: "smooth" }),
      closeOnSelect: true,
      accent: ACCENT_HEX.firefly,
    },
  ];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Título (pantallas grandes) */}
      <div
        className={cn("hidden w-[160px] min-w-0 text-right transition-opacity duration-200 xl:block", ringOpen && "opacity-0")}
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={p.track.id + status}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="truncate text-[12px] font-bold leading-tight text-white"
          >
            {p.track.title}
            <span className="block text-[11px] font-medium">{status}</span>
          </m.p>
        </AnimatePresence>
      </div>

      <RadialCommandRing
        commands={commands}
        onOpenChange={setRingOpen}
        triggerLabel={`Controles del set: ${p.track.title}, ${status}`}
        startAngle={185}
        endAngle={95}
        glow={c}
        trigger={
          <span className="relative block size-11">
            {/* Vinilo con la portada: gira mientras suena */}
            <span
              className="animate-vinyl absolute inset-0 overflow-hidden rounded-full ring-2 ring-white/20"
              style={{ animationPlayState: p.isPlaying ? "running" : "paused" }}
            >
              <img key={p.track.id} src={p.track.cover} alt="" className="size-full object-cover" />
              <span className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,transparent_0_3px,rgb(0_0_0/0.18)_3px_4px)]" />
            </span>
            <span aria-hidden className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-1 ring-white/50" />
            {/* Indicador de estado */}
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-leaf-deep ring-2 ring-ink"
            >
              {p.isPlaying ? (
                <span className="flex h-2.5 items-end gap-[2px]">
                  {[0, 0.2, 0.35].map((d) => (
                    <span key={d} className="h-full w-[2px] origin-bottom animate-eq rounded-full bg-white" style={{ animationDelay: `${d}s` }} />
                  ))}
                </span>
              ) : p.muted ? (
                <VolumeIcon size={13} state color="#fff" />
              ) : (
                <PlayPauseIcon size={12} color="#fff" state={false} />
              )}
            </span>
            {/* Pulso cuando suena */}
            {p.isPlaying && (
              <span aria-hidden className="animate-pulse-ring absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${c}` }} />
            )}
          </span>
        }
        caption={
          <span className="glass inline-block rounded-2xl px-3 py-2 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white">{status}</span>
            <span className="font-display mt-0.5 block text-[13px] font-extrabold uppercase text-white">{p.track.title}</span>
          </span>
        }
      />
    </div>
  );
}
