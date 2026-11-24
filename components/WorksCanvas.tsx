"use client";

import { useEffect, useRef } from "react";

export default function WorksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wCanvas = canvasRef.current;
    if (!wCanvas) return;
    if (window.innerWidth <= 900) return;

    const ctx = wCanvas.getContext("2d");
    if (!ctx) return;

    wCanvas.width = wCanvas.offsetWidth * 2;
    wCanvas.height = wCanvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = wCanvas.offsetWidth;
    const h = wCanvas.offsetHeight;
    let animationFrameId: number;

    const particles: Array<{
      x: number;
      y: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vy: Math.random() * 1.5 + 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const stages = ["Learn", "Ideate", "Build", "Scale", "Launch"];

    function drawArrow(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      bounce: number
    ) {
      c.save();
      c.translate(x, y + bounce);
      c.beginPath();
      c.moveTo(-size, -size * 0.6);
      c.lineTo(0, size * 0.6);
      c.lineTo(size, -size * 0.6);
      c.strokeStyle = "rgba(124,58,237,0.35)";
      c.lineWidth = 2.5;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.stroke();
      c.restore();
    }

    function drawWorks() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;

      stages.forEach((s, i) => {
        const y = (h / 6) * (i + 0.8);
        const xc = w / 2;
        const spread = w * 0.4 * (1 - i * 0.18);
        ctx.beginPath();
        ctx.moveTo(xc - spread, y);
        ctx.lineTo(xc + spread, y);
        ctx.strokeStyle = `rgba(124,58,237,${0.08 + i * 0.03})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = `rgba(124,58,237,${0.35 + i * 0.12})`;
        ctx.font = "700 13px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s, xc, y - 10);

        if (i < stages.length - 1) {
          const nextY = (h / 6) * (i + 1.8);
          const midY = (y + nextY) / 2;
          const bounce = Math.sin(t * 2 + i) * 4;
          drawArrow(ctx, xc - 30, midY, 8, bounce);
          drawArrow(ctx, xc, midY, 8, bounce + 2);
          drawArrow(ctx, xc + 30, midY, 8, bounce - 1);
        }
      });

      // Particles
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += Math.sin(t * 2 + p.phase) * 0.5;
        const progress = p.y / h;
        const xCenter = w / 2;
        const maxSpread = w * 0.4 * (1 - progress * 0.8);
        if (p.x < xCenter - maxSpread) p.x = xCenter - maxSpread;
        if (p.x > xCenter + maxSpread) p.x = xCenter + maxSpread;
        if (p.y > h) {
          p.y = 0;
          p.x = w / 2 + (Math.random() - 0.5) * w * 0.7;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const hue = progress > 0.5 ? [192, 38, 211] : [124, 58, 237];
        ctx.fillStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${
          p.alpha * (0.5 + progress * 0.5)
        })`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawWorks);
    }

    drawWorks();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="worksCanvas" ref={canvasRef} className="anim-el blur-in del-2" />;
}
