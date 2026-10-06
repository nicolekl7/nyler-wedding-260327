import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/archive/components/Layout";
import FadeIn from "@/archive/components/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";

const weddingDate = new Date("2026-09-17T16:30:00+02:00");

const content = {
  en: {
    dateLine: "September 17, 2026 | Tuscany, Italy",
    dateLineLong: "September 17, 2026 | Rapolano Terme, Tuscany, Italy",
    welcome: [
      "We are so excited to have our friends and family join us in Tuscany for this celebration!",
      "Three days of festivities await at Borgo Laticastelli, a private estate in the hills of Rapolano Terme. We'll kick things off Wednesday evening with our La Notte Bianca welcome party, followed by the ceremony and reception on Thursday, and a recovery day of relaxing activities on Friday. Visit the itinerary page for timing and attire and the travel page for everything you need to get here.",
    ],
    closing: "See you in Tuscany. Ciao!",
    signature: "xx Tyler & Nicole",
    countdown: "Countdown to Tuscany",
    days: "Days",
    itineraryBtn: "Itinerary",
    travelBtn: "Travel",
  },
  pl: {
    dateLine: "17 września 2026 | Toskania, Włochy",
    dateLineLong: "17 września 2026 | Rapolano Terme, Toskania, Włochy",
    welcome: [
      "Bardzo się cieszymy, że nasi przyjaciele i rodzina dołączą do nas w Toskanii na tę uroczystość!",
      "Czekają nas trzy dni świętowania w Borgo Laticastelli — prywatnej posiadłości na wzgórzach Rapolano Terme. Zaczynamy w środowy wieczór przyjęciem powitalnym La Notte Bianca, w czwartek odbędzie się ceremonia i wesele, a piątek to dzień relaksu i lżejszych aktywności. Na stronie planu znajdziesz godziny i dress code i na stronie podróży wszystko, czego potrzebujesz, aby do nas dotrzeć.",
    ],
    closing: "Do zobaczenia w Toskanii. Ciao!",
    signature: "xx Tyler i Nicole",
    countdown: "Odliczanie dni",
    days: "Dni",
    itineraryBtn: "Plan",
    travelBtn: "Podróż",
  },
};

const Index = () => {
  const [daysLeft, setDaysLeft] = useState(getDaysLeft());
  const { language } = useLanguage();
  const t = content[language];

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
          className="absolute inset-0 w-full h-full object-cover pointer-events-none [&::-webkit-media-controls-start-playback-button]:hidden [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-panel]:hidden"
          style={{ WebkitAppearance: "none" } as React.CSSProperties}
        >
          <source src="https://res.cloudinary.com/dx9jqeqxj/video/upload/v1774652318/hero-tuscany-video_vkp2gn.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/90 via-[#1a2e1a]/20 to-transparent" />
        <FadeIn className="relative z-10 px-6 md:px-12 lg:px-24 pb-16 md:pb-24">
          <h1 className="heading-display mb-4 text-[#fff7f0]" style={{ fontSize: "clamp(3rem, 12vw, 9rem)" }}>
            Nicole <span className="font-light italic">&</span> Tyler
          </h1>
          <p className="heading-sub tracking-[0.158em] text-[#fff7f0] opacity-75" style={{ fontSize: "clamp(0.65rem, 1.5vw, 1.1rem)" }}>
            <span className="inline sm:hidden">{t.dateLine}</span>
            <span className="hidden sm:inline">{t.dateLineLong}</span>
          </p>
        </FadeIn>
      </section>

      {/* Welcome — styled like the live site's thank-you note */}
      <div className="bg-[#464320] text-cream">
        <section className="w-[90%] max-w-[1200px] mx-auto py-16 md:py-24 text-center">
          <FadeIn>
            <div className="w-12 h-px bg-cream/40 mx-auto mb-6" />
            {t.welcome.map((para, i) => (
              <p
                key={i}
                className={`heading-card italic tracking-wide leading-relaxed text-cream mx-auto max-w-2xl text-pretty${i > 0 ? " mt-6" : ""}`}
              >
                {para}
              </p>
            ))}
            <p className="heading-card italic tracking-wide leading-relaxed text-cream mx-auto max-w-2xl text-pretty mt-6">
              {t.closing}
            </p>
            <p className="body-small tracking-[0.2em] uppercase text-cream/70 mt-8">
              {t.signature}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/archive/the-weekend"
                className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-cream rounded-full px-8 py-3 text-cream hover:bg-cream hover:text-[#464320] transition-colors duration-300"
              >
                {t.itineraryBtn}
              </Link>
              <Link
                to="/archive/travel"
                className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-cream rounded-full px-8 py-3 text-cream hover:bg-cream hover:text-[#464320] transition-colors duration-300"
              >
                {t.travelBtn}
              </Link>
            </div>
          </FadeIn>
        </section>
      </div>

      {/* Countdown — days only */}
      <section className="page-section pb-0 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="heading-sub mb-3">{t.countdown}</p>
          <span className="font-serif text-5xl sm:text-6xl md:text-8xl font-light text-foreground">
            {daysLeft}
          </span>
          <p className="heading-sub mt-4 mb-0">{t.days}</p>
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
