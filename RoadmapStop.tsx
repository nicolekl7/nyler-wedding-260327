import { useState } from "react";
import { cn } from "@/lib/utils";
import FadeIn from "./FadeIn";

export interface RoadmapPhoto {
  src?: string;
  alt?: string;
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
      {/* Center dot (desktop) */}
      <span
        aria-hidden
        className={cn(
          "hidden lg:block absolute left-1/2 -translate-x-1/2 top-12 z-10 rounded-full bg-background border-2 border-foreground/70",
          isLast ? "h-5 w-5 bg-foreground" : "h-3 w-3"
        )}
      />
      {/* Mobile rail dot */}
      <span
        aria-hidden
        className={cn(
          "lg:hidden absolute left-[7px] top-3 z-10 rounded-full bg-background border-2 border-foreground/70",
          isLast ? "h-4 w-4 bg-foreground" : "h-3 w-3"
        )}
      />

      <FadeIn>
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center pl-8 lg:pl-0"
          )}
        >
          {/* Text block */}
          <div
            className={cn(
              "lg:col-span-1",
              textFirst ? "lg:order-1 lg:text-right lg:pr-12" : "lg:order-2 lg:pl-12"
            )}
          >
            <p className="font-body uppercase tracking-[0.3em] text-[0.7rem] text-muted-foreground mb-4">
              {stop.month}
              {stop.place && <span> · {stop.place}</span>}
              <span className="ml-2">{stop.year}</span>
            </p>
            {stop.headline && (
              <h2 className="font-serif italic text-xl sm:text-2xl font-light text-foreground leading-snug mb-3 text-balance">
                {stop.headline}
              </h2>
            )}
            {stop.blurb && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed text-balance max-w-sm lg:max-w-none lg:inline-block">
                {stop.blurb}
              </p>
            )}
          </div>

          {/* Photos */}
          <div
            className={cn(
              "lg:col-span-1",
              textFirst ? "lg:order-2 lg:pl-12" : "lg:order-1 lg:pr-12"
            )}
          >
            <PhotoStack photos={stop.photos} seed={index} align={textFirst ? "left" : "right"} />
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

const PhotoStack = ({
  photos,
  seed,
  align,
}: {
  photos: RoadmapPhoto[];
  seed: number;
  align: "left" | "right";
}) => {
  const visible = photos.slice(0, 6);
  const [order, setOrder] = useState<number[]>([]);
  const bring = (i: number) =>
    setOrder((prev) => (prev[prev.length - 1] === i ? prev : [...prev.filter((x) => x !== i), i]));
  const stackZ = (i: number, base: number) => {
    const pos = order.indexOf(i);
    return pos === -1 ? base : 100 + pos;
  };
  if (visible.length === 0) return null;

  // Deterministic pseudo-random rotations
  const rot = (i: number) => {
    const v = Math.sin((seed + 1) * (i + 1) * 7.13) * 6;
    return v.toFixed(2);
  };

  if (visible.length === 1) {
    return (
      <div className={cn("flex", align === "left" ? "justify-start" : "justify-end")}>
        <PhotoFrame photo={visible[0]} rotate={rot(0)} className="w-64 sm:w-80" />
      </div>
    );
  }

  // Scattered offsets per stack size — keeps each frame at least partially clickable.
  const offsetsByCount: Record<number, { left: string; top: string }[]> = {
    2: [
      { left: "0%", top: "0%" },
      { left: "28%", top: "10%" },
    ],
    3: [
      { left: "0%", top: "0%" },
      { left: "38%", top: "8%" },
      { left: "14%", top: "44%" },
    ],
    4: [
      { left: "0%", top: "0%" },
      { left: "36%", top: "6%" },
      { left: "8%", top: "38%" },
      { left: "42%", top: "44%" },
    ],
    5: [
      { left: "0%", top: "2%" },
      { left: "32%", top: "0%" },
      { left: "6%", top: "34%" },
      { left: "38%", top: "36%" },
      { left: "20%", top: "62%" },
    ],
    6: [
      { left: "0%", top: "0%" },
      { left: "30%", top: "4%" },
      { left: "0%", top: "32%" },
      { left: "32%", top: "34%" },
      { left: "8%", top: "62%" },
      { left: "36%", top: "64%" },
    ],
  };

  // Desktop-only override for 6: 2 rows × 3 columns grid feel.
  const desktopOffsetsByCount: Record<number, { left: string; top: string }[]> = {
    6: [
      { left: "0%", top: "0%" },
      { left: "34%", top: "4%" },
      { left: "68%", top: "0%" },
      { left: "0%", top: "44%" },
      { left: "34%", top: "48%" },
      { left: "68%", top: "44%" },
    ],
  };

  // Taller container for bigger stacks — generous so absolutely-positioned
  // photos never spill into the next stop on mobile. Desktop 6 uses 2x3 grid
  // so it can be shorter.
  const heightClass =
    visible.length >= 6
      ? "h-[34rem] sm:h-[28rem]"
      : visible.length === 5
      ? "h-[30rem] sm:h-[36rem]"
      : visible.length === 4
      ? "h-[24rem] sm:h-[26rem]"
      : visible.length === 3
      ? "h-[22rem] sm:h-80"
      : "h-72 sm:h-80";

  // Smaller frames on mobile when there are many photos. For 6 on desktop,
  // shrink so 3 fit per row.
  const sizeClass =
    visible.length >= 6
      ? "w-32 sm:w-40"
      : visible.length === 5
      ? "w-32 sm:w-48"
      : visible.length === 4
      ? "w-36 sm:w-52"
      : "w-40 sm:w-56";

  return (
    <div
      className={cn(
        "relative w-full lg:max-w-[26rem]",
        heightClass,
        align === "left" ? "ml-0" : "ml-0 lg:ml-auto"
      )}
    >
      {visible.map((photo, i) => {
        const offsets = offsetsByCount[visible.length] ?? offsetsByCount[3];
        const desktopOffsets = desktopOffsetsByCount[visible.length];
        const dOff = desktopOffsets?.[i];
        return (
          <PhotoFrame
            key={i}
            photo={photo}
            rotate={rot(i)}
            className={cn(
              "absolute transition-transform duration-500 hover:!rotate-0 hover:scale-105",
              sizeClass,
              dOff && "sm:left-[var(--sm-left)] sm:top-[var(--sm-top)]"
            )}
            style={{
              left: offsets[i].left,
              top: offsets[i].top,
              zIndex: stackZ(i, 10 + i),
              ...(dOff
                ? ({ "--sm-left": dOff.left, "--sm-top": dOff.top } as React.CSSProperties)
                : {}),
            }}
            onMouseEnter={() => bring(i)}
            onClick={() => bring(i)}
          />
        );
      })}
    </div>
  );
};

const PhotoFrame = ({
  photo,
  rotate,
  className,
  style,
  onMouseEnter,
  onClick,
}: {
  photo: RoadmapPhoto;
  rotate: string;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onClick?: () => void;
}) => (
  <figure
    className={cn(
      "bg-card p-2 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.4)] border border-foreground/5",
      className
    )}
    style={{ transform: `rotate(${rotate}deg)`, ...style }}
    onMouseEnter={onMouseEnter}
    onClick={onClick}
  >
    {photo.src ? (
      <img
        src={photo.src}
        alt={photo.alt ?? ""}
        className="block w-full h-auto bg-foreground/10"
        loading="lazy"
      />
    ) : (
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-foreground/10">
        <div className="absolute inset-0 flex items-center justify-center text-foreground/30 font-serif italic text-xs">
          coming soon
        </div>
      </div>
    )}
  </figure>
);

export default RoadmapStop;
