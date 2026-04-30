import { useState } from "react";
import { cn } from "@/lib/utils";
import FadeIn from "./FadeIn";

export interface RoadmapPhoto {
  src?: any;
  alt?: string;
  nudgeY?: number;
  nudgeX?: number;
}

export interface RoadmapStopData {
  year: string;
  month: string;
  place?: string;
  headline: string;
  blurb?: string;
  photos: RoadmapPhoto[];
}

interface Props {
  stop: RoadmapStopData;
  side: "left" | "right";
  index: number;
  isLast?: boolean;
}

const RoadmapStop = ({ stop, side, index, isLast }: Props) => {
  const textFirst = side === "left";
  return (
    <div className="relative">
      <span aria-hidden className={cn("hidden lg:block absolute left-1/2 -translate-x-1/2 top-12 z-10 rounded-full bg-background border-2 border-foreground/70", isLast ? "h-5 w-5 bg-foreground" : "h-3 w-3")} />
      <span aria-hidden className={cn("lg:hidden absolute left-[7px] top-3 z-10 rounded-full bg-background border-2 border-foreground/70", isLast ? "h-4 w-4 bg-foreground" : "h-3 w-3")} />
      <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center pl-8 lg:pl-0">
          <div className={cn("lg:col-span-1", textFirst ? "lg:order-1 lg:text-right lg:pr-12" : "lg:order-2 lg:pl-12")}>
            <h3 className="font-serif text-5xl sm:text-6xl font-light text-foreground mb-3">{stop.year}</h3>
            <p className="font-body uppercase tracking-[0.3em] text-[0.7rem] text-muted-foreground mb-4">
              {stop.month} {stop.place && <span> · {stop.place}</span>}
            </p>
            {stop.blurb && <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm lg:max-w-none">{stop.blurb}</p>}
          </div>
          <div className={cn("lg:col-span-1", textFirst ? "lg:order-2 lg:pl-12" : "lg:order-1 lg:pr-12")}>
            <PhotoStack photos={stop.photos} seed={index} align={textFirst ? "left" : "right"} />
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

const PhotoStack = ({ photos, seed, align }: { photos: RoadmapPhoto[]; seed: number; align: "left" | "right" }) => {
  const visible = photos.slice(0, 5);
  const [order, setOrder] = useState<number[]>([]);
  const bring = (i: number) => setOrder((prev) => [...prev.filter((x) => x !== i), i]);
  
  const stackZ = (i: number, base: number) => {
    const pos = order.indexOf(i);
    // Force first photo of first section (2016) to be highest initial z-index
    if (seed === 0 && i === 0 && pos === -1) return 50;
    return pos === -1 ? base : 100 + pos;
  };
    // Deterministic pseudo-random rotations
  const rot = (i: number) => {
    const raw = Math.sin((seed + 1) * (i + 1) * 7.13) * 6;
    // First photo of the very first stop stays nearly straight (max ±5°)
    const v = seed === 0 && i === 0 ? Math.max(-5, Math.min(5, raw * 0.5)) : raw;
    return v.toFixed(2);
  };

  const offsetsByCount: Record<number, { left: string; top: string }[]> = {
    2: [{ left: "0%", top: "5%" }, { left: "35%", top: "15%" }],
    3: [{ left: "0%", top: "0%" }, { left: "38%", top: "8%" }, { left: "14%", top: "44%" }],
    5: [
      { left: "0%", top: "2%" },   // Top Left
      { left: "35%", top: "0%" },  // Top Right
      { left: "5%", top: "32%" },  // Mid Left (tucked)
      { left: "40%", top: "36%" }, // Mid Right
      { left: "20%", top: "62%" }, // Bottom Center
    ],
  };

  const currentOffsets = offsetsByCount[visible.length] || offsetsByCount[5];
  const sizeClass = "w-48 sm:w-64"; // Standard large size
  const heightClass = visible.length <= 2 ? "h-[26rem]" : "h-[34rem] sm:h-[40rem]";

  return (
    <div className={cn("relative w-full", heightClass, align === "left" ? "ml-0" : "lg:ml-auto max-w-[30rem]")}>
 {visible.map((photo, i) => (
  <PhotoFrame
    key={i}
    photo={photo}
    // Fixed: Removed the hardcoded "20" rotation check
    rotate={(Math.sin((seed + i) * 10) * 8).toFixed(0)}
    className={cn("absolute transition-all duration-500 hover:!rotate-0 hover:scale-105", sizeClass)}
    style={{
      left: currentOffsets[i]?.left,
      top: currentOffsets[i]?.top,
      zIndex: stackZ(i, 10 + i),
    }}
    onMouseEnter={() => bring(i)}
  />
))}
          onMouseEnter={() => bring(i)}
        />
      ))}
    </div>
  );
};

const PhotoFrame = ({ photo, rotate, className, style, onMouseEnter }: any) => {
  const isHorizontal = photo.src?.width > photo.src?.height;
  return (
    <figure
      className={cn("bg-card p-2 shadow-xl border border-black/5", isHorizontal && "sm:!w-[22rem]", className)}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
      onMouseEnter={onMouseEnter}
    >
      <img src={photo.src.src || photo.src} alt="" className="block w-full h-auto bg-muted" />
    </figure>
  );
};

export default RoadmapStop;
