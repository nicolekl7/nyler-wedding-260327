import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PhotoStackProps {
  photos: string[];
  seed?: number;
  className?: string;
}

// Container height class by photo count
const containerHeights: Record<number, string> = {
  2: "h-72",
  3: "h-80 sm:h-96",
  4: "h-96 sm:h-[28rem]",
  5: "h-[28rem] sm:h-[34rem]",
  6: "h-[34rem] sm:h-[40rem]",
};

// Photo frame width by count
const photoWidths: Record<number, string> = {
  1: "w-64 sm:w-80",
  2: "w-40 sm:w-56",
  3: "w-40 sm:w-56",
  4: "w-36 sm:w-52",
  5: "w-32 sm:w-48",
  6: "w-32 sm:w-48",
};

// Hardcoded scatter positions [left%, top%] — every frame has a corner peeking out
const offsetsByCount: Record<number, Array<{ left: number; top: number }>> = {
  2: [
    { left: 4,  top: 4  },
    { left: 28, top: 20 },
  ],
  3: [
    { left: 4,  top: 4  },
    { left: 32, top: 10 },
    { left: 14, top: 46 },
  ],
  4: [
    { left: 2,  top: 2  },
    { left: 34, top: 8  },
    { left: 6,  top: 48 },
    { left: 36, top: 52 },
  ],
  5: [
    { left: 2,  top: 2  },
    { left: 36, top: 5  },
    { left: 4,  top: 38 },
    { left: 38, top: 40 },
    { left: 18, top: 68 },
  ],
  6: [
    { left: 0,  top: 0  },
    { left: 30, top: 4  },
    { left: 0,  top: 32 },
    { left: 32, top: 34 },
    { left: 8,  top: 62 },
    { left: 36, top: 64 },
  ],
};

const getRotation = (seed: number, i: number) =>
  Math.sin((seed + 1) * (i + 1) * 7.13) * 6;

const PhotoStack = ({ photos, seed = 42, className }: PhotoStackProps) => {
  const count = Math.min(photos.length, 6);
  const [order, setOrder] = useState<number[]>([]);

  if (count === 0) return null;

  const bringToFront = (idx: number) => {
    setOrder((prev) => [...prev.filter((i) => i !== idx), idx]);
  };

  const getZIndex = (i: number) => {
    const pos = order.indexOf(i);
    return pos === -1 ? 10 + i : 100 + pos;
  };

  // Single photo: centered, no scatter needed
  if (count === 1) {
    const rot = getRotation(seed, 0);
    return (
      <div className={cn("flex justify-center py-4", className)}>
        <motion.div
          className="bg-white border border-foreground/5 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.4)] p-2 cursor-pointer"
          style={{ rotate: rot }}
          whileHover={{ rotate: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img
            src={photos[0]}
            alt=""
            className={cn("block aspect-square object-cover", photoWidths[1])}
          />
        </motion.div>
      </div>
    );
  }

  const offsets = offsetsByCount[count] ?? offsetsByCount[6];
  const heightClass = containerHeights[count] ?? "h-[34rem]";
  const widthClass = photoWidths[count] ?? "w-32 sm:w-48";

  return (
    <div className={cn("relative w-full", heightClass, className)}>
      {photos.slice(0, count).map((src, i) => {
        const { left, top } = offsets[i];
        const rot = getRotation(seed, i);
        const z = getZIndex(i);

        return (
          <motion.div
            key={i}
            className={cn(
              "absolute bg-white border border-foreground/5",
              "shadow-[0_12px_32px_-16px_rgba(0,0,0,0.4)] p-2 cursor-pointer",
              widthClass
            )}
            style={{ left: `${left}%`, top: `${top}%`, rotate: rot, zIndex: z }}
            whileHover={{ rotate: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onMouseEnter={() => bringToFront(i)}
            onClick={() => bringToFront(i)}
          >
            <img src={src} alt="" className="block w-full aspect-square object-cover" />
          </motion.div>
        );
      })}
    </div>
  );
};

export default PhotoStack;
