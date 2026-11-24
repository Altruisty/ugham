"use client";

import { useEffect, useRef } from "react";

export default function LiquidFog() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let t = 0;
    let animationFrameId: number;

    const orbs: Array<{
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      color: number[];
      phase: number;
    }> = [];

    function resizeFog() {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeFog);
    resizeFog();

    for (let i = 0; i < 6; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 200 + 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: i % 3 === 0 ? [124, 58, 237] : i % 3 === 1 ? [192, 38, 211] : [67, 56, 202],
        phase: Math.random() * Math.PI * 2,
      });
    }

    function drawFog() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      t += 0.003;

      orbs.forEach((o) => {
        o.x += o.vx + Math.sin(t + o.phase) * 0.3;
        o.y += o.vy + Math.cos(t + o.phase) * 0.3;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;

        const pulse = Math.sin(t * 2 + o.phase) * 0.3 + 0.7;
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * pulse);
        grad.addColorStop(0, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0.06)`);
        grad.addColorStop(0.5, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0.02)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      animationFrameId = requestAnimationFrame(drawFog);
    }
    drawFog();

    return () => {
      window.removeEventListener("resize", resizeFog);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="liquidFog"
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
