import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import RoadmapStop, { RoadmapStopData } from "@/components/RoadmapStop";

import nye1 from "@/assets/2016-12-1.jpeg";
import nye2 from "@/assets/2016-12-2.jpeg";
import dating1 from "@/assets/2017-3-1.jpeg";
import dating2 from "@/assets/2017-3-2.jpeg";
import dating4 from "@/assets/2017-5-1.jpeg";
import florence2 from "@/assets/2017-8-2.jpeg";
import florence3 from "@/assets/2017-11-1.jpeg";
import florence4 from "@/assets/2017-11-2.jpeg";
import purrc1 from "@/assets/2018-5-1.jpeg";
import purrc2 from "@/assets/2018-5-2.jpeg";
import purrc3 from "@/assets/2018-5-3.png";
import mango1 from "@/assets/2019-1.jpeg";
import mango2 from "@/assets/2019-2.jpeg";
import mango3 from "@/assets/2019-3.jpeg";
import ks1 from "@/assets/2020-1.jpeg";
import ks2 from "@/assets/2020-2.jpeg";
import ks3 from "@/assets/2020-3.jpeg";
import ks4 from "@/assets/2020-4.jpeg";
import house1 from "@/assets/2021-1.jpeg";
import house2 from "@/assets/2021-2.jpeg";
import ct1 from "@/assets/2022-1.jpeg";
import ct2 from "@/assets/2022-2.jpeg";
import ct3 from "@/assets/2022-3.jpeg";
import ct4 from "@/assets/2022-4.jpeg";
import ct5 from "@/assets/2022-5.jpeg";
import ct6 from "@/assets/2022-6.jpeg";
import poland1 from "@/assets/2024-1.jpeg";
import poland2 from "@/assets/2024-2.jpeg";
import proposal1 from "@/assets/2025-5-1.jpeg";
import proposal2 from "@/assets/2025-5-2.jpeg";

const stops: RoadmapStopData[] = [
  {
    year: "2016",
    month: "December",
    place: "New York",
    headline: "",
    blurb:
      "Met, talked all night, told our parents we'd get married. When you know, you know.",
    photos: [{ src: nye1 }, { src: nye2 }],
  },
  {
    year: "2017",
    month: "March",
    place: "South Carolina",
    headline: "",
    blurb:
      "Suddenly, monthly flights. One weekend visit and we couldn't stop planning the next.",
    photos: [{ src: dating1 }, { src: dating2 }, { src: dating4 }],
  },
  {
    year: "2017",
    month: "August",
    place: "Italy",
    headline: "",
    blurb:
      "Nicole suggested a break but left a letter for each day she'd be gone. Tyler agreed to break up but bought a flight to visit 3 weeks in. Neither of us were good at this.",
    photos: [{ src: florence2 }, { src: florence3 }, { src: florence4 }],
  },
  {
    year: "2018",
    month: "June",
    place: "Kansas",
    headline: "",
    blurb: "Went to \"just look\" at shelter cats. Welcome Purrcocet!",
    photos: [{ src: purrc1 }, { src: purrc2 }, { src: purrc3 }],
  },
  {
    year: "2019",
    month: "November",
    place: "Kansas",
    headline: "",
    blurb:
      "Tyler who was \"not a cat person\" just had to go back to the shelter to look at cats because Nicole stole Purrc. Welcome Mango!",
    photos: [{ src: mango1 }, { src: mango2 }, { src: mango3 }],
  },
  {
    year: "2020",
    month: "February",
    place: "Kansas",
    headline: "",
    blurb:
      "Just us and really only us because there was a pandemic. First place together. Three weeks in: lockdown. We survived.",
    photos: [{ src: ks1 }, { src: ks2 }, { src: ks3 }, { src: ks4 }],
  },
  {
    year: "2021",
    month: "January",
    place: "Kansas",
    headline: "",
    blurb: "Somehow, homeowners. Still not sure how this happened.",
    photos: [{ src: house1 }, { src: house2 }],
  },
  {
    year: "2022",
    month: "July",
    place: "Connecticut",
    headline: "",
    blurb:
      "Temporarily moved east to be near family. Still in Stamford. Whoops.",
    photos: [
      { src: ct1 },
      { src: ct2 },
      { src: ct3 },
      { src: ct4 },
      { src: ct5 },
      { src: ct6 },
    ],
  },
  {
    year: "2024",
    month: "July",
    place: "Poland",
    headline: "",
    blurb:
      "Babcia pulled Tyler aside and gave him exactly one year to propose. We had already discussed getting married soon — but if Babcia asks, it was entirely her idea.",
    photos: [{ src: poland1 }, { src: poland2 }],
  },
  {
    year: "2025",
    month: "May",
    place: "Amelia Island",
    headline: "",
    blurb:
      "Tyler filled the patio with photos of us. His phone ran out of storage right as Nicole walked out so no one will ever really know what was said. But what we can share is: she did say yes.",
    photos: [{ src: proposal1 }, { src: proposal2 }],
  },
];

const OurStoryV2 = () => {
  return (
    <Layout>
      <article className="bg-background">
        {/* Hero */}
        <header className="w-[90%] mx-auto max-w-4xl pt-20 sm:pt-28 pb-16 text-center">
          <FadeIn>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              December 2016 &mdash; September 2026
            </p>
            <h1 className="heading-display text-foreground">
              The long way{" "}
              <em className="italic font-light">here.</em>
            </h1>
            <div className="w-12 h-px bg-primary/30 mx-auto mt-8 mb-6" />
            <p className="body-editorial mx-auto max-w-md text-balance">
              Ten years of adventures, two cats, one house, and a whole lot of
              care packages — every chapter leading us here.
            </p>
          </FadeIn>
        </header>

        {/* Roadmap */}
        <section className="w-[90%] mx-auto max-w-6xl pb-32 relative">
          {/* Vertical center line — desktop */}
          <div
            aria-hidden
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 w-px"
            style={{
              bottom: "3rem",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--foreground) / 0.25) 0 6px, transparent 6px 14px)",
            }}
          />
          {/* Vertical left rail — mobile */}
          <div
            aria-hidden
            className="lg:hidden absolute left-[12px] top-0 w-px"
            style={{
              bottom: "3rem",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--foreground) / 0.25) 0 6px, transparent 6px 14px)",
            }}
          />

          <ol className="space-y-20 sm:space-y-28">
            {stops.map((stop, i) => (
              <li key={i}>
                <RoadmapStop
                  stop={stop}
                  index={i}
                  side={i % 2 === 0 ? "left" : "right"}
                  isLast={i === stops.length - 1}
                />
              </li>
            ))}
          </ol>
        </section>

        {/* Outro — olive band, cream lettering */}
        <footer className="bg-foreground text-cream">
          <div className="w-[90%] mx-auto max-w-2xl py-28 sm:py-32 text-center">
            <FadeIn>
              <p className="font-body uppercase tracking-[0.3em] text-[0.65rem] text-cream/70 mb-3">
                September · Tuscany · 2026
              </p>
              <h2 className="font-serif italic text-3xl sm:text-4xl font-light text-cream leading-tight mb-4 text-balance">
                Next up, you!
              </h2>
              <p className="font-body text-sm sm:text-base text-cream/80 leading-relaxed text-balance max-w-md mx-auto mb-8">
                Everyone we love, in the most beautiful country in the world.
              </p>
              <p className="font-serif italic text-2xl sm:text-3xl font-light text-cream/90 text-balance">
                See you in Tuscany.
              </p>
            </FadeIn>
          </div>
        </footer>
      </article>
    </Layout>
  );
};

export default OurStoryV2;
