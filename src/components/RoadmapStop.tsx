import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";

export interface RoadmapStopData {
  year: string;
  month: string;
  place: string;
  headline: string;
  blurb: string;
  photos: Array<{ src?: string }>;
}

interface Props {
  stop: RoadmapStopData;
  index: number;
  side: "left" | "right";
  isLast: boolean;
}

const PhotoCluster = ({ photos, seed }: { photos: string[]; seed: number }) => {
  if (photos.length === 0) return null;

  const PS = photos.length === 1 ? 180 : 110;
  const PW = PS + 16;
  const PH = PS + 40;

  if (photos.length === 1) {
    const h = ((seed * 13) % 79) / 79;
    return (
      <div className="py-4 flex justify-center lg:justify-start">
        <motion.div
          className="bg-white select-none"
          style={{
            rotate: (h * 2 - 1) * 4,
            padding: 10,
            paddingBottom: 36,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)",
          }}
          whileHover={{ rotate: 0, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <img
            src={photos[0]}
            alt=""
            style={{ width: PS, height: PS, objectFit: "cover", display: "block" }}
          />
        </motion.div>
      </div>
    );
  }

  const CW = Math.round(PW * (0.8 + photos.length * 0.42));
  const CH = Math.round(PH * (0.8 + photos.length * 0.35));

  const getPos = (i: number) => {
    const h1 = ((seed * (i + 5) * 17 + i * 53) % 97) / 97;
    const h2 = ((seed * (i + 5) * 31 + i * 71) % 83) / 83;
    const h3 = ((seed * (i + 5) * 13 + i * 29) % 79) / 79;
    return {
      x: h1 * Math.max(0, CW - PW),
      y: h2 * Math.max(0, CH - PH),
      rot: (h3 * 2 - 1) * 22,
    };
  };

  return (
    <div className="relative my-4" style={{ width: CW, height: CH }}>
      {photos.map((src, i) => {
        const { x, y, rot } = getPos(i);
        return (
          <motion.div
            key={i}
            className="absolute bg-white select-none"
            style={{
              left: x,
              top: y,
              rotate: rot,
              padding: 10,
              paddingBottom: 36,
              boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
              width: PW,
              zIndex: i + 1,
            }}
            whileHover={{ rotate: 0, scale: 1.1, zIndex: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <img
              src={src}
              alt=""
              style={{ width: PS, height: PS, objectFit: "cover", display: "block" }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

const Meta = ({ month, year, place, headline, blurb, align }: {
  month: string; year: string; place: string; headline: string; blurb: string;
  align: "left" | "right";
}) => (
  <div className={align === "right" ? "text-right" : ""}>
    <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-1">
      {month} · {year}
    </p>
    <h2 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-3 leading-snug">
      {place}
    </h2>
    {headline && (
      <p className="font-serif italic text-xl font-light text-foreground mb-3">{headline}</p>
    )}
    <p className="body-editorial text-muted-foreground mb-4 max-w-sm">{blurb}</p>
  </div>
);

const RoadmapStop = ({ stop, index, side, isLast: _isLast }: Props) => {
  const photos = stop.photos.filter((p) => p.src).map((p) => p.src as string);
  const seed =
    stop.year.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + index * 37;

  return (
    <FadeIn>
      {/* Mobile layout */}
      <div className="lg:hidden flex gap-5">
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div className="w-5 h-5 rounded-full border-2 border-primary/40 bg-background flex items-center justify-center">
            <div className="w-[6px] h-[6px] rounded-full bg-primary" />
          </div>
        </div>

        <div className="min-w-0 flex-1 pb-2">
          <Meta
            month={stop.month}
            year={stop.year}
            place={stop.place}
            headline={stop.headline}
            blurb={stop.blurb}
            align="left"
          />
          {photos.length > 0 && <PhotoCluster photos={photos} seed={seed} />}
        </div>
      </div>

      {/* Desktop layout: alternating sides */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_2rem_1fr] lg:items-start lg:gap-x-8">
        {/* Left column */}
        {side === "left" ? (
          <div className="flex flex-col items-end text-right pr-4">
            <Meta
              month={stop.month}
              year={stop.year}
              place={stop.place}
              headline={stop.headline}
              blurb={stop.blurb}
              align="right"
            />
          </div>
        ) : (
          <div className="flex justify-end pr-4">
            {photos.length > 0 && <PhotoCluster photos={photos} seed={seed} />}
          </div>
        )}

        {/* Center dot */}
        <div className="flex justify-center pt-[0.35rem]">
          <div className="w-5 h-5 rounded-full border-2 border-primary/40 bg-background flex items-center justify-center shrink-0">
            <div className="w-[6px] h-[6px] rounded-full bg-primary" />
          </div>
        </div>

        {/* Right column */}
        {side === "right" ? (
          <div className="pl-4">
            <Meta
              month={stop.month}
              year={stop.year}
              place={stop.place}
              headline={stop.headline}
              blurb={stop.blurb}
              align="left"
            />
          </div>
        ) : (
          <div className="pl-4">
            {photos.length > 0 && <PhotoCluster photos={photos} seed={seed} />}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default RoadmapStop;
