import { SilkShader } from "@/components/ui/silk-shader";
import { usePlayer } from "@/components/player/player-context";

/**
 * Fondo fijo de todo el sitio: humo de seda verde que nunca se detiene.
 * - Fijo: el scroll no lo mueve.
 * - El pulso de BPM solo existe mientras suena un set (entra y sale suave al dar play/pausa).
 * - Remolino suave bajo el mouse o el dedo mientras se mueven.
 */
export function SmokeBackdrop() {
  const { isPlaying } = usePlayer();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-ink">
      <SilkShader
        // Paleta simétrica: el verde cae en las transiciones = hilos de humo sobre tinta
        colors={["#040a06", "#08190e", "#145a2c", "#2aa653", "#145a2c", "#08190e", "#040a06"]}
        energy={isPlaying ? 1 : 0}
        bpm={69}
        pulse={0}
        scroll={false}
        scale={2.6}
        resolutionScale={0.5}
        maxDpr={1.5}
      />
      {/* Velo oscuro uniforme: todo el fondo tiene la misma opacidad en cada sección */}
      <div className="absolute inset-0 bg-ink/70" />
    </div>
  );
}
