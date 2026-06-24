import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";

const allPhotos = import.meta.glob("../assets/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const getPhotoSrc = (key: string, num: number): string | null => {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const path = `../assets/${key}-${num}.${ext}`;
    if (allPhotos[path]) return allPhotos[path];
  }
  return null;
};

type PhotoKeySpec = string | { key: string; startNum?: number; maxCount?: number };

const collectPhotos = (specs: PhotoKeySpec[], hardMax = 8): string[] => {
  const result: string[] = [];
  for (const spec of specs) {
    if (result.length >= hardMax) break;
    const key = typeof spec === "string" ? spec : spec.key;
    const startNum = typeof spec === "string" ? 1 : (spec.startNum ?? 1);
    const maxCount = typeof spec === "string" ? hardMax : (spec.maxCount ?? hardMax);
    let num = startNum;
    let count = 0;
    while (count < maxCount && result.length < hardMax) {
      const src = getPhotoSrc(key, num);
      if (!src) break;
      result.push(src);
      num++;
      count++;
    }
  }
  return result;
};

const seedFromKey = (spec: PhotoKeySpec): number => {
  const k = typeof spec === "string" ? spec : spec.key;
  return k.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
};

const ScatteredPolaroids = ({
  photos,
  seed,
}: {
  photos: string[];
  seed: number;
}) => {
  const n = photos.length;
  if (n === 0) return null;

  const PS = n === 1 ? 200 : 120; // inner image px
  const PW = PS + 20;              // frame width
  const PH = PS + 46;              // frame height (10px top + image + 36px bottom)

  if (n === 1) {
    const h = ((seed * 13) % 79) / 79;
    return (
      <div className="py-4">
        <motion.div
          className="inline-block bg-white select-none"
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

  // True 2D scatter with absolute positioning
  const CW = Math.round(PW * (0.8 + n * 0.45));
  const CH = Math.round(PH * (0.8 + n * 0.38));

  const getPos = (i: number) => {
    const h1 = ((seed * (i + 5) * 17 + i * 53) % 97) / 97;
    const h2 = ((seed * (i + 5) * 31 + i * 71) % 83) / 83;
    const h3 = ((seed * (i + 5) * 13 + i * 29) % 79) / 79;
    return {
      x: h1 * Math.max(0, CW - PW),
      y: h2 * Math.max(0, CH - PH),
      rot: (h3 * 2 - 1) * 28,
    };
  };

  return (
    <div className="relative my-6" style={{ width: CW, height: CH }}>
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

interface EntryBlock {
  text: string;
  photoKeys: PhotoKeySpec[];
}

interface TimelineEntry {
  month: string;
  title: string;
  text?: string;
  photoKeys?: PhotoKeySpec[];
  blocks?: EntryBlock[];
}

const timelineData: Array<{ year: string; entries: TimelineEntry[] }> = [
  {
    year: "2016",
    entries: [
      {
        month: "December 2016",
        title: "New York",
        text: "It was New Year's Eve. Nicole was visiting her college friend in Stony Point, NY and Tyler had just gotten back from Air Force basic training. They met, started talking, and couldn't stop. By the end of the night they were texting each other's parents to let them know they'd be getting married one day. If it didn't work out? Embarrassing. Since it did? Well, it's when you know, you know.",
        photoKeys: ["2016-12"],
      },
    ],
  },
  {
    year: "2017",
    entries: [
      {
        month: "Spring 2017",
        title: "Dating?",
        blocks: [
          {
            text: "Tyler visited their mutual friend at University of South Carolina and ended up spending the whole trip with Nicole. Who saw that coming? Suddenly they were planning trips to see each other almost every month.",
            photoKeys: ["2017-3", { key: "2017-5", maxCount: 1 }],
          },
          {
            text: "After some not-so-careful consideration, Nicole brought Tyler to meet her whole family at her brother Pat's 30th birthday slash gender reveal. (Spoiler: it's a girl! Hi Luna!) If you were there, you know how it went.",
            photoKeys: [{ key: "2017-5", startNum: 2 }],
          },
        ],
      },
      {
        month: "August 2017",
        title: "Study Abroad",
        text: "Nicole studied abroad in Florence and tried (and failed) to break up with Tyler. She knew they'd end up together forever and didn't want to resent him for holding her back in Italy. Also, Nicole is known for telling her friends to break up with their boyfriends and she had a reputation to uphold. Before she left, she left him a note for every single day she'd be gone. Two months in, Tyler drove five hours and took two layovers to fly to Europe to see her. Neither of them were very good at this.",
        photoKeys: ["2017-8", "2017-11"],
      },
    ],
  },
  {
    year: "2018",
    entries: [
      {
        month: "June 2018",
        title: "Cat #1",
        text: "Nicole and Tyler moved in together for the summer as a test run. Two weeks in, they went to \"just look\" at cats at a shelter and — shocker — went home with one. No carrier, no plan. The shelter worker handed them a box and told them she was in high demand. They took her. Purrcocet has been with them ever since.",
        photoKeys: ["2018-06"],
      },
      {
        month: "September 2018",
        title: "Deployment",
        text: "Tyler deployed to Qatar. Nicole took Purrc to college with her. It was a rough four months after they'd managed to see each other almost every month since they met — but they survived. Lots of care packages to Tyler and surprise Uber Eats Chick-fil-A deliveries to Nicole.",
        photoKeys: ["2018-09"],
      },
    ],
  },
  {
    year: "2019",
    entries: [
      {
        month: "November 2019",
        title: "Cat #2",
        text: "Tyler, who had never owned a cat and would have told you he wasn't a cat person when he first met Nicole, adopted two sisters from the same litter with his roommate. Into their lives comes Mango. His roommate got Beans.",
        photoKeys: ["2019-11"],
      },
    ],
  },
  {
    year: "2020",
    entries: [
      {
        month: "February 2020",
        title: "Kansas",
        text: "Nicole and Tyler finally officially move in together — no roommates, their own apartment. So exciting! A few weeks later: COVID-19. Well, it's a good thing they like each other. It's too bad they had no friends yet. It was a big test. Don't worry — they pass.",
        photoKeys: ["2020-02"],
      },
    ],
  },
  {
    year: "2021",
    entries: [
      {
        month: "January 2021",
        title: "The House",
        text: "Bored and realizing their lease was ending, Tyler and Nicole put some feelers out on houses with their realtor friend. Rough market, not expecting much — they hadn't even told anyone they were looking yet. They found a house they liked and put an offer in, but the seller had a cash offer above asking. Tyler and Nicole refused to go higher, because if it's meant to be, it's meant to be. The sellers chose them anyway, based entirely on vibes. They are still not entirely sure how they own a home.",
        photoKeys: ["2021-01"],
      },
    ],
  },
  {
    year: "2022",
    entries: [
      {
        month: "July 2022",
        title: "CT Bound",
        text: "Tyler and Nicole moved to the Northeast to be closer to their families, since they both work remote. They got a sublease in Stamford to figure out their next move. Spoiler: they are still in the same city. Whoops.",
        photoKeys: ["2022-07"],
      },
    ],
  },
  {
    year: "2024",
    entries: [
      {
        month: "July 2024",
        title: "Babcia's Birthday",
        text: "The whole family flew to Poland for Babcia's 90th birthday — her 89th, actually, because Nicole's mom did the math wrong. At some point during the trip, Babcia pulled Tyler aside and told him he had one year to propose. Thankfully, Tyler and Nicole had already talked about getting married — but if Babcia asks, it was because of her.",
        photoKeys: ["2024-07"],
      },
    ],
  },
  {
    year: "2025",
    entries: [
      {
        month: "May 2025",
        title: "The Proposal",
        text: "Under the guise of visiting his sister, Tyler planned an entire weekend at a resort in Amelia Island — a stunning town off the coast of Jacksonville. He set up the proposal while Nicole was getting ready for dinner. For those who know her, this gave him ample time. He filled their hotel suite's patio with dozens of photos from their life together and said a bunch of cute stuff. We don't know exactly what because his phone ran out of storage right as Nicole came into view. As we were saying — she takes a while. Anyway, she said yes.",
        photoKeys: ["2025-05"],
      },
    ],
  },
  {
    year: "2026",
    entries: [
      {
        month: "September 2026",
        title: "Tuscany",
        text: "Everyone they love, in the most beautiful country in the world. Let's do it.",
        photoKeys: [],
      },
    ],
  },
];

const OurStory = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end end"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.98], ["0%", "100%"]);

  return (
    <Layout>
      {/* Header */}
      <section className="page-section w-[90%] max-w-[1000px] mx-auto text-center">
        <FadeIn>
          <p className="heading-sub text-muted-foreground mb-4">
            December 2016 &mdash; September 2026
          </p>
          <h1 className="heading-section mb-4">Our Love Story</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto max-w-xl text-balance">
            Ten years of adventures, two cats, one house, and a whole lot of
            care packages — every chapter leading us here.
          </p>
        </FadeIn>
      </section>

      {/* Timeline */}
      <section
        className="w-[90%] max-w-[760px] mx-auto pb-32"
        ref={timelineRef}
      >
        <div className="relative">
          {/* Faint background track */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-primary/10" />

          {/* Growing animated line */}
          <motion.div
            className="absolute left-[22px] top-0 w-px origin-top bg-gradient-to-b from-primary/60 via-primary/35 to-primary/20"
            style={{ height: lineHeight }}
          />

          <div className="space-y-0">
            {timelineData.map((group) => (
              <div key={group.year}>
                {/* Year anchor */}
                <FadeIn delay={0}>
                  <div className="relative pl-16 pt-14 pb-1">
                    <p
                      className="font-serif font-light leading-none select-none"
                      style={{
                        fontSize: "clamp(3.5rem, 10vw, 6rem)",
                        color: "hsl(var(--primary) / 0.10)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {group.year}
                    </p>
                  </div>
                </FadeIn>

                {/* Entries */}
                {group.entries.map((entry, entryIndex) => {
                  const keySpecs = entry.photoKeys ?? [];
                  const simplePhotos =
                    !entry.blocks && keySpecs.length > 0
                      ? collectPhotos(keySpecs)
                      : [];
                  const simpleSeed =
                    !entry.blocks && keySpecs.length > 0
                      ? seedFromKey(keySpecs[0])
                      : 0;

                  return (
                    <FadeIn
                      key={`${group.year}-${entryIndex}`}
                      delay={entryIndex * 120}
                    >
                      <div className="relative pl-16 py-8 pb-10">
                        {/* Entry dot */}
                        <div className="absolute left-[14px] top-[2.6rem] w-[18px] h-[18px] rounded-full border-2 border-primary/40 bg-background flex items-center justify-center">
                          <div className="w-[6px] h-[6px] rounded-full bg-primary" />
                        </div>

                        <p className="heading-sub text-muted-foreground mb-3">
                          {entry.month}
                        </p>
                        <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.1rem] font-light text-foreground mb-4 leading-snug">
                          {entry.title}
                        </h2>

                        {entry.blocks ? (
                          entry.blocks.map((block, bi) => {
                            const photos = collectPhotos(block.photoKeys);
                            const seed =
                              block.photoKeys.length > 0
                                ? seedFromKey(block.photoKeys[0])
                                : 0;
                            return (
                              <div key={bi} className={bi > 0 ? "mt-8" : ""}>
                                <p className="body-editorial text-muted-foreground mb-4 max-w-prose">
                                  {block.text}
                                </p>
                                <ScatteredPolaroids photos={photos} seed={seed} />
                              </div>
                            );
                          })
                        ) : (
                          <>
                            <p className="body-editorial text-muted-foreground mb-7 max-w-prose">
                              {entry.text}
                            </p>
                            {simplePhotos.length > 0 && (
                              <ScatteredPolaroids
                                photos={simplePhotos}
                                seed={simpleSeed}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="w-[90%] max-w-[900px] mx-auto px-6 md:px-12 pb-24">
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              ← Schedule
            </Link>
            <Link
              to="/the-weekend"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              The Attire →
            </Link>
            <Link
              to="/rsvp-v2"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              RSVP
            </Link>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default OurStory;
