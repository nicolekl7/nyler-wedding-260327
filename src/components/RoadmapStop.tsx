import FadeIn from "@/components/FadeIn";
import PhotoStack from "@/components/PhotoStack";

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

const Meta = ({
  month, year, place, headline, blurb, align,
}: {
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
  // Stable seed from year string + index
  const seed = stop.year.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + index * 37;

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
            month={stop.month} year={stop.year} place={stop.place}
            headline={stop.headline} blurb={stop.blurb} align="left"
          />
          {photos.length > 0 && <PhotoStack photos={photos} seed={seed} />}
        </div>
      </div>

      {/* Desktop layout: alternating sides */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_2rem_1fr] lg:items-start lg:gap-x-8">
        {/* Left column */}
        {side === "left" ? (
          <div className="flex flex-col items-end text-right pr-4">
            <Meta
              month={stop.month} year={stop.year} place={stop.place}
              headline={stop.headline} blurb={stop.blurb} align="right"
            />
          </div>
        ) : (
          <div className="flex justify-end pr-4">
            {photos.length > 0 && <PhotoStack photos={photos} seed={seed} />}
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
              month={stop.month} year={stop.year} place={stop.place}
              headline={stop.headline} blurb={stop.blurb} align="left"
            />
          </div>
        ) : (
          <div className="pl-4">
            {photos.length > 0 && <PhotoStack photos={photos} seed={seed} />}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default RoadmapStop;
