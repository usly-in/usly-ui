"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_res;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  p += vec2(0.31, 0.17);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(0.31, 0.17);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time * 0.05;

  float n = fbm(uv * 2.2 + vec2(t * 0.8,  t * 0.5));
  float m = fbm(uv * 1.6 - vec2(t * 0.4, -t * 0.3) + n * 0.35);
  float k = fbm(uv * 3.1 + vec2(t * 0.2, -t * 0.7) + m * 0.2);

  vec3 bg   = vec3(0.043, 0.043, 0.043);
  vec3 rose = vec3(0.894, 0.627, 0.627);
  vec3 warm = vec3(0.380, 0.200, 0.200);

  vec3 col = bg;
  col = mix(col, rose, k * 0.28);
  col = mix(col, warm, m * 0.18);

  // soft vignette
  vec2 q = uv - 0.5;
  float vig = 1.0 - dot(q * 1.5, q * 1.5);
  col *= clamp(vig, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Capture narrowed non-null references for use inside closures
    const g: WebGLRenderingContext = gl;
    const c: HTMLCanvasElement = canvas;

    function compileShader(type: number, src: string): WebGLShader | null {
      const s = g.createShader(type);
      if (!s) return null;
      g.shaderSource(s, src);
      g.compileShader(s);
      return s;
    }

    const prog = g.createProgram();
    if (!prog) return;
    const vert = compileShader(g.VERTEX_SHADER, VERT);
    const frag = compileShader(g.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    g.attachShader(prog, vert);
    g.attachShader(prog, frag);
    g.linkProgram(prog);
    g.useProgram(prog);

    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      g.STATIC_DRAW,
    );

    const posLoc = g.getAttribLocation(prog, "a_pos");
    g.enableVertexAttribArray(posLoc);
    g.vertexAttribPointer(posLoc, 2, g.FLOAT, false, 0, 0);

    const uTime = g.getUniformLocation(prog, "u_time");
    const uRes = g.getUniformLocation(prog, "u_res");

    function resize() {
      const dpr = Math.min(globalThis.devicePixelRatio ?? 1, 2);
      c.width = c.offsetWidth * dpr;
      c.height = c.offsetHeight * dpr;
      g.viewport(0, 0, c.width, c.height);
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(c);

    function frame(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      g.uniform1f(uTime, t);
      g.uniform2f(uRes, c.width, c.height);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        startRef.current = 0;
        rafRef.current = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      g.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
