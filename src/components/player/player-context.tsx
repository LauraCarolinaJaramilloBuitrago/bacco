import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TRACKS, type Track } from "@/data/artist";

/**
 * Reproductor global: la sección Música monta el iframe (YouTube o SoundCloud)
 * y el mini reproductor de la barra superior lo controla por postMessage.
 */

type Cmd = "play" | "pause" | "mute" | "unmute";

interface PlayerCtx {
  index: number;
  track: Track;
  /** El iframe del set está montado */
  loaded: boolean;
  paused: boolean;
  muted: boolean;
  isPlaying: boolean;
  play: (i?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  toggleMute: () => void;
  frameRef: (el: HTMLIFrameElement | null) => void;
  onFrameLoad: () => void;
  embedUrl: (t: Track) => string;
}

const Ctx = createContext<PlayerCtx | null>(null);

const YT_FUNC: Record<Cmd, string> = { play: "playVideo", pause: "pauseVideo", mute: "mute", unmute: "unMute" };

function parse(data: unknown): Record<string, unknown> | null {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const track = TRACKS[index];
  const n = TRACKS.length;

  // refs para usar valores actuales dentro de listeners
  const live = useRef({ track, muted });
  useLayoutEffect(() => {
    live.current = { track, muted };
  });

  const send = useCallback((cmd: Cmd) => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    const t = live.current.track;
    if (t.kind === "youtube") {
      win.postMessage(JSON.stringify({ event: "command", func: YT_FUNC[cmd], args: [] }), "*");
    } else if (cmd === "play" || cmd === "pause") {
      win.postMessage(JSON.stringify({ method: cmd }), "https://w.soundcloud.com");
    } else {
      win.postMessage(JSON.stringify({ method: "setVolume", value: cmd === "mute" ? 0 : 100 }), "https://w.soundcloud.com");
    }
  }, []);

  const embedUrl = useCallback((t: Track) => {
    if (t.kind === "youtube") {
      const origin = encodeURIComponent(window.location.origin);
      return `https://www.youtube-nocookie.com/embed/${t.src}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}${live.current.muted ? "&mute=1" : ""}`;
    }
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(t.src)}&color=%2317723a&auto_play=true&visual=true&show_comments=false`;
  }, []);

  const play = useCallback(
    (i?: number) => {
      if (i !== undefined && i !== index) {
        setIndex(i);
        setLoaded(true);
        setPaused(false);
        return;
      }
      if (!loaded) {
        setLoaded(true);
        setPaused(false);
        return;
      }
      send("play");
      setPaused(false);
    },
    [index, loaded, send],
  );

  const toggle = useCallback(() => {
    if (!loaded) return play();
    if (paused) {
      send("play");
      setPaused(false);
    } else {
      send("pause");
      setPaused(true);
    }
  }, [loaded, paused, play, send]);

  const step = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + n) % n);
      setLoaded(true);
      setPaused(false);
    },
    [n],
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const toggleMute = useCallback(() => {
    const m = live.current.muted;
    send(m ? "unmute" : "mute");
    setMuted(!m);
  }, [send]);

  const frameRef = useCallback((el: HTMLIFrameElement | null) => {
    frame.current = el;
  }, []);

  // Al cargar el iframe: pedir eventos de estado y aplicar silencio si toca
  const onFrameLoad = useCallback(() => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    const t = live.current.track;
    if (t.kind === "youtube") {
      win.postMessage(JSON.stringify({ event: "listening", id: "bacco", channel: "widget" }), "*");
    } else {
      for (const ev of ["play", "pause", "finish"]) {
        win.postMessage(JSON.stringify({ method: "addEventListener", value: ev }), "https://w.soundcloud.com");
      }
      if (live.current.muted) window.setTimeout(() => send("mute"), 600);
    }
  }, [send]);

  // Marca el <html> mientras suena: el CSS apaga los blur caros sobre el fondo animado
  const isPlaying = loaded && !paused;
  useEffect(() => {
    const root = document.documentElement;
    if (isPlaying) root.dataset.playing = "";
    else delete root.dataset.playing;
    return () => {
      delete root.dataset.playing;
    };
  }, [isPlaying]);

  // Escuchar al reproductor: si se pausa/termina desde el propio iframe, sincronizar
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      // YouTube manda un infoDelivery con el tiempo cada ~250 ms: solo se parsea lo que cambia estado
      if (
        typeof e.data === "string" &&
        !e.data.includes("playerState") &&
        !e.data.includes("onStateChange") &&
        !e.data.includes('"muted"') &&
        !e.data.includes("method") &&
        !e.data.includes("finish")
      )
        return;
      const d = parse(e.data);
      if (!d) return;
      // YouTube
      let state: number | undefined;
      if (d.event === "onStateChange" && typeof d.info === "number") state = d.info;
      if (d.event === "infoDelivery" && d.info && typeof d.info === "object") {
        const info = d.info as { playerState?: number; muted?: boolean };
        if (typeof info.playerState === "number") state = info.playerState;
        if (typeof info.muted === "boolean") setMuted(info.muted);
      }
      if (state === 1) setPaused(false);
      if (state === 2) setPaused(true);
      if (state === 0) step(1);
      // SoundCloud
      if (d.method === "play") setPaused(false);
      if (d.method === "pause") setPaused(true);
      if (d.method === "finish") step(1);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [step]);

  const value = useMemo<PlayerCtx>(
    () => ({
      index,
      track,
      loaded,
      paused,
      muted,
      isPlaying,
      play,
      toggle,
      next,
      prev,
      toggleMute,
      frameRef,
      onFrameLoad,
      embedUrl,
    }),
    [index, track, loaded, paused, muted, isPlaying, play, toggle, next, prev, toggleMute, frameRef, onFrameLoad, embedUrl],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer debe usarse dentro de <PlayerProvider>");
  return c;
}
