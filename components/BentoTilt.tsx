"use client";

import { useEffect } from "react";

export default function BentoTilt() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".bento-card");
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const handleMouseMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
        card.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(124,58,237,0.1)`;
      };

      const handleMouseLeave = () => {
        card.style.transform = "";
        card.style.boxShadow = "";
      };

      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", handleMouseLeave);

      cleanups.push(() => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseleave", handleMouseLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
