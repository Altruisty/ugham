"use client";

import { useEffect, useRef } from "react";

export default function DnaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let time = 0;
    let animationFrameId: number;

    function resizeDNA() {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeDNA);
    resizeDNA();

    function drawDNA() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      time += 0.018;
      const cols = Math.max(1, Math.floor(w / 200));

      for (let c = 0; c < cols; c++) {
        const cx2 = (c + 0.5) * (w / cols);
        const num = 20;
        const spacing = h / (num + 2);
        for (let i = 0; i < num; i++) {
          const y = spacing * (i + 1);
          const shift = (i / num) * Math.PI * 3 + c * 1.5;
          const x1 = cx2 + Math.sin(time + shift) * 50;
          const x2 = cx2 + Math.sin(time + shift + Math.PI) * 50;

          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = "rgba(124,58,237,0.15)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x1, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(67,56,202,0.4)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x2, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(192,38,211,0.4)";
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(drawDNA);
    }
    drawDNA();

    return () => {
      window.removeEventListener("resize", resizeDNA);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="dnaCanvas"
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}
