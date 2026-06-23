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
        We are so excited to have our friends and family join us in Tuscany for this celebration! Three days of festivities await at Borgo Laticastelli, a private estate in the hills of
        Rapolano Terme. We'll kick things off Wednesday evening with our La Notte Bianca welcome
        party, followed by the ceremony and reception on Thursday, and a recovery day of relaxing
        activities on Friday. Visit the itinerary page for timing and attire and the travel page
        for everything you need to get here.
        <br />
        <br />
        See you in Tuscany. Ciao!
        <br />
        <br />
        xx Tyler &amp; Nicole
      </>
    ),
    countdown: "Countdown to Tuscany",
    days: "Days",
    itineraryBtn: "Itinerary",
    scheduleTitle: "The Weekend Timeline",
    wednesday: "Wednesday, Sept 16",
    thursday: "Thursday, Sept 17",
    friday: "Friday, Sept 18",
    saturday: "Saturday, Sept 19",
  },
  pl: {
    dateLine: "17 września 2026 | Toskania, Włochy",
    dateLineLong: "17 września 2026 | Rapolano Terme, Toskania, Włochy",
    welcome: (
      <>
        Bardzo się cieszymy, że nasi przyjaciele i rodzina dołączą do nas w Toskanii na tę
        uroczystość! Czekają nas trzy dni świętowania w Borgo Laticastelli — prywatnej posiadłości na wzgórzach
        Rapolano Terme. Zaczynamy w środowy wieczór przyjęciem powitalnym La Notte Bianca, w
        czwartek odbędzie się ceremonia i wesele, a piątek to dzień relaksu i lżejszych aktywności.
        Na stronie planu znajdziesz godziny i dress code i na stronie podróży wszystko, czego
        potrzebujesz, aby do nas dotrzeć.
        <br />
        <br />
        Do zobaczenia w Toskanii. Ciao!
        <br />
        <br />
        xx Tyler i Nicole
      </>
    ),
    countdown: "Odliczanie dni",
    days: "Dni",
    itineraryBtn: "Plan",
    scheduleTitle: "Harmonogram Weekendu",
    wednesday: "Środa, 16 września",
    thursday: "Czwartek, 17 września",
    friday: "Piątek, 18 września",
    saturday: "Sobota, 19 września",
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
      <section className="page-section pt-12 md:pt-20 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="body-editorial mx-auto max-w-3xl text-pretty">
            {navigo => t.welcome}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/the-weekend"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-foreground rounded-full px-8 py-3 text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              {t.itineraryBtn}
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Green Timeline Section matching Screenshot 2026-06-23 at 5.05.14 PM.jpg */}
      <section className="bg-[#1a2e1a] text-[#fff7f0] py-16 md:py-24 my-12 overflow-hidden">
        <div className="w-[90%] max-w-[1000px] mx-auto">
          <FadeIn>
            <h2 className="font-serif italic text-3xl md:text-4xl text-center mb-16 opacity-95">
              {t.scheduleTitle}
            </h2>
          </FadeIn>

          <div className="space-y-12 md:space-y-16">
            {/* Wednesday */}
            <FadeIn delay={50}>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 pt-6 border-t border-[#fff7f0]/20">
                <div className="font-serif italic text-xl md:text-2xl opacity-80">{t.wednesday}</div>
                <div className="md:col-span-2 space-y-4 font-body text-sm tracking-wide">
                  <div>
                    <span className="font-medium inline-block w-24">3:00 PM</span>
                    <span className="opacity-90">Check-in</span>
                  </div>
                  <div>
                    <span className="font-medium inline-block w-24">7:30 PM</span>
                    <span className="opacity-90">Welcome Dinner</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Thursday */}
            <FadeIn delay={100}>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 pt-6 border-t border-[#fff7f0]/20">
                <div className="font-serif italic text-xl md:text-2xl opacity-80">{t.thursday}</div>
                <div className="md:col-span-2 space-y-4 font-body text-sm tracking-wide">
                  <div>
                    <span className="font-medium inline-block w-24">8:00 AM</span>
                    <span className="opacity-90">Breakfast (until 10:00 AM)</span>
                  </div>
                  <div>
                    <span className="font-medium inline-block w-24">5:00 PM</span>
                    <span className="opacity-90">Ceremony</span>
                  </div>
                  <div>
                    <span className="font-medium inline-block w-24">5:30 PM</span>
                    <span className="opacity-90">Cocktail Hour</span>
                  </div>
                  <div>
                    <span className="font-medium inline-block w-24">7:30 PM</span>
                    <span className="opacity-90">Dinner</span>
                  </div>
                  <div>
                    <span className="font-medium inline-block w-24">10:00 PM</span>
                    <span className="opacity-90">Dancing</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Friday */}
            <FadeIn delay={150}>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 pt-6 border-t border-[#fff7f0]/20">
                <div className="font-serif italic text-xl md:text-2xl opacity-80">{t.friday}</div>
                <div className="md:col-span-2 space-y-6 font-body text-sm tracking-wide">
                  <div>
                    <span className="font-medium inline-block w-24">9:00 AM</span>
                    <span className="opacity-90">Breakfast (until 11:00 AM)</span>
                  </div>

                  {/* Track 1 */}
                  <div className="border-l-2 border-[#fff7f0]/30 pl-4 space-y-2">
                    <h4 className="font-serif italic text-base text-[#fff7f0]">
                      {language === "en" ? "The Borgo Pool Party" : "Pool Party w Borgo"}
                    </h4>
                    <p className="text-xs opacity-75 max-w-xl leading-relaxed">
                      {language === "en" 
                        ? "Hosted by Nicole & Tyler. A lively afternoon of sun, music, and an open spritz bar by the main pool for those looking to stay on-site and keep the energy high."
                        : "Gospodarze: Nicole i Tyler. Tętniące życiem popołudnie przy głównym basenie z muzyką i otwartym barem z drinkami."}
                    </p>
                    <div className="text-xs pt-1">
                      <span className="font-medium inline-block w-20">1:00 PM</span>
                      <span className="opacity-90">Spritz Pool Party &amp; Lounge</span>
                    </div>
                  </div>

                  {/* Track 2 */}
                  <div className="border-l-2 border-[#fff7f0]/30 pl-4 space-y-2">
                    <h4 className="font-serif italic text-base text-[#fff7f0]">
                      {language === "en" ? "The Siena & Winery Excursion" : "Wycieczka do Sieny i Winnicy"}
                    </h4>
                    <p className="text-xs opacity-75 max-w-xl leading-relaxed">
                      {language === "en"
                        ? "Organized by Nicole’s parents. A beautiful, curated daytime tour exploring historic Siena followed by a scenic wine tasting lunch in the Tuscan hills."
                        : "Organizacja: Rodzice Nicole. Piękna, spokojna wycieczka z przewodnikiem do zabytkowej Sieny oraz degustacja wina w toskańskich winnicach."}
                    </p>
                    <div className="text-xs pt-1">
                      <span className="font-medium inline-block w-20">12:00 PM</span>
                      <span className="opacity-90">Shuttle pick up from Borgo</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium inline-block w-20">7:00 PM</span>
                      <span className="opacity-90">Shuttle departure for Rapolano Terme dinner</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Saturday */}
            <FadeIn delay={200}>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 pt-6 pb-6 border-t border-b border-[#fff7f0]/20">
                <div className="font-serif italic text-xl md:text-2xl opacity-80">{t.saturday}</div>
                <div className="md:col-span-2 space-y-4 font-body text-sm tracking-wide">
                  <div>
                    <span className="font-medium inline-block w-24">8:00 AM</span>
                    <span className="opacity-90">Breakfast (until 10:00 AM)</span>
                  </div>
                  <div>
                    <span className="font-medium inline-block w-24">12:00 PM</span>
                    <span className="opacity-90">Check out &amp; Arrivederci</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Countdown — days only */}
      <section className="page-section pt-4 pb-12 w-[90%] max-w-[1200px] mx-auto text-center">
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
