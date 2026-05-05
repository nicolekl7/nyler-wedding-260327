import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";

const weddingDate = new Date("2026-09-17T16:30:00+02:00");

const content = {
  en: {
    dateLine: "September 17, 2026 | Tuscany, Italy",
    dateLineLong: "September 17, 2026 | Rapolano Terme, Tuscany, Italy",
    welcome: (
      <>
        We're getting married in Tuscany on September 17, 2026, and we would absolutely love for
        you to be there. There will be three days of festivities at Borgo Laticastelli—a private
        estate in the hills of Rapolano Terme—with a welcome party on Wednesday evening, the
        wedding ceremony and reception on Thursday, and a relaxed <em>il dolce far niente</em> day by the
        pool on Friday.
        <br />
        <br />
        We know Italy is a long way to travel, so we mean it: no pressure. But for those who make
        the trip, we promise every day will be worth it. Our guest list is small and the estate is
        intimate—please <strong>RSVP by June 16th</strong> so we can plan accordingly and ensure your spot is
        reserved.
      </>
    ),
    rsvpBtn: "RSVP Here",
    countdown: "Countdown to Tuscany",
    days: "Days",
  },
  pl: {
    dateLine: "17 września 2026 | Toskania, Włochy",
    dateLineLong: "17 września 2026 | Rapolano Terme, Toskania, Włochy",
    welcome: (
      <>
        Pobieramy się w Toskanii 17 września 2026 roku i bardzo chcielibyśmy, żebyś był/była z nami.
        Czekają nas trzy dni świętowania w Borgo Laticastelli — prywatnej posiadłości na wzgórzach
        Rapolano Terme — z przyjęciem powitalnym w środowy wieczór, ceremonią ślubną i weselem w
        czwartek oraz leniwym dniem przy basenie w piątek, w duchu włoskiego{" "}
        <em>dolce far niente</em>.
        <br />
        <br />
        Wiemy, że Włochy to daleka droga, więc mówimy szczerze: bez żadnej presji. Ale dla tych,
        którzy zdecydują się przyjechać, obiecujemy, że każdy dzień będzie wart tej podróży. Lista
        gości jest krótka, a posiadłość kameralna — prosimy o{" "}
        <strong>potwierdzenie obecności do 16 czerwca</strong>, abyśmy mogli odpowiednio zaplanować
        i zarezerwować dla Ciebie miejsce.
      </>
    ),
    rsvpBtn: "Potwierdź obecność",
    countdown: "Odliczanie dni",
    days: "Dni",
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

      {/* Welcome */}
      <section className="page-section pt-6 sm:pt-8 md:pt-12 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="body-editorial mx-auto text-balance">
            {t.welcome}
          </p>
          <Link
            to="/rsvp-v2"
            className="inline-block mt-10 border border-foreground rounded-full px-8 py-3 font-serif text-sm tracking-widest uppercase text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            {t.rsvpBtn}
          </Link>
        </FadeIn>
      </section>

      {/* Countdown — days only */}
      <section className="page-section pt-0 pb-0 mt-8 sm:mt-2 w-[90%] max-w-[1200px] mx-auto text-center">
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
