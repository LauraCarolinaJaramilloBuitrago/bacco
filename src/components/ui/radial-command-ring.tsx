import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface RingCommand {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  /** Resalta el comando (ej. silencio activo) */
  active?: boolean;
  /** Cierra el anillo al elegirlo */
  closeOnSelect?: boolean;
  /** Color de acento del comando */
  accent?: string;
}

interface RadialCommandRingProps {
  commands: RingCommand[];
  /** Contenido del botón central */
  trigger: React.ReactNode;
  triggerLabel: string;
  /** Ángulo inicial y final del abanico en grados (0 = derecha, 90 = abajo) */
  startAngle?: number;
  endAngle?: number;
  radius?: number;
  itemSize?: number;
  className?: string;
  /** Contenido extra visible con el anillo abierto (ej. título del set) */
  caption?: React.ReactNode;
  glow?: string;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Anillo radial de comandos: un botón central que despliega acciones en abanico
 * sobre un aro giratorio. Teclado: Enter/Espacio abre, flechas recorren, Esc cierra.
 */
export function RadialCommandRing({
  commands,
  trigger,
  triggerLabel,
  startAngle = 95,
  endAngle = 185,
  radius = 86,
  itemSize = 44,
  className,
  caption,
  glow = "#3fbf5a",
  onOpenChange,
}: RadialCommandRingProps) {
  const [open, setOpen] = useState(false);
  const changeOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const menuId = useId();

  // Cerrar al tocar fuera o con Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) changeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        changeOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, changeOpen]);

  const n = commands.length;
  const pos = (i: number) => {
    const a = ((startAngle + ((endAngle - startAngle) * i) / Math.max(1, n - 1)) * Math.PI) / 180;
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
  };

  const onItemKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    items.current[(i + dir + n) % n]?.focus();
  };

  const ring = radius * 2 + itemSize;

  return (
    <div ref={root} className={cn("relative", className)}>
      {/* Aro decorativo giratorio */}
      <AnimatePresence>
        {open && (
          <m.svg
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10"
            width={ring}
            height={ring}
            viewBox={`0 0 ${ring} ${ring}`}
            style={{ marginLeft: -ring / 2, marginTop: -ring / 2 }}
            initial={{ opacity: 0, scale: 0.3, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.3, rotate: 60 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <defs>
              <radialGradient id={`${menuId}-g`}>
                <stop offset="55%" stopColor="#040a06" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#040a06" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={ring / 2} cy={ring / 2} r={radius + itemSize / 2 + 6} fill={`url(#${menuId}-g)`} />
            <m.circle
              cx={ring / 2}
              cy={ring / 2}
              r={radius}
              fill="none"
              stroke={glow}
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeDasharray="2 7"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "50% 50%" }}
            />
            <circle cx={ring / 2} cy={ring / 2} r={radius - 14} fill="none" stroke="#fff" strokeOpacity={0.08} />
          </m.svg>
        )}
      </AnimatePresence>

      {/* Botón central */}
      <m.button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => changeOpen(!open)}
        whileTap={{ scale: 0.92 }}
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{ boxShadow: open ? `0 0 0 2px ${glow}, 0 0 30px -4px ${glow}` : undefined }}
      >
        {trigger}
      </m.button>

      {/* Comandos en abanico */}
      <AnimatePresence>
        {open && (
          <m.ul id={menuId} role="menu" aria-label={triggerLabel} className="absolute left-1/2 top-1/2 z-20 size-0">
            {commands.map((c, i) => {
              const { x, y } = pos(i);
              return (
                <m.li
                  key={c.id}
                  role="none"
                  className="absolute"
                  style={{ left: -itemSize / 2, top: -itemSize / 2 }}
                  initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                  animate={{ x, y, scale: 1, opacity: 1 }}
                  exit={{ x: 0, y: 0, scale: 0.2, opacity: 0, transition: { duration: 0.18, delay: (n - 1 - i) * 0.02 } }}
                  transition={{ type: "spring", stiffness: 420, damping: 24, delay: i * 0.04 }}
                >
                  <button
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    role={c.active === undefined ? "menuitem" : "menuitemcheckbox"}
                    type="button"
                    aria-label={c.label}
                    aria-checked={c.active}
                    autoFocus={i === 0}
                    onKeyDown={(e) => onItemKey(e, i)}
                    onClick={() => {
                      c.onSelect();
                      if (c.closeOnSelect) changeOpen(false);
                    }}
                    className="group/ring glass relative flex items-center justify-center rounded-full text-white transition duration-300 hover:scale-110 active:scale-95"
                    style={{
                      width: itemSize,
                      height: itemSize,
                      boxShadow: c.active
                        ? `inset 0 0 0 1.5px ${c.accent ?? glow}, 0 0 22px -4px ${c.accent ?? glow}`
                        : `inset 0 0 0 1px ${(c.accent ?? glow) + "55"}`,
                      background: c.active ? `${c.accent ?? glow}33` : undefined,
                    }}
                  >
                    {c.icon}
                    {/* Etiqueta */}
                    <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover/ring:opacity-100 group-focus-visible/ring:opacity-100">
                      {c.label}
                    </span>
                  </button>
                </m.li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && caption && (
          <m.div
            className="pointer-events-none absolute right-0 top-full z-20 mt-[calc(var(--ring-r)+28px)] w-max max-w-[220px] text-right"
            style={{ "--ring-r": `${radius}px` } as React.CSSProperties}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ delay: 0.15 }}
          >
            {caption}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
