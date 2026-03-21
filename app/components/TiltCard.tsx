"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface TiltCardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    const glare = glareRef.current;
    if (!el || !glare) return;

    // Capture narrowed non-null references for closure use
    const card: HTMLDivElement = el;
    const overlay: HTMLDivElement = glare;

    function onMove(e: MouseEvent) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale3d(1.05,1.05,1.05)`;
      card.style.transition = "transform 0.08s ease-out";
      const angleDeg = (Math.atan2(y, x) * 180) / Math.PI + 90;
      overlay.style.opacity = "1";
      overlay.style.backgroundImage = `linear-gradient(${angleDeg}deg, rgba(228,160,160,0.22) 0%, transparent 60%)`;
    }

    function onLeave() {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      card.style.transition = "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)";
      overlay.style.opacity = "0";
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
      <div
        ref={glareRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.15s ease",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
