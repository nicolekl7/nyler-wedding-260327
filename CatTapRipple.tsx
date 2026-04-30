import { useEffect, useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Paw {
  id: number;
  x: number;
  y: number;
}

let nextId = 0;

const CatTapRipple = () => {
  const isMobile = useIsMobile();
  const [paws, setPaws] = useState<Paw[]>([]);

  const handleTouch = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const id = nextId++;
    setPaws((prev) => [...prev, { id, x: touch.clientX, y: touch.clientY }]);
    setTimeout(() => {
      setPaws((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    window.addEventListener("touchstart", handleTouch, { passive: true });
    return () => window.removeEventListener("touchstart", handleTouch);
  }, [isMobile, handleTouch]);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {paws.map((paw) => (
        <span
          key={paw.id}
          className="absolute animate-paw-fade"
          style={{
            left: paw.x - 16,
            top: paw.y - 16,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main pad */}
            <ellipse cx="32" cy="40" rx="12" ry="10" fill="hsl(var(--foreground) / 0.35)" />
            {/* Toes */}
            <circle cx="20" cy="26" r="6" fill="hsl(var(--foreground) / 0.3)" />
            <circle cx="32" cy="22" r="6" fill="hsl(var(--foreground) / 0.3)" />
            <circle cx="44" cy="26" r="6" fill="hsl(var(--foreground) / 0.3)" />
          </svg>
        </span>
      ))}
    </div>
  );
};

export default CatTapRipple;
