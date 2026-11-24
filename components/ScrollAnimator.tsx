"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollAnimator() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll animations observer for .anim-el
    const animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".anim-el");
    elements.forEach((el) => animObserver.observe(el));

    // Mobile scroll-activated animations
    let mio: IntersectionObserver | null = null;
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      mio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("scroll-visible");
            } else {
              e.target.classList.remove("scroll-visible");
            }
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
      );

      const selectors =
        ".ia-card,.hex-card,.expertise-card,.info-card,.kanban-card,.flow-step,.bento-card,.price-card,.expertise-v2,.vm-panel,.reason-item,.ds-card,.trophy-card,.partner-pill,.ex-strip,.tower-item";
      document.querySelectorAll(selectors).forEach((el) => mio?.observe(el));
    }

    return () => {
      animObserver.disconnect();
      if (mio) mio.disconnect();
    };
  }, [pathname]);

  return null;
}
