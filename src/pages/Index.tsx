import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import welcomeBottle from "@/assets/Welcome-Party-Bottle.png";
import welcomeCup from "@/assets/Welcome-Party-Cup.png";
import weddingIcon from "@/assets/Wedding-4.png";
import poolUmbrella from "@/assets/Pool-Party-Umbrella.png";
import poolChairs from "@/assets/Pool-Party-Chairs.png";
import poolSun from "@/assets/Pool-Party-Sun.png";
import attireGraphic from "@/assets/attire graphic_wedding.png";
import attireGraphicWelcomeParty from "@/assets/attire graphic welcome party.png";

const weddingDate = new Date("2026-09-17T16:30:00+02:00");

type AttireBlock = { label?: string; title: string; body: string };
type ScheduleItem = { time: string; label: string };
type SubSchedule = { heading: string; host: string; details: string; attireBlocks: AttireBlock[] };
type ScheduleDay = {
  date: string;
  title: string;
  items: ScheduleItem[];
  details?: string;
  attireBlocks?: AttireBlock[];
  image?: string;
  imageAlt?: string;
  subSchedules?: SubSchedule[];
};
type LangContent = {
  dateLine: string;
  dateLineLong: string;
  welcome: string;
  signature: string;
  countdown: string;
  days: string;
  heading: string;
  intro: string;
  detailsLabel: string;
  attireLabel: string;
  scheduleLabel: string;
  schedule: ScheduleDay[];
};

const content: Record<"en" | "pl", LangContent> = {
  en: {
    dateLine: "September 17, 2026 | Tuscany, Italy",
    dateLineLong: "September 17, 2026 | Rapolano Terme, Tuscany, Italy",
    welcome: "There is no place more beautiful and no group of people we’d rather share it with. Thank you for deciding to make the journey to celebrate with us! Details for our wedding weekend are below. Ci vediamo in Italia!",
    signature: "xx Tyler & Nicole",
    countdown: "Countdown to Tuscany",
    days: "Days",
    heading: "The Itinerary",
    intro: "Three days in the Tuscan countryside. Please find our daily schedule and attire details below.",
    detailsLabel: "The Details",
    attireLabel: "Attire:",
    scheduleLabel: "The Schedule",
    schedule: [
      {
        date: "Wednesday, September 16",
        title: "Welcome to Tuscany",
        items: [
          { time: "2:00 PM & 3:00 PM", label: "Shuttles depart Siena Train Station for Borgo Laticastelli" },
          { time: "3:00 PM", label: "Guest Check-in" },
          { time: "7:30 PM", label: "Welcome Dinner" },
        ],
        details: "Join us under the stars for wood-fired pizza and exceptional local wine to officially welcome you to Tuscany.",
        attireBlocks: [
          {
            title: "La Notte Bianca",
            body: "All white everything: linens, summer dresses, and effortless Italian style. You have spent years avoiding white at weddings; tonight is your night. We kindly request white from head to toe, with no exceptions.",
          },
        ],
        image: attireGraphicWelcomeParty,
        imageAlt: "Welcome party attire color palette illustration",
      },
      {
        date: "Thursday, September 17",
        title: "The Wedding Day",
        items: [
          { time: "8:00 AM – 10:00 AM", label: "Breakfast" },
          { time: "5:00 PM", label: "Ceremony" },
          { time: "5:30 PM", label: "Cocktail Hour" },
          { time: "7:30 PM", label: "Dinner" },
          { time: "10:00 PM", label: "Dancing" },
        ],
        details: "Our ceremony overlooking the Tuscan hills, followed by an evening of aperitivo, an elegant dinner, and dancing the night away.",
        attireBlocks: [
          {
            title: "Tuscan Formal",
            body: "An excuse to dress up. We encourage floor-length dresses, suits, and rich colors and textures.",
          },
        ],
        image: attireGraphic,
        imageAlt: "Wedding attire color palette illustration",
      },
      {
        date: "Friday, September 18",
        title: "The Recovery & The Road Trip",
        items: [
          { time: "9:00 AM – 11:00 AM", label: "Breakfast" },
          { time: "10:00 AM – 10:30 AM", label: "Tuscany Day Trip Departs" },
          { time: "1:00 PM", label: "Pool Party Officially Kicks Off" },
          { time: "7:00 PM", label: "Shuttle pick-up to Rapolano Terme (for the Pool Party crew)" },
        ],
        subSchedules: [
          {
            heading: "Schedule A: The \"Best of Tuscany\" Day Trip",
            host: "Hosted by Grazyna & Waldemar",
            details:
              "Sleep in, grab a coffee, and let us do the driving! For those who want to explore, we have curated a seamless, all-day luxury coach tour of our favorite Tuscan spots. We will start by wandering the historic streets of Siena, head to a beautiful local agriturismo for a wine-tasting lunch, and spend the late afternoon exploring the famous medieval towers of San Gimignano. We will cap off the trip with a spectacular group dinner before heading back to the venue around 10:00 PM.",
            attireBlocks: [
              {
                title: "Tuscan Explorer",
                body: "Chic but practical daywear. Comfortable walking shoes are an absolute must for the cobblestones and hills in Siena and San Gimignano. Bring a light layer for the evening!",
              },
            ],
          },
          {
            heading: "Schedule B: Il Dolce Far Niente Pool Party & Local Dinner",
            host: "Hosted by Nicole & Tyler",
            details:
              "The art of doing absolutely nothing. For those staying behind at Borgo Laticastelli, spend the day recovering in the Tuscan sun with music, endless spritzes, and lunch by the pool with us. Once we are finally ready to move, we will take a quick shuttle into the local town of Rapolano Terme for a relaxed dinner at Sapor in Torre.",
            attireBlocks: [
              {
                label: "Daytime Attire:",
                title: "Vintage Resort Wear",
                body: "Bring your best vintage-inspired swimwear and cover-ups for lounging by the pool.",
              },
              {
                label: "Evening Attire:",
                title: "Tuscan Casual",
                body: "For our dinner in town, effortless evening wear is perfect. Think flowy sundresses, lightweight linen trousers, short-sleeve button-downs, and comfortable sandals for walking around town.",
              },
            ],
          },
        ],
      },
      {
        date: "Saturday, September 19",
        title: "Arrivederci",
        items: [
          { time: "8:00 AM – 10:00 AM", label: "Breakfast" },
          { time: "10:00 AM, 11:15 AM, 12:30 PM", label: "Shuttles depart Borgo Laticastelli for Siena Train Station" },
          { time: "12:00 PM", label: "Check-out & Arrivederci!" },
        ],
      },
    ],
  },
  pl: {
    dateLine: "17 września 2026 | Toskania, Włochy",
    dateLineLong: "17 września 2026 | Rapolano Terme, Toskania, Włochy",
    welcome: "Nie ma piękniejszego miejsca i wspanialszej grupy ludzi, z którą wolelibyśmy się nim podzielić. Dziękujemy, że zdecydowaliście się na tę podróż, aby świętować razem z nami! Szczegóły dotyczące naszego weekendu weselnego znajdują się poniżej. Ci vediamo in Italia!",
    signature: "xx Tyler i Nicole",
    countdown: "Odliczanie dni",
    days: "Dni",
    heading: "Plan",
    intro: "Trzy dni w toskańskiej scenerii. Poniżej znajdziecie nasz dzienny plan oraz szczegóły dotyczące stroju.",
    detailsLabel: "Szczegóły",
    attireLabel: "Strój:",
    scheduleLabel: "Harmonogram",
    schedule: [
      {
        date: "Środa, 16 września",
        title: "Powitanie w Toskanii",
        items: [
          { time: "14:00 i 15:00", label: "Transfery odjeżdżają z dworca kolejowego w Sienie do Borgo Laticastelli" },
          { time: "15:00", label: "Zameldowanie gości" },
          { time: "19:30", label: "Kolacja powitalna" },
        ],
        details: "Dołączcie do nas pod gwiazdami na pizzę z pieca opalanego drewnem i wyjątkowe lokalne wino, aby oficjalnie powitać Was w Toskanii.",
        attireBlocks: [
          {
            title: "La Notte Bianca",
            body: "Biel od stóp do głów: lniane tkaniny, letnie sukienki i nonszalancki włoski styl. Przez lata unikaliście bieli na weselach — dziś wieczorem to Wasza noc. Prosimy o strój w kolorze białym od stóp do głów, bez wyjątków.",
          },
        ],
        image: attireGraphicWelcomeParty,
        imageAlt: "Welcome party attire color palette illustration",
      },
      {
        date: "Czwartek, 17 września",
        title: "Dzień ślubu",
        items: [
          { time: "8:00 – 10:00", label: "Śniadanie" },
          { time: "17:00", label: "Ceremonia" },
          { time: "17:30", label: "Aperitivo" },
          { time: "19:30", label: "Kolacja" },
          { time: "22:00", label: "Tańce" },
        ],
        details: "Nasza ceremonia z widokiem na toskańskie wzgórza, a potem wieczór pełen aperitivo, eleganckiej kolacji i tańców do białego rana.",
        attireBlocks: [
          {
            title: "Toskańska elegancja",
            body: "Doskonały powód, żeby się wystroić. Zachęcamy do sukni do ziemi, garniturów oraz głębokich kolorów i wyrazistych tkanin.",
          },
        ],
        image: attireGraphic,
        imageAlt: "Wedding attire color palette illustration",
      },
      {
        date: "Piątek, 18 września",
        title: "Odpoczynek i wycieczka",
        items: [
          { time: "9:00 – 11:00", label: "Śniadanie" },
          { time: "10:00 – 10:30", label: "Wyjazd na wycieczkę po Toskanii" },
          { time: "13:00", label: "Oficjalny start imprezy przy basenie" },
          { time: "19:00", label: "Transfer do Rapolano Terme (dla ekipy znad basenu)" },
        ],
        subSchedules: [
          {
            heading: "Plan A: Wycieczka „Najlepsze z Toskanii”",
            host: "Organizują Grażyna i Waldemar",
            details:
              "Wyśpijcie się, weźcie kawę i zostawcie prowadzenie nam! Dla tych, którzy chcą zwiedzać, przygotowaliśmy całodniową, luksusową wycieczkę autokarową po naszych ulubionych miejscach w Toskanii. Zaczniemy od spaceru po historycznych uliczkach Sieny, następnie udamy się do pięknego lokalnego agriturismo na lunch z degustacją wina, a późne popołudnie spędzimy, zwiedzając słynne średniowieczne wieże San Gimignano. Wycieczkę zakończymy wspólną, wyjątkową kolacją, po której wrócimy na miejsce około 22:00.",
            attireBlocks: [
              {
                title: "Odkrywca Toskanii",
                body: "Szykowny, ale praktyczny strój dzienny. Wygodne buty do chodzenia są absolutnie niezbędne na brukowanych uliczkach i wzgórzach Sieny oraz San Gimignano. Zabierzcie lekką warstwę na wieczór!",
              },
            ],
          },
          {
            heading: "Plan B: Il Dolce Far Niente — impreza przy basenie i lokalna kolacja",
            host: "Organizują Nicole i Tyler",
            details:
              "Sztuka nierobienia zupełnie niczego. Dla tych, którzy zostają w Borgo Laticastelli — spędźcie dzień na regeneracji w toskańskim słońcu, przy muzyce, drinkach spritz bez końca i lunchu przy basenie z nami. Kiedy w końcu zbierzemy się do wyjścia, pojedziemy krótkim transferem do pobliskiego miasteczka Rapolano Terme na spokojną kolację w Sapor in Torre.",
            attireBlocks: [
              {
                label: "Strój dzienny:",
                title: "Vintage Resort Wear",
                body: "Zabierzcie swój najlepszy strój kąpielowy w stylu vintage i narzutkę do relaksu przy basenie.",
              },
              {
                label: "Strój wieczorowy:",
                title: "Tuscan Casual",
                body: "Na naszą kolację w miasteczku idealny będzie swobodny strój wieczorowy. Pomyślcie o zwiewnych sukienkach, lekkich lnianych spodniach, koszulach z krótkim rękawem i wygodnych sandałach do spacerów po miasteczku.",
              },
            ],
          },
        ],
      },
      {
        date: "Sobota, 19 września",
        title: "Arrivederci",
        items: [
          { time: "8:00 – 10:00", label: "Śniadanie" },
          { time: "10:00, 11:15, 12:30", label: "Transfery odjeżdżają z Borgo Laticastelli do dworca kolejowego w Sienie" },
          { time: "12:00", label: "Wymeldowanie i Arrivederci!" },
        ],
      },
    ],
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
          <h1 className="heading-display mb-4 text-[#fdfbf7]">
            Nicole <span className="font-light italic">&</span> Tyler
          </h1>
          <p className="label-xs tracking-[0.158em] text-[#fdfbf7] opacity-75">
            <span className="inline sm:hidden">{t.dateLine}</span>
            <span className="hidden sm:inline">{t.dateLineLong}</span>
          </p>
        </FadeIn>
      </section>

      {/* Welcome */}
      <section className="page-section pt-16 md:pt-24 pb-12 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="heading-card italic tracking-wide leading-relaxed text-foreground mx-auto max-w-2xl text-pretty">
            {t.welcome}
          </p>
          <p className="body-small tracking-[0.2em] uppercase text-muted-foreground mt-8">
            {t.signature}
          </p>
        </FadeIn>
      </section>

      {/* Schedule Section */}
      <section className="bg-[#464320] text-[#fdfbf7] py-16 md:py-24 overflow-hidden">
        <div className="w-[90%] max-w-[1000px] mx-auto">
          <FadeIn>
            <h2 className="heading-section italic text-center mb-4 opacity-95">{t.heading}</h2>
            <div className="w-12 h-px bg-[#fdfbf7]/40 mx-auto mb-6" />
            <p className="body-small opacity-75 text-center max-w-xl mx-auto mb-8 text-pretty">
              {t.intro}
            </p>
          </FadeIn>

          <div className="space-y-16 md:space-y-20">
            {t.schedule.map((day, i) => (
              <FadeIn key={day.date} delay={i * 60}>
                <div className={i > 0 ? "pt-10 md:pt-12 border-t border-[#fdfbf7]/20" : ""}>
                  {/* Day icon */}
                  {i === 0 && (
                    <div className="relative w-28 h-20 mb-2">
                      <img src={welcomeCup} alt="Glass" className="absolute bottom-0 left-0 w-12 h-12 object-contain brightness-0 invert" />
                      <motion.img
                        src={welcomeBottle}
                        alt="Bottle"
                        className="absolute -top-[16px] left-[34px] w-16 h-16 object-contain origin-bottom-left brightness-0 invert"
                        animate={{ rotate: [0, -15, 0, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                      />
                    </div>
                  )}
                  {i === 1 && (
                    <motion.img
                      src={weddingIcon}
                      alt={day.title}
                      className="w-[90px] h-[90px] object-contain -ml-2 mb-1 brightness-0 invert"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {i === 2 && (
                    <div className="relative w-32 h-24 mb-2">
                      <motion.img
                        src={poolSun}
                        alt="Sun"
                        className="absolute w-14 h-14 object-contain z-0 brightness-0 invert"
                        animate={{
                          top: [17, -10, 17],
                          right: [44, 0, 44],
                          rotate: [0, 360, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <img
                        src={poolUmbrella}
                        alt="Umbrella"
                        className="absolute top-[30px] left-[22px] w-20 h-16 object-contain z-10 brightness-0 invert"
                      />
                      <img
                        src={poolChairs}
                        alt="Chairs"
                        className="absolute bottom-[-14px] left-0 w-28 h-12 object-contain z-[5] brightness-0 invert"
                      />
                    </div>
                  )}

                  {/* Date + title */}
                  <p className="label-xs text-[#fdfbf7] opacity-60 mb-1">
                    {day.date}
                  </p>
                  <h3 className="heading-card text-[#fdfbf7] mb-6">
                    {day.title}
                  </h3>

                  {/* Schedule items */}
                  {day.subSchedules && (
                    <p className="label-xs text-[#fdfbf7] opacity-60 mb-3">
                      {t.scheduleLabel}
                    </p>
                  )}
                  <div className="space-y-2.5 body-small tracking-wide mb-6">
                    {day.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:gap-3">
                        <span className="font-medium sm:min-w-[15rem] shrink-0">{item.time}</span>
                        <span className="opacity-90">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details + Attire, with the attire graphic alongside on wider screens */}
                  {(day.details || day.attireBlocks) && (
                    <div className={day.image ? "flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start" : ""}>
                      {day.image && (
                        <div className="sm:w-[42%] shrink-0">
                          <img src={day.image} alt={day.imageAlt} className="block w-full" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {day.details && (
                          <div className="mb-5">
                            <p className="label-xs text-[#fdfbf7] opacity-60 mb-2">
                              {t.detailsLabel}
                            </p>
                            <p className="body-small leading-relaxed opacity-90">
                              {day.details}
                            </p>
                          </div>
                        )}

                        {day.attireBlocks && (
                          <div className="space-y-2">
                            {day.attireBlocks.map((block, bi) => (
                              <p key={bi} className="body-small italic opacity-80 leading-relaxed">
                                <span className="not-italic font-medium">{block.label ?? t.attireLabel}</span>{" "}
                                <span className="not-italic">{block.title}</span> — {block.body}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Friday split schedules */}
                  {day.subSchedules && (
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      {day.subSchedules.map((sub, si) => (
                        <div key={si} className="border border-[#fdfbf7]/20 p-6 md:p-7 space-y-3">
                          <div>
                            <h4 className="heading-card text-[#fdfbf7] mb-1 leading-snug">
                              {sub.heading}
                            </h4>
                            <p className="label-xs text-[#fdfbf7] opacity-60">
                              {sub.host}
                            </p>
                          </div>
                          <p className="body-small leading-relaxed opacity-90">
                            {sub.details}
                          </p>
                          <div className="space-y-2 pt-1">
                            {sub.attireBlocks.map((block, bi) => (
                              <p key={bi} className="body-small italic opacity-80 leading-relaxed">
                                <span className="not-italic font-medium">{block.label ?? t.attireLabel}</span>{" "}
                                <span className="not-italic">{block.title}</span> — {block.body}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown — days only */}
      <section className="page-section pt-16 pb-12 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <p className="heading-sub mb-3">{t.countdown}</p>
          <span className="heading-stat text-foreground">
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
