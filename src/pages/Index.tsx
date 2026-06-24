import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";

const weddingDate = new Date("2026-09-17T16:30:00+02:00");

const content = {
  en: {
    dateLine: "September 17, 2026 | Tuscany, Italy",
    dateLineLong: "September 17, 2026 | Rapolano Terme, Tuscany, Italy",
    welcome: "There is no place more beautiful and no group of people we’d rather share it with. Thank you for deciding to make the journey to celebrate with us! Details for our wedding weekend are below. Ci vediamo in Italia!",
    signature: "xx Tyler & Nicole",
    countdown: "Countdown to Tuscany",
    days: "Days",
    scheduleTitle: "The Weekend Timeline",
    wednesday: "09.16.2026",
    thursday: "09.17.2026",
    friday: "09.18.2026",
    saturday: "09.19.2026",
    moreInfo: "*More information to follow",
  },
  pl: {
    dateLine: "17 września 2026 | Toskania, Włochy",
    dateLineLong: "17 września 2026 | Rapolano Terme, Toskania, Włochy",
    welcome: "Nie ma piękniejszego miejsca i wspanialszej grupy ludzi, z którą wolelibyśmy się nim podzielić. Dziękujemy, że zdecydowaliście się na tę podróż, aby świętować razem z nami! Szczegóły dotyczące naszego weekendu weselnego znajdują się poniżej. Ci vediamo in Italia!",
    signature: "xx Tyler i Nicole",
    countdown: "Odliczanie dni",
    days: "Dni",
    scheduleTitle: "Harmonogram Weekendu",
    wednesday: "16.09.2026",
    thursday: "17.09.2026",
    friday: "18.09.2026",
    saturday: "19.09.2026",
    moreInfo: "*Więcej informacji wkrótce",
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
      <section className="page-section pt-16 md:pt-24 pb-12 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="font-serif italic text-xl md:text-2xl lg:text-3xl font-light tracking-wide leading-relaxed text-foreground mx-auto max-w-2xl text-pretty">
            {t.welcome}
          </p>
          <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground mt-8">
            {t.signature}
          </p>
        </FadeIn>
      </section>

      {/* Timeline Section */}
      <section className="bg-[#464320] text-[#fff7f0] py-16 md:py-24 overflow-hidden">
        <div className="w-[90%] max-w-[1000px] mx-auto">
          <FadeIn>
            <h2 className="heading-section italic text-center mb-16 opacity-95">
              {t.scheduleTitle}
            </h2>
          </FadeIn>

          <div className="space-y-12 md:space-y-16">
            {/* Wednesday */}
            <FadeIn delay={50}>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 pt-6 border-t border-[#fff7f0]/20">
                <div className="font-body tracking-wider text-xl opacity-90">{t.wednesday}</div>
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
                <div className="font-body tracking-wider text-xl opacity-90">{t.thursday}</div>
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
                <div className="font-body tracking-wider text-xl opacity-90">{t.friday}</div>
                <div className="md:col-span-2 space-y-6 font-body text-sm tracking-wide">
                  <div>
                    <span className="font-medium inline-block w-24">9:00 AM</span>
                    <span className="opacity-90">Breakfast (until 11:00 AM)</span>
                  </div>

                  {/* Option 1 */}
                  <div className="border-l-2 border-[#fff7f0]/30 pl-4 space-y-3">
                    <h4 className="italic text-base text-[#fff7f0]">
                      {language === "en" ? "Option #1: The Borgo Pool Party" : "Opcja #1: Pool Party w Borgo"}
                    </h4>
                    <p className="text-xs opacity-75 max-w-xl leading-relaxed">
                      {language === "en"
                        ? "A lively afternoon of sun, music, and an open spritz bar by the main pool for those looking to stay on-site and keep the energy high."
                        : "Tętniące życiem popołudnie przy głównym basenie z muzyką i otwartym barem z drinkami."}
                    </p>
                    <div className="text-xs space-y-2 pt-1 border-t border-[#fff7f0]/10 mt-2">
                      <div>
                        <span className="font-medium inline-block w-20">1:00 PM</span>
                        <span className="opacity-90">Spritz Pool Party &amp; Lounge</span>
                      </div>
                      <div>
                        <span className="font-medium inline-block w-20">7:00 PM</span>
                        <span className="opacity-90">{language === "en" ? "Shuttle pick up for Rapolano Terme dinner" : "Transfer na kolację w Rapolano Terme"}</span>
                      </div>
                      <div>
                        <span className="font-medium inline-block w-20">7:30 PM</span>
                        <span className="opacity-90">{language === "en" ? "Dinner in Rapolano Terme" : "Kolacja w Rapolano Terme"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div className="border-l-2 border-[#fff7f0]/30 pl-4 space-y-3">
                    <h4 className="italic text-base text-[#fff7f0]">
                      {language === "en" ? "Option #2: Siena & Winery Excursion" : "Opcja #2: Wycieczka do Sieny i Winnicy"}
                    </h4>
                    <p className="text-xs opacity-75 max-w-xl leading-relaxed">
                      {language === "en"
                        ? "Grazyna and Waldemar Landmesser welcome family and friends to join them on a trip to explore Tuscany. A beautiful, curated daytime tour exploring historic Siena followed by a scenic wine tasting lunch in the Tuscan hills. More information to follow."
                        : "Grażyna i Waldemar Landmesser zapraszają rodzinę i przyjaciół do wspólnego odkrywania Toskanii. Piękna, zorganizowana wycieczka po zabytkowej Sienie, a następnie obiad z degustacją wina wśród toskańskich wzgórz. Więcej informacji wkrótce."}
                    </p>
                    <div className="text-xs pt-1 border-t border-[#fff7f0]/10 mt-2">
                      <span className="font-medium inline-block w-20">12:00 PM</span>
                      <span className="opacity-90">Shuttle pick up from Borgo</span>
                    </div>
                  </div>

                  {/* Note at the bottom of Friday's stack */}
                  <div className="text-xs italic opacity-65 pt-2">
                    {t.moreInfo}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Saturday */}
            <FadeIn delay={200}>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 pt-6 pb-6 border-t border-b border-[#fff7f0]/20">
                <div className="font-body tracking-wider text-xl opacity-90">{t.saturday}</div>
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
      <section className="page-section pt-16 pb-12 w-[90%] max-w-[1200px] mx-auto text-center">
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
