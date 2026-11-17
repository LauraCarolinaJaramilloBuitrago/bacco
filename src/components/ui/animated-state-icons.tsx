import { useEffect, useRef, useState } from "react";
// `motion` es el paquete actual de framer-motion: misma API, ya instalado en el proyecto.
import { useReducedMotion } from "motion/react";
import { Download, Menu, Pause, Play, Send, Volume2, VolumeX, X, Check, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * trigger:
 *  - "loop"  → alterna solo cada `duration` ms (comportamiento original de demo)
 *  - "hover" → se activa cuando el puntero/foco está sobre el enlace, botón o [data-hot] que lo contiene
 *  - "none"  → estático
 * state: si se pasa, manda sobre `trigger` (ícono controlado por estado real de la UI).
 */
export type IconTrigger = "loop" | "hover" | "none";

export interface StateIconProps {
  size?: number;
  color?: string;
  className?: string;
  duration?: number;
  state?: boolean;
  trigger?: IconTrigger;
  /** Invierte el estado (ej. volumen: ondas visibles en hover) */
  invert?: boolean;
}

export function useIconState<T extends Element>({
  state,
  duration = 2000,
  trigger = "loop",
  invert = false,
}: Pick<StateIconProps, "state" | "duration" | "trigger" | "invert">) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const [auto, setAuto] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (state !== undefined || trigger !== "loop" || reduce) return;
    const id = setInterval(() => setAuto((v) => !v), duration);
    return () => clearInterval(id);
  }, [state, trigger, duration, reduce]);

  useEffect(() => {
    if (state !== undefined || trigger !== "hover") return;
    const host = ref.current?.closest("a,button,[data-hot]") ?? ref.current?.parentElement;
    if (!host) return;
    const on = () => setHover(true);
    const off = () => setHover(false);
    host.addEventListener("pointerenter", on);
    host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", off);
    return () => {
      host.removeEventListener("pointerenter", on);
      host.removeEventListener("pointerleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", off);
    };
  }, [state, trigger]);

  const raw = state ?? (trigger === "hover" ? hover : trigger === "loop" ? auto : false);
  return [invert ? !raw : raw, ref] as const;
}

/* Íconos con estado real de la UI, dibujados con Lucide */
const lu = (p: StateIconProps): LucideProps => ({
  size: p.size ?? 24,
  color: p.color ?? "currentColor",
  strokeWidth: 2,
  "aria-hidden": true,
  className: cn("shrink-0", p.className),
});

/** state = está sonando → muestra pausa */
export function PlayPauseIcon(props: StateIconProps) {
  const [playing, ref] = useIconState<SVGSVGElement>({ ...props, duration: props.duration ?? 2400 });
  const I = playing ? Pause : Play;
  return <I ref={ref} {...lu(props)} fill={props.color ?? "currentColor"} />;
}

/** state = silenciado */
export function VolumeIcon(props: StateIconProps) {
  const [muted, ref] = useIconState<SVGSVGElement>({ ...props, duration: props.duration ?? 2400 });
  const I = muted ? VolumeX : Volume2;
  return <I ref={ref} {...lu(props)} />;
}

/** state = abierto → cruz */
export function MenuCloseIcon(props: StateIconProps) {
  const [open, ref] = useIconState<SVGSVGElement>({ ...props, duration: props.duration ?? 2400 });
  const I = open ? X : Menu;
  return <I ref={ref} {...lu(props)} />;
}

/** state = descargado → check */
export function DownloadDoneIcon(props: StateIconProps) {
  const [done, ref] = useIconState<SVGSVGElement>({ ...props, duration: props.duration ?? 2400 });
  const I = done ? Check : Download;
  return <I ref={ref} {...lu(props)} />;
}

export function SendIcon(props: StateIconProps) {
  return <Send {...lu(props)} />;
}
