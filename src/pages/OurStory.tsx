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
        title: "The Beginning",
        text: "Add your story here — how you first met, what you remember about that moment, what you were both thinking. This is your space to tell it in your own words.",
        photos: 2,
      },
    ],
  },
  {
    year: "2017",
    entries: [
      {
        month: "Spring 2017",
        title: "First Trip Together",
        text: "Add your story here — what those early months looked like, the places you went, the things you discovered about each other.",
        photos: 1,
      },
      {
        month: "Fall 2017",
        title: "Making It Official",
        text: "Add your story here — a milestone, a conversation, a moment that shifted everything and made this feel real.",
        photos: 2,
      },
    ],
  },
  {
    year: "2018",
    entries: [
      {
        month: "Spring 2018",
        title: "New Beginnings",
        text: "Add your story here — what this season brought, where you went, what changed between you.",
        photos: 2,
      },
      {
        month: "Winter 2018",
        title: "The Holidays",
        text: "Add your story here — the first holidays together, what that felt like, the small things you still remember.",
        photos: 1,
      },
    ],
  },
  {
    year: "2019",
    entries: [
      {
        month: "Summer 2019",
        title: "A Summer to Remember",
        text: "Add your story here — the adventures, the places you explored, the memories that became your favorites.",
        photos: 2,
      },
      {
        month: "Fall 2019",
        title: "The Next Step",
        text: "Add your story here — a big decision, a new chapter, something that brought you even closer.",
        photos: 1,
      },
    ],
  },
  {
    year: "2020",
    entries: [
      {
        month: "Spring 2020",
        title: "Together Through Everything",
        text: "Add your story here — what this year taught you, how you leaned on each other, what you built when the world slowed down.",
        photos: 2,
      },
      {
        month: "Late 2020",
        title: "Finding Our Rhythm",
        text: "Add your story here — the routines, the rituals, the little things that became your own.",
        photos: 1,
      },
    ],
  },
  {
    year: "2021",
    entries: [
      {
        month: "Spring 2021",
        title: "Opening Up Again",
        text: "Add your story here — the first trips back, the things you did with newfound appreciation, the adventures you finally had.",
        photos: 1,
      },
      {
        month: "Fall 2021",
        title: "New Adventures",
        text: "Add your story here — a place you went, something you tried, a memory that stands out from this time.",
        photos: 2,
      },
    ],
  },
  {
    year: "2022",
    entries: [
      {
        month: "Summer 2022",
        title: "Our Favorite Summer",
        text: "Add your story here — what made this summer special, where you were, what you were loving about life together.",
        photos: 2,
      },
      {
        month: "Winter 2022",
        title: "A New Home",
        text: "Add your story here — a milestone, a move, or a moment that marked this chapter of your lives.",
        photos: 1,
      },
    ],
  },
  {
    year: "2023",
    entries: [
      {
        month: "Spring 2023",
        title: "Growing Together",
        text: "Add your story here — how you had grown, what felt different, what felt more like you than ever.",
        photos: 2,
      },
      {
        month: "Fall 2023",
        title: "A Moment to Remember",
        text: "Add your story here — something that shifted, a trip, a decision, a night you still talk about.",
        photos: 1,
      },
    ],
  },
  {
    year: "2024",
    entries: [
      {
        month: "Summer 2024",
        title: "The Question",
        text: "Add your story here — how it happened, what you said, what you felt, and everything that followed.",
        photos: 2,
      },
      {
        month: "Winter 2024",
        title: "Planning Begins",
        text: "Add your story here — the excitement of planning, the decisions you made together, the joy of looking forward.",
        photos: 1,
      },
    ],
  },
  {
    year: "2025",
    entries: [
      {
        month: "May 2025",
        title: "Forever Begins",
        text: "Add your story here — the engagement, the celebration, the moment you knew with everything in you that this was it.",
        photos: 2,
      },
    ],
  },
];

const PhotoPlaceholder = ({ index }: { index: number }) => (
  <div className="aspect-[3/2] bg-stone-light/50 border border-border/40 flex flex-col items-center justify-center gap-2 group">
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
            December 2016 &mdash; May 2025
          </p>
          <h1 className="heading-section mb-4">Our Love Story</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto max-w-xl text-balance">
            Eight years of adventures, laughter, and growing together —
            every chapter leading us here.
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
            {timelineData.map((group, groupIndex) => (
              <div key={group.year}>
                {/* Year anchor */}
                <FadeIn delay={0}>
                  <div className="relative pl-16 pt-14 pb-1">
                    {/* Larger year dot */}
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
                      {entry.photos === 1 ? (
                        <div className="max-w-[380px]">
                          <PhotoPlaceholder index={0} />
                        </div>
                      ) : (
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

          {/* End cap */}
          <FadeIn delay={0}>
            <div className="relative pl-16 pt-4 pb-2">
              <div className="absolute left-[9px] top-[1.2rem] w-[27px] h-[27px] rounded-full bg-stone-light/60 border border-primary/25 flex items-center justify-center">
                <div className="w-[10px] h-[10px] rounded-full bg-primary/40" />
              </div>
              <p className="font-serif text-lg italic text-muted-foreground/60 mt-1">
                and the story continues…
              </p>
            </div>
          </FadeIn>
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
