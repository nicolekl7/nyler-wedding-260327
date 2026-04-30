import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface PolaroidPhoto {
  src?: string;
  alt?: string;
  caption?: string;
  /** Optional manual nudge in percentage points, applied to scattered layout */
  offsetX?: number;
  offsetY?: number;
}

interface PolaroidClusterProps {
  photos: PolaroidPhoto[];
  /** Stable seed so each cluster's randomness is deterministic */
  seed?: number;
  className?: string;
}

/**
 * Adaptive polaroid cluster.
 * - 1–4 photos: scattered, rotated, lightly overlapping (reference-style)
 * - 5+ photos:  loose masonry-ish grid with subtle rotations (less overlap)
 */
const PolaroidCluster = ({ photos, seed = 1, className }: PolaroidClusterProps) => {
  const scattered = photos.length <= 6;
  const [order, setOrder] = useState<number[]>([]);
  const bring = (i: number) =>
    setOrder((prev) => (prev[prev.length - 1] === i ? prev : [...prev.filter((x) => x !== i), i]));
  const stackZ = (i: number) => {
    const pos = order.indexOf(i);
    return pos === -1 ? undefined : 100 + pos;
  };
  const isActive = (i: number) => order[order.length - 1] === i;

  const layout = useMemo(() => {
    // Seeded PRNG so each cluster's randomness is stable
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const between = (min: number, max: number) => min + rand() * (max - min);

    const items = photos.map(() => ({
      rotate: between(-14, 14),
      z: Math.floor(rand() * 10),
      sizeIdx: Math.floor(rand() * 3),
    }));

    if (!scattered) {
      return items.map((it) => ({ ...it, leftPct: 0, topPct: 0 }));
    }

    // Poisson-ish placement: try random points, keep the one with the
    // greatest distance from already-placed points but allow real overlap.
    const placed: { x: number; y: number }[] = [];
    const padX = 22;
    const padY = 26;

    const positions = items.map(() => {
      let best = { x: 50, y: 50, score: -Infinity };
      const tries = 60;
      for (let t = 0; t < tries; t++) {
        const x = between(padX, 100 - padX);
        const y = between(padY, 100 - padY);
        let minDist = Infinity;
        for (const p of placed) {
          const d = Math.hypot(x - p.x, y - p.y);
          if (d < minDist) minDist = d;
        }
        if (placed.length === 0) minDist = 100;
        if (minDist > best.score) best = { x, y, score: minDist };
      }
      placed.push({ x: best.x, y: best.y });
      return { x: best.x, y: best.y };
    });

    return items.map((it, i) => ({
      ...it,
      leftPct: positions[i].x,
      topPct: positions[i].y,
    }));
  }, [photos, seed, scattered]);

  // Bigger polaroids when there are fewer photos
  const sizeClasses =
    photos.length <= 2
      ? ["w-56 sm:w-72", "w-60 sm:w-80", "w-52 sm:w-64"]
      : photos.length <= 4
        ? ["w-44 sm:w-56", "w-48 sm:w-60", "w-40 sm:w-52"]
        : ["w-36 sm:w-44", "w-40 sm:w-52", "w-32 sm:w-40"];

  if (scattered) {
    const heightClass =
      photos.length === 1
        ? "h-[20rem] sm:h-[24rem]"
        : photos.length <= 2
          ? "h-[26rem] sm:h-[32rem]"
          : photos.length <= 4
            ? "h-[26rem] sm:h-[30rem]"
            : "h-[28rem] sm:h-[32rem]";

    return (
      <div
        className={cn(
          "relative mx-auto w-full max-w-xl",
          heightClass,
          className,
        )}
      >
        {photos.map((photo, i) => {
          const l = layout[i];
          const z = stackZ(i);
          return (
            <div
              key={i}
              className={cn(
                "polaroid-stack absolute -translate-x-1/2 -translate-y-1/2",
                sizeClasses[l.sizeIdx],
                isActive(i) && "is-active",
              )}
              style={{
                left: `${l.leftPct + (photo.offsetX ?? 0)}%`,
                top: `${l.topPct + (photo.offsetY ?? 0)}%`,
                ["--z" as never]: z ?? l.z,
              }}
              onMouseEnter={() => bring(i)}
              onClick={() => bring(i)}
            >
              <Polaroid
                photo={photo}
                className="polaroid-tilt transition-transform duration-500 ease-out hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]"
                style={{ ["--rot" as never]: `${l.rotate}deg` }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Grid mode for 7+ photos — flexible, still rotated
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        "grid-cols-2 sm:grid-cols-3",
        photos.length >= 8 && "lg:grid-cols-4",
        className,
      )}
    >
      {photos.map((photo, i) => {
        const l = layout[i];
        const z = stackZ(i);
        return (
          <div
            key={i}
            className={cn("polaroid-stack relative", isActive(i) && "is-active")}
            style={{ ["--z" as never]: z ?? l.z }}
            onMouseEnter={() => bring(i)}
            onClick={() => bring(i)}
          >
            <Polaroid
              photo={photo}
              className="polaroid-tilt w-full transition-transform duration-500 ease-out hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]"
              style={{ ["--rot" as never]: `${l.rotate * 0.5}deg` }}
            />
          </div>
        );
      })}
    </div>
  );
};

interface PolaroidProps {
  photo: PolaroidPhoto;
  className?: string;
  style?: React.CSSProperties;
}

const Polaroid = ({ photo, className, style }: PolaroidProps) => (
  <figure
    className={cn(
      "bg-white p-2 pb-8 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] border border-foreground/5",
      className,
    )}
    style={style}
  >
    <div className="relative aspect-square w-full overflow-hidden bg-foreground/10">
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt ?? ""}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-foreground/30 font-serif italic text-xs">
          photo
        </div>
      )}
    </div>
    {photo.caption && (
      <figcaption className="pt-2 text-center font-serif italic text-[0.7rem] text-foreground/60 truncate">
        {photo.caption}
      </figcaption>
    )}
  </figure>
);

export default PolaroidCluster;
