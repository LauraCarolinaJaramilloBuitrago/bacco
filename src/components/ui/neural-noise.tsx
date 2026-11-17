import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type RGB = [number, number, number];

interface NeuralNoiseProps {
  /** Color RGB normalizado 0–1 */
  color?: RGB;
  opacity?: number;
  speed?: number;
  /** Tope de devicePixelRatio: el shader es pesado, 1–1.5 rinde bien en móviles */
  maxDpr?: number;
  className?: string;
}

const VS = `
  precision mediump float;
  varying vec2 vUv;
  attribute vec2 a_position;
  void main() {
    vUv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_ratio;
  uniform vec2 u_pointer_position;
  uniform vec3 u_color;
  uniform float u_speed;
  vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
  }
  float neuro_shape(vec2 uv, float t, float p) {
    vec2 sine_acc = vec2(0.0);
    vec2 res = vec2(0.0);
    float scale = 8.0;
    for (int j = 0; j < 15; j++) {
      uv = rotate(uv, 1.0);
      sine_acc = rotate(sine_acc, 1.0);
      vec2 layer = uv * scale + float(j) + sine_acc - t;
      sine_acc += sin(layer) + 2.4 * p;
      res += (0.5 + 0.5 * cos(layer)) / scale;
      scale *= 1.2;
    }
    return res.x + res.y;
  }
  void main() {
    vec2 uv = 0.5 * vUv;
    uv.x *= u_ratio;
    vec2 pointer = vUv - u_pointer_position;
    pointer.x *= u_ratio;
    float p = clamp(length(pointer), 0.0, 1.0);
    p = 0.5 * pow(1.0 - p, 2.0);
    float t = u_speed * u_time;
    vec3 col = vec3(0.0);
    float noise = neuro_shape(uv, t, p);
    noise = 1.2 * pow(noise, 3.0);
    noise += pow(noise, 10.0);
    noise = max(0.0, noise - 0.5);
    noise *= (1.0 - length(vUv - 0.5));
    col = u_color * noise;
    gl_FragColor = vec4(col, noise);
  }
`;

function createShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function NeuralNoise({
  color = [0.9, 0.2, 0.4],
  opacity = 0.95,
  speed = 0.001,
  maxDpr = 2,
  className,
}: NeuralNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [r, g, b] = color;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vs = createShader(gl, VS, gl.VERTEX_SHADER);
    const fs = createShader(gl, FS, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    gl.uniform3f(uniforms.u_color, r, g, b);
    gl.uniform1f(uniforms.u_speed, speed);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, maxDpr);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, tX: window.innerWidth / 2, tY: window.innerHeight / 2 };
    const setTarget = (x: number, y: number) => {
      pointer.tX = x;
      pointer.tY = y;
    };
    const onPointer = (e: MouseEvent) => setTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.targetTouches[0];
      if (t) setTarget(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("click", onPointer);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const draw = (time: number) => {
      pointer.x += (pointer.tX - pointer.x) * 0.2;
      pointer.y += (pointer.tY - pointer.y) * 0.2;
      gl.uniform1f(uniforms.u_time, time);
      gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    if (reduceMotion) draw(4000);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("click", onPointer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [r, g, b, speed, maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 h-full w-full", className)}
      style={{ opacity }}
    />
  );
}
