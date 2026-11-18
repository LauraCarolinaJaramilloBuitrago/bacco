import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * "Silk" — shader de flujo (21st.dev Shader Builder) en WebGL1 puro.
 * Reactivo: remolino bajo el puntero mientras se mueve y `energy` (0–1)
 * acelera y agita el flujo con suavidad (ej. cuando suena un set).
 */

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
uniform vec4 u_scene;
uniform vec4 u_shape;
uniform vec4 u_surface;
uniform vec4 u_finish;
uniform vec4 u_transform;
uniform vec4 u_space;
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1], smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec2 q = p * 1.6;
  float amp = 0.25 + u_intensity * 0.85;
  for (float i = 1.0; i < 5.0; i += 1.0) {
    q.x += amp / i * cos(i * 2.4 * q.y + t * 0.8 + u_seed);
    q.y += amp / i * cos(i * 1.7 * q.x + t * 0.6);
  }
  return palette(0.5 + 0.5 * sin(q.x + q.y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float cursorMask = 0.0;

  if (u_cursorPresence > 0.001) {
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    if (u_cursorEffect < 0.5) {
      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;
    } else {
      float cursorDistance = length(cursorDelta);
      vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);
      cursorMask = u_cursorPresence * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));
      if (u_cursorEffect < 1.5) {
        p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;
      } else if (u_cursorEffect < 2.5) {
        float cursorAngle = cursorMask * u_cursorStrength * 2.2;
        float cc = cos(cursorAngle), cs = sin(cursorAngle);
        p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
      } else if (u_cursorEffect < 3.5) {
        float ripple = sin(cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);
        p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;
      }
    }
  }

  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  if (u_warp > 0.0) {
    p += u_warp * (vec2(fbm(p * u_detail + u_seed), fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_cursorPresence > 0.001 && u_cursorEffect > 3.5)
    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;
  if (u_grain > 0.0001)
    col += (grainHash(gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

type RGB = [number, number, number];

function hex(h: string): RGB {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0, 0, 0];
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export interface SilkShaderProps {
  /** Colores de bajo a alto (2–8). Por defecto: tinta → canopia → hoja profunda → hoja */
  colors?: string[];
  /** 0–1: agita y acelera el flujo (transición suave) */
  energy?: number;
  /** Remolino bajo el puntero mientras se mueve */
  cursor?: boolean;
  /** Pulso de bajo constante (bombo a negras) */
  bpm?: number;
  /** Fuerza del pulso en reposo (0–1); con energy = 1 llega a 1 */
  pulse?: number;
  /** Al hacer scroll el humo se desplaza, gira y se agita con la velocidad */
  scroll?: boolean;
  /** Zoom del flujo: más alto = más volutas en pantalla (receta: 1.26) */
  scale?: number;
  /** Tope de devicePixelRatio (máx. 2) */
  maxDpr?: number;
  /** Escala de resolución interna (el flujo es suave: 0.5–0.75 rinde bien) */
  resolutionScale?: number;
  /** Tope de cuadros por segundo (menos GPU/CPU; el movimiento sigue en tiempo real) */
  maxFps?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SilkShader({
  colors = ["#040a06", "#0a1a10", "#17723a", "#3fbf5a"],
  energy = 0,
  cursor = true,
  bpm = 124,
  pulse = 0.35,
  scroll = false,
  scale = 1.26,
  maxDpr = 2,
  resolutionScale = 1,
  maxFps = 60,
  className,
  style,
}: SilkShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ colors, energy, cursor, bpm, pulse, scroll, scale, maxFps });
  useLayoutEffect(() => {
    live.current = { colors, energy, cursor, bpm, pulse, scroll, scale, maxFps };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Triángulo que cubre toda la pantalla
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      colors: u("u_colors"),
      scene: u("u_scene"),
      shape: u("u_shape"),
      surface: u("u_surface"),
      finish: u("u_finish"),
      transform: u("u_transform"),
      space: u("u_space"),
      cursor: u("u_cursor"),
    };

    // Valor fijo de la receta
    gl.uniform4f(U.finish, 0.0, 0.0, 0.0, 0.0); // sin grano: nada de puntitos en el fondo

    // Movimiento reducido: no se congela, va más lento y con pulso suave
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.4 : 1;

    const resize = () => {
      const s = Math.min(window.devicePixelRatio || 1, Math.min(maxDpr, 2)) * resolutionScale;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * s));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    ro.observe(canvas);
    resize();

    // Puntero: posición normalizada -1..1 en el canvas, presencia que se apaga al quedarse quieto
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, presence: 0, lastMove: -1e9 };
    const track = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      ptr.tx = ((cx - r.left) / r.width) * 2 - 1;
      ptr.ty = -(((cy - r.top) / r.height) * 2 - 1);
      ptr.lastMove = performance.now();
    };
    const onMove = (e: PointerEvent) => track(e.clientX, e.clientY);
    // Dedo: pointermove se cancela cuando el navegador toma el scroll; touchmove sigue llegando
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) track(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    // Tiempo propio: la velocidad cambia sin saltos
    let t = 0;
    let beats = 0;
    let last = performance.now();
    let e = live.current.energy;
    // Scroll: posición con retraso suave + velocidad normalizada 0–1
    const sc = { y: window.scrollY, off: window.scrollY, v: 0 };

    let palKey = "";
    let pal: RGB[] = [];
    const flat = new Float32Array(24);

    const draw = (dt: number) => {
      const L = live.current;
      if (L.scroll && dt > 0) {
        const y = window.scrollY;
        const vel = Math.min(Math.abs(y - sc.y) / dt / 1800, 1);
        sc.y = y;
        sc.v = lerp(sc.v, vel, 1 - Math.exp(-dt * (vel > sc.v ? 10 : 1.8)));
        sc.off = lerp(sc.off, y, 1 - Math.exp(-dt * 3));
      } else if (!L.scroll) {
        sc.v = 0;
      }
      // El scroll rápido agita el humo igual que un set sonando
      e = lerp(e, Math.max(L.energy, sc.v), 1 - Math.exp(-dt * 2.2));

      // Bombo: golpe seco al inicio de cada negra y caída exponencial
      beats += (dt * L.bpm) / 60;
      const phase = beats % 1;
      const amt = lerp(L.pulse, 1, e);
      const kick = Math.exp(-phase * 7) * amt * (calm < 1 ? 0.35 : 1);

      // El golpe también empuja el flujo hacia adelante
      t += dt * 0.76 * calm * (1 + e * 1.4 + kick * 1.6);

      // Paleta: solo se recalcula y se sube a la GPU cuando cambia
      const palNow = L.colors.join();
      if (palNow !== palKey) {
        palKey = palNow;
        pal = L.colors.slice(0, 8).map(hex);
        flat.fill(0);
        pal.forEach((c, i) => flat.set(c, i * 3));
        gl.uniform3fv(U.colors, flat);
      }

      const now = performance.now();
      const moving = L.cursor && now - ptr.lastMove < 900 ? 1 : 0;
      ptr.presence = lerp(ptr.presence, moving, 1 - Math.exp(-dt * (moving ? 6 : 1.5)));
      ptr.x = lerp(ptr.x, ptr.tx, 1 - Math.exp(-dt * 4));
      ptr.y = lerp(ptr.y, ptr.ty, 1 - Math.exp(-dt * 4));

      gl.uniform4f(U.scene, canvas.width, canvas.height, t, pal.length);
      gl.uniform4f(U.shape, L.scale * (1 - e * 0.1 - kick * 0.08),0.28 + e * 0.4 + kick * 0.22, 0.5, 0.0);
      gl.uniform4f(U.surface, 2.4, 1.11 + kick * 0.15, kick * 0.07, 1.0);
      // Al bajar: el humo sube (parallax) y gira despacio
      const so = L.scroll ? sc.off : 0;
      gl.uniform4f(U.transform, 1581.0, so * 0.00018, e * 0.35, 0.0);
      gl.uniform4f(U.space, 0.0, -so * 0.0009, ptr.x, ptr.y);
      gl.uniform4f(U.cursor, ptr.presence, 2.0, 0.65 + e * 0.35, 0.46);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let onScreen = true;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // Tope de fps: se salta el cuadro si aún no toca (el tiempo acumulado se conserva)
      if (now - last < 1000 / live.current.maxFps - 2) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      draw(dt);
    };
    const start = () => {
      if (raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);

    draw(0);
    start();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [maxDpr, resolutionScale]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} style={style} />;
}
