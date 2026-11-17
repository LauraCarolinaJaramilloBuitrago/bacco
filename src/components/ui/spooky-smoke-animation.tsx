import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Humo procedural (WebGL2, fbm). Las zonas claras del humo se tiñen con `smokeColor`.
 * Adaptado de "spooky-smoke-animation": se dimensiona al contenedor (no a la ventana),
 * acota el DPR, se pausa fuera de pantalla y respeta prefers-reduced-motion.
 */

const FRAGMENT = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;
uniform float u_floor;

#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)

float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}

void main(){
  vec2 uv=(FC-.5*R)/R.y;
  vec3 col=vec3(1);
  uv.x+=.25;
  uv*=vec2(2,1);

  float n=fbm(uv*.28-vec2(T*.01,0));
  n=noise(uv*3.+n*2.);

  col.r-=fbm(uv+vec2(0,T*.015)+n);
  col.g-=fbm(uv*1.003+vec2(0,T*.015)+n+.003);
  col.b-=fbm(uv*1.006+vec2(0,T*.015)+n+.006);

  // Tiñe las zonas más claras del humo con el color elegido
  col=mix(col,u_color,dot(col,vec3(.21,.71,.07)));

  col=mix(vec3(u_floor),col,min(time*.1,1.));
  col=clamp(col,u_floor,1.);
  O=vec4(col,1);
}`;

const VERTEX = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : null;
}

class Renderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private loc: { resolution: WebGLUniformLocation | null; time: WebGLUniformLocation | null; color: WebGLUniformLocation | null; floor: WebGLUniformLocation | null } = {
    resolution: null,
    time: null,
    color: null,
    floor: null,
  };
  color: RGB = [0.5, 0.5, 0.5];
  floor = 0.08;

  constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
  ) {
    this.gl = gl;
    this.setup();
  }

  private compile(type: number, src: string) {
    const gl = this.gl;
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(`Shader compilation error: ${gl.getShaderInfoLog(s)}`);
    return s;
  }

  private setup() {
    const gl = this.gl;
    this.vs = this.compile(gl.VERTEX_SHADER, VERTEX);
    this.fs = this.compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const p = gl.createProgram();
    if (!this.vs || !this.fs || !p) return;
    gl.attachShader(p, this.vs);
    gl.attachShader(p, this.fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(`Program linking error: ${gl.getProgramInfoLog(p)}`);
      return;
    }
    this.program = p;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(p, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    this.loc = {
      resolution: gl.getUniformLocation(p, "resolution"),
      time: gl.getUniformLocation(p, "time"),
      color: gl.getUniformLocation(p, "u_color"),
      floor: gl.getUniformLocation(p, "u_floor"),
    };
  }

  resize(w: number, h: number) {
    this.canvas.width = Math.max(1, Math.round(w));
    this.canvas.height = Math.max(1, Math.round(h));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  render(seconds: number) {
    const { gl, program, canvas, loc } = this;
    if (!program) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.uniform2f(loc.resolution, canvas.width, canvas.height);
    gl.uniform1f(loc.time, seconds);
    gl.uniform3fv(loc.color, this.color);
    gl.uniform1f(loc.floor, this.floor);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    const { gl, program, vs, fs, buffer } = this;
    if (buffer) gl.deleteBuffer(buffer);
    if (program) {
      if (vs) gl.detachShader(program, vs);
      if (fs) gl.detachShader(program, fs);
      gl.deleteProgram(program);
    }
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    this.program = null;
  }
}

export interface SmokeBackgroundProps {
  /** Color del humo, ej. "#3fbf5a" */
  smokeColor?: string;
  /** Nivel mínimo de gris del fondo (0 = negro puro, ideal con mix-blend-screen). Original: 0.08 */
  floor?: number;
  /** Escala de resolución interna (el humo es suave: 0.5 rinde bien) */
  resolutionScale?: number;
  /** Tope de devicePixelRatio */
  maxDpr?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SmokeBackground({
  smokeColor = "#808080",
  floor = 0.08,
  resolutionScale = 1,
  maxDpr = 2,
  className,
  style,
}: SmokeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, powerPreference: "low-power" });
    if (!gl) return; // sin WebGL2: el contenedor queda transparente
    const r = new Renderer(canvas, gl);
    r.color = hexToRgb(smokeColor) ?? r.color;
    r.floor = floor;
    rendererRef.current = r;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = () => Math.min(window.devicePixelRatio || 1, maxDpr) * resolutionScale;
    const resize = () => {
      r.resize(canvas.clientWidth * scale(), canvas.clientHeight * scale());
      if (reduce) r.render(20); // cuadro fijo, ya revelado
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      r.render(now * 1e-3);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduce && visible && !raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    start();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      r.dispose();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDpr, resolutionScale]);

  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.color = hexToRgb(smokeColor) ?? r.color;
    r.floor = floor;
  }, [smokeColor, floor]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} style={style} />;
}
