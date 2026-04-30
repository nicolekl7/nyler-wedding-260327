import { useState, useEffect, useCallback } from "react";

const OLIVE = "#534f23";
const SAGE = "#7a7e33";
const COLORS = [OLIVE, SAGE, "#8a8e43", "#636323"];

interface Heart {
  id: number;
  xPct: number; // 0-100% horizontal position within button
  size: number;
  color: string;
  delay: number; // ms delay before starting
  duration: number; // ms for full float
}

interface Burst {
  id: number;
  rect: DOMRect;
  hearts: Heart[];
}

const HeartConfetti = () => {
  const [bursts, setBursts] = useState<Burst[]>([]);

  const createBurst = useCallback((rect: DOMRect) => {
    const hearts: Heart[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      xPct: 10 + Math.random() * 80,
      size: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 400,
      duration: 1200 + Math.random() * 800,
    }));

    const burst: Burst = { id: Date.now() + Math.random(), rect, hearts };
    setBursts((prev) => [...prev, burst]);

    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burst.id));
    }, 2200);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<{ rect: DOMRect }>) => {
      createBurst(e.detail.rect);
    };
    window.addEventListener("rsvp-accept" as any, handler);
    return () => window.removeEventListener("rsvp-accept" as any, handler);
  }, [createBurst]);

  if (bursts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {bursts.map((burst) => (
        <BurstAnimation key={burst.id} rect={burst.rect} hearts={burst.hearts} />
      ))}
    </div>
  );
};

const BurstAnimation = ({ rect, hearts }: { rect: DOMRect; hearts: Heart[] }) => {
  return (
    <div
      style={{
        position: "fixed",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {hearts.map((h) => (
        <FloatingHeart key={h.id} heart={h} containerHeight={rect.height} />
      ))}
    </div>
  );
};

const FloatingHeart = ({
  heart,
  containerHeight,
}: {
  heart: Heart;
  containerHeight: number;
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${heart.xPct}%`,
        bottom: 0,
        transform: "translateX(-50%)",
        animation: `floatUp ${heart.duration}ms ease-out ${heart.delay}ms both`,
      }}
    >
      <svg
        width={heart.size}
        height={heart.size}
        viewBox="0 0 24 24"
        fill={heart.color}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateX(-50%) translateY(0);
            opacity: 0.9;
          }
          20% {
            opacity: 0.85;
          }
          70% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(-50%) translateY(-${containerHeight + 10}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export const triggerAcceptConfetti = (e: React.MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  window.dispatchEvent(new CustomEvent("rsvp-accept", { detail: { rect } }));
};

export default HeartConfetti;
