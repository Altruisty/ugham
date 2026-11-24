"use client";

import { useEffect, useRef } from "react";

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const neuralCanvas = canvasRef.current;
    if (!neuralCanvas) return;

    const ctx = neuralCanvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
    }> = [];
    const particleCount = 60;
    let animationFrameId: number;

    function resizeNeural() {
      if (!neuralCanvas) return;
      w = neuralCanvas.width = window.innerWidth;
      h = neuralCanvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeNeural);
    resizeNeural();

    for (let i = 0; i < particleCount; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.5 + 0.1,
      });
    }

    function drawNeural() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      const maxDist = 150;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, `rgba(124, 58, 237, ${alpha})`);
            grad.addColorStop(1, `rgba(192, 38, 211, ${alpha})`);
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${n.baseAlpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192, 38, 211, ${n.baseAlpha * 0.2})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawNeural);
    }
    drawNeural();

    return () => {
      window.removeEventListener("resize", resizeNeural);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="neuralCanvas"
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
