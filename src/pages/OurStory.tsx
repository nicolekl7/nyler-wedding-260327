import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";

const timelineData = [
  {
    year: "2016",
    entries: [
      {
        month: "December 2016",
        title: "New York",
        text: "It was New Year's Eve. Nicole was visiting her college friend in Stony Point, NY and Tyler had just gotten back from Air Force basic training. They met, started talking, and couldn't stop. By the end of the night they were texting each other's parents to let them know they'd be getting married one day. If it didn't work out? Embarrassing. Since it did? Well, it's when you know, you know.",
        photos: 2,
      },
    ],
  },
  {
    year: "2017",
    entries: [
      {
        month: "Spring 2017",
        title: "Dating?",
        text: "Tyler visited their mutual friend at University of South Carolina and ended up spending the whole trip with Nicole. Who saw that coming? Suddenly they were planning trips to see each other almost every month. After some not-so-careful consideration, Nicole brought Tyler to meet her whole family at her brother Pat's 30th birthday slash gender reveal. (Spoiler: it's a girl! Hi Luna!) If you were there, you know how it went.",
        photos: 2,
      },
      {
        month: "August 2017",
        title: "Study Abroad",
        text: "Nicole studied abroad in Florence and tried (and failed) to break up with Tyler. She knew they'd end up together forever and didn't want to resent him for holding her back in Italy. Also, Nicole is known for telling her friends to break up with their boyfriends and she had a reputation to uphold. Before she left, she left him a note for every single day she'd be gone. Two months in, Tyler drove five hours and took two layovers to fly to Europe to see her. Neither of them were very good at this.",
        photos: 2,
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
        photos: 1,
      },
      {
        month: "September 2018",
        title: "Deployment",
        text: "Tyler deployed to Qatar. Nicole took Purrc to college with her. It was a rough four months after they'd managed to see each other almost every month since they met — but they survived. Lots of care packages to Tyler and surprise Uber Eats Chick-fil-A deliveries to Nicole.",
        photos: 1,
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
        photos: 1,
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
        photos: 2,
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
        photos: 2,
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
        photos: 1,
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
        photos: 2,
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
        photos: 2,
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
        photos: 0,
      },
    ],
  },
];

const PhotoPlaceholder = ({ index }: { index: number }) => (
  <div className="aspect-[3/2] bg-stone-light/50 border border-border/40 flex flex-col items-center justify-center gap-2">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-muted-foreground/30"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M8 5l1.5-2h5L16 5" />
    </svg>
    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
      Photo {index + 1}
    </span>
  </div>
);

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
            Ten years of adventures, two cats, one house, and a whole lot of care packages — every chapter leading us here.
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
                    <div className="absolute left-[11px] top-[3.5rem] w-[23px] h-[23px] rounded-full bg-background border-2 border-primary/25 flex items-center justify-center">
                      <div className="w-[7px] h-[7px] rounded-full bg-primary/50" />
                    </div>
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
                {group.entries.map((entry, entryIndex) => (
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
                      <p className="body-editorial text-muted-foreground mb-6 max-w-prose">
                        {entry.text}
                      </p>

                      {/* Photos */}
                      {entry.photos === 1 && (
                        <div className="max-w-[380px]">
                          <PhotoPlaceholder index={0} />
                        </div>
                      )}
                      {entry.photos === 2 && (
                        <div className="grid grid-cols-2 gap-3 max-w-[480px]">
                          <PhotoPlaceholder index={0} />
                          <PhotoPlaceholder index={1} />
                        </div>
                      )}
                    </div>
                  </FadeIn>
                ))}
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
              ← Home
            </Link>
            <Link
              to="/the-weekend"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              The Events →
            </Link>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default OurStory;
