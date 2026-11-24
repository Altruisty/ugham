"use client";

import { useEffect, useRef } from "react";

export default function OrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    let t = 0;
    let animationFrameId: number;

    const centerLogo = new Image();
    centerLogo.src = "/assets/img/logo.png";

    const icons = [
      { path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", r: size * 0.24, speed: 0.008, angle: 0, color: "#7C3AED" },
      { path: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z", r: size * 0.37, speed: 0.005, angle: 2.1, color: "#C026D3" },
      { path: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M18.364 18.364l-.707-.707M12 21v-1m-4.95-.636l-.707.707M4 12H3m3.343-5.657l-.707-.707", r: size * 0.24, speed: 0.008, angle: 4.2, color: "#4338CA" },
      { path: "M13 10V3L4 14h7v7l9-11h-7z", r: size * 0.37, speed: 0.005, angle: 0.7, color: "#7C3AED" },
      { path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z", r: size * 0.46, speed: 0.003, angle: 3.5, color: "#C026D3" },
    ];

    function drawOrbit() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      t += 0.5;

      // Orbit rings
      const r1 = size * 0.24;
      const r2 = size * 0.37;
      const r3 = size * 0.46;
      [r1, r2, r3].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(124,58,237,0.12)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Center glow
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.18);
      grad.addColorStop(0, "rgba(67,56,202,0.15)");
      grad.addColorStop(1, "rgba(192,38,211,0.05)");
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Spinning arc
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.01);
      const arcGrad = ctx.createLinearGradient(-size * 0.18, 0, size * 0.18, 0);
      arcGrad.addColorStop(0, "#4338CA");
      arcGrad.addColorStop(0.5, "#7C3AED");
      arcGrad.addColorStop(1, "#C026D3");
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.18, -0.5, Math.PI + 0.5);
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Center logo
      if (centerLogo.complete && centerLogo.naturalWidth > 0) {
        const lw = size * 0.28;
        const lh = size * 0.16;
        ctx.drawImage(centerLogo, cx - lw / 2, cy - lh / 2, lw, lh);
      }

      // Orbiting nodes
      icons.forEach((node) => {
        node.angle += node.speed;
        const nx = cx + Math.cos(node.angle) * node.r;
        const ny = cy + Math.sin(node.angle) * node.r;

        // White circle bg
        ctx.beginPath();
        ctx.arc(nx, ny, size * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Colored dot
        ctx.beginPath();
        ctx.arc(nx, ny, size * 0.02, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawOrbit);
    }

    if (document.fonts) {
      document.fonts.ready.then(drawOrbit);
    } else {
      drawOrbit();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="orbitCanvas"
      ref={canvasRef}
      width={420}
      height={420}
      style={{ maxWidth: "100%" }}
    />
  );
}
