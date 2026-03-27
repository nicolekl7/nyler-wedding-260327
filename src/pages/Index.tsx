import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-tuscany-video.mov";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";

const weddingDate = new Date("2026-09-17T16:30:00+02:00");

const Index = () => {
  const [daysLeft, setDaysLeft] = useState(getDaysLeft());

  useEffect(() => {
    const timer = setInterval(() => setDaysLeft(getDaysLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      {/* Hero — video background */}
      <section className="relative h-[85vh] flex items-end overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ WebkitAppearance: "none" } as React.CSSProperties}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/90 via-[#1a2e1a]/20 to-transparent" />
        <FadeIn className="relative z-10 px-6 md:px-12 lg:px-24 pb-16 md:pb-24">
          <h1 className="heading-display mb-4 text-[#fff7f0]">
            Nicole <span className="font-light italic">&</span> Tyler
          </h1>
          <p className="heading-sub text-[#fff7f0] opacity-75">
            September 17, 2026 &nbsp;|&nbsp; Rapolano Terme, Tuscany, Italy
          </p>
        </FadeIn>
      </section>

      {/* Welcome */}
      <section className="page-section pt-6 sm:pt-8 md:pt-12 w-[80%] max-w-[950px] mx-auto text-center">
        <FadeIn>
          
          <p className="body-editorial mx-auto text-balance">
            We're getting married in Tuscany on September 17, 2026, and we would absolutely love for
            you to be there. We've planned a long weekend at Borgo Laticastelli—a private estate in
            Rapolano Terme—with a welcome party on Wednesday evening, the ceremony and reception on
            Thursday, and a pool day on Friday to help us recover (physically and emotionally).
          </p>
          <p className="body-editorial mx-auto mt-6">
            We know Italy is a long way to travel, and we mean it when we say there is no pressure.
            Please let us know if you are able to join us by submitting your official RSVP below.
            For those who can make it, we promise a weekend that is worth every mile.
          </p>
          <Link
            to="/rsvp-v2"
            className="inline-block mt-10 border border-foreground rounded-full px-8 py-3 font-serif text-sm tracking-widest uppercase text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            RSVP Here
          </Link>
        </FadeIn>
      </section>


      {/* Countdown — days only */}
      <section className="page-section pt-0 pb-0 mt-0 sm:-mt-16 w-[90%] max-w-[1000px] mx-auto text-center">
        <FadeIn>
          <p className="heading-sub mb-10">Countdown to Tuscany</p>
          <span className="font-serif text-5xl sm:text-6xl md:text-8xl font-light text-foreground">
            {daysLeft}
          </span>
          <p className="heading-sub mt-4 mb-0">Days</p>
        </FadeIn>
      </section>
    </Layout>
  );
};

function getDaysLeft() {
  const diff = Math.max(0, weddingDate.getTime() - Date.now());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default Index;
