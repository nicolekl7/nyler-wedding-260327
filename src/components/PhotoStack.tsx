import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PhotoStackProps {
  photos: any[];
  seed?: number;
  className?: string;
}

const PhotoStack = ({ photos, seed = 42, className }: PhotoStackProps) => {
  const [order, setOrder] = useState<number[]>([]);
  const bring = (i: number) => setOrder((prev) => [...prev.filter((x) => x !== i), i]);
  
  const offsets = [
    { left: "0%", top: "2%" },
    { left: "35%", top: "0%" },
    { left: "5%", top: "32%" },
    { left: "40%", top: "36%" },
    { left: "20%", top: "62%" },
  ];

  return (
    <div className={cn("relative w-full h-[35rem] max-w-md mx-auto", className)}>
      {photos.slice(0, 5).map((photo, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute bg-white p-2 shadow-xl border border-black/5",
            (photo.width > photo.height) ? "w-64 sm:w-80" : "w-48 sm:w-60"
          )}
          style={{
            left: offsets[i]?.left,
            top: offsets[i]?.top,
            zIndex: order.indexOf(i) === -1 ? 10 + i : 100 + order.indexOf(i),
            rotate: `${Math.sin((seed + i) * 10) * 8}deg`
          }}
          whileHover={{ rotate: 0, scale: 1.05 }}
          onMouseEnter={() => bring(i)}
        >
          <img src={photo.src || photo} alt="" className="w-full h-auto" />
        </motion.div>
      ))}
    </div>
  );
};

export default PhotoStack;
