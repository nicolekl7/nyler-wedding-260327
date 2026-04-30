import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";

import p1 from "@/assets/photobooth/pb-1.jpg";
import p2 from "@/assets/photobooth/pb-2.jpg";
import p3 from "@/assets/photobooth/pb-3.jpg";
import p4 from "@/assets/photobooth/pb-4.jpg";
import p5 from "@/assets/photobooth/pb-5.jpg";

const photos = [p1, p2, p3, p4, p5];

const HomeV2 = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    photos.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  return (
    <Layout dark>
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-24 sm:py-32 overflow-x-hidden">
        <FadeIn>
          <div className="flex flex-col items-center text-center -translate-y-[20px]">
            {/* Names + photo row — photo sits BETWEEN the names, matching their cap-height */}
            <div className="relative">
              {/* Giant faded ampersand behind everything, spans full height */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 sm:hidden flex items-center justify-center font-serif italic text-foreground/10 leading-none select-none z-0"
                style={{ fontSize: "min(110vw, 90vh)", transform: "translateY(-8%) scaleY(1.4)", transformOrigin: "center" }}
              >
                &amp;
              </span>

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-center gap-1 sm:gap-[2vw] sm:w-[100vw] sm:max-w-[100vw] sm:px-[3vw] sm:-mx-6 sm:box-border">
                <h1 className="font-serif font-normal text-foreground tracking-tight leading-none text-[29vw] sm:text-[14vw] w-full sm:w-auto text-center sm:flex-1 sm:flex sm:items-end sm:justify-end">
                  NICOLE
                </h1>

                {/* Photobooth — stacked 4:3 on mobile, inline 4:5 (matching names' cap-height) on sm+ */}
                <div
                  className="relative bg-background border border-foreground/10 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] overflow-hidden shrink-0 w-screen aspect-[4/3] sm:w-auto sm:aspect-[4/5] sm:h-[11vw] sm:self-end sm:mb-[1.2vw]"
                  aria-label="A rotating photo of Nicole and Tyler"
                >
                  <img
                    src={photos[idx]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>

                <h1 className="font-serif font-normal text-foreground tracking-tight leading-none text-[30vw] sm:text-[14vw] w-full sm:w-auto text-center -translate-y-[12px] -translate-x-[16px] sm:flex-1 sm:flex sm:items-end sm:justify-start sm:translate-y-0 sm:translate-x-0">
                  T<span className="tracking-[0.04em]"></span>YLER
                </h1>
              </div>
            </div>

            {/* Subline */}
            <p className="mt-10 sm:mt-14 font-body uppercase tracking-[0.2em] text-xs sm:text-sm text-muted-foreground">
              September 17, 2026<span className="hidden sm:inline">&nbsp;|&nbsp;Tuscany, Italy</span><span className="block sm:hidden mt-2">Tuscany, Italy</span>
            </p>

            <Link
              to="/rsvp-v2"
              className="inline-block mt-10 border border-foreground rounded-full px-8 py-3 font-serif text-xs tracking-[0.3em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              RSVP
            </Link>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default HomeV2;
