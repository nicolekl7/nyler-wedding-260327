import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { motion } from "framer-motion";
import welcomeBottle from "@/assets/Welcome-Party-Bottle.png";
import welcomeCup from "@/assets/Welcome-Party-Cup.png";
import weddingIcon from "@/assets/Wedding-4.png";
import poolUmbrella from "@/assets/Pool-Party-Umbrella.png";
import poolChairs from "@/assets/Pool-Party-Chairs.png";
import poolSun from "@/assets/Pool-Party-Sun.png";
import attireGraphic from "@/assets/attire graphic_wedding.png";
import attireGraphicWelcomeParty from "@/assets/attire graphic welcome party.png";
import { useLanguage } from "@/contexts/LanguageContext";

const pageContent = {
  en: {
    heading: "The Itinerary",
    intro: "Three days in the Tuscan countryside. Here's what to expect.",
    attireLabel: "Attire:",
    colorsNote: "Here are a few colors to inspire but wear whatever makes you feel good.",
    navTravel: "Travel →",
    navRsvp: "RSVP →",
    itinerary: [
      {
        day: "Wednesday, September 16",
        title: "Welcome Party",
        description:
          "Join us under the stars for wood-fired pizza and the best wine in the world to welcome you to Tuscany.",
        attire:
          "La Notte Bianca — All white everything: linens, summer dresses, effortless Italian style. You've spent years avoiding white at weddings. This is your night. Head to toe, linens to silk.. whatever you'd like but all white, no exceptions.",
      },
      {
        day: "Thursday, September 17",
        title: "The Wedding Day",
        description:
          "Our ceremony overlooking the Tuscan hills, followed by an evening of aperitivo, dinner, and dancing the night away.",
        attire:
          "Tuscan Formal — An excuse to dress up. Floor-length dresses. Suits. Rich colors and textures are encouraged. Have fun with it!",
      },
      {
        day: "Friday, September 18",
        title: "Il Dolce Far Niente Pool Party",
        description: "The art of doing nothing. Recover by the pool with lunch, drinks, and sunshine.",
        attire: "Vintage Resort Wear",
      },
    ],
  },
  pl: {
    heading: "Plan",
    intro: "Trzy dni w toskańskiej scenerii. Oto, co na Was czeka.",
    attireLabel: "Strój:",
    colorsNote: "Kilka kolorów dla inspiracji, ale przede wszystkim ubierz to, w czym czujesz się najlepiej.",
    navTravel: "Podróż →",
    navRsvp: "RSVP →",
    itinerary: [
      {
        day: "Środa, 16 września",
        title: "Przyjęcie powitalne",
        description:
          "Czeka na Was wieczór pod gwiazdami — pizza z pieca, toskańskie wino i pierwsze wspólne chwile przed wielkim dniem.",
        attire:
          "La Notte Bianca — biel od stóp do głów! Lniane tkaniny, letnie sukienki, nonszalancki włoski szyk. Przez lata omijałeś/omijałaś biel na weselach szerokim łukiem — ta noc jest Twoja. Len, jedwab, cokolwiek chcesz — byleby białe. Zero wyjątków. Serio.",
      },
      {
        day: "Czwartek, 17 września",
        title: "Dzień ślubu",
        description:
          "Ceremonia z widokiem na toskańskie wzgórza, a potem wieczór pełen aperitivo, kolacji i tańców do białego rana.",
        attire:
          "Toskańska elegancja — doskonały powód, żeby się wystroić. Suknie do ziemi. Garnitury. Głębokie kolory i wyraziste tkaniny jak najbardziej wskazane. Poszalej sobie!",
      },
      {
        day: "Piątek, 18 września",
        title: "La Dolce Far Niente — Przyjęcie przy basenie",
        description: "Sztuka nierobienia niczego. Odpoczywaj przy basenie przy lunchu, drinkach i słońcu.",
        attire: "Styl vintage resort",
      },
    ],
  },
};

const TheWeekend = () => {
  const { language } = useLanguage();
  const t = pageContent[language];
  const { itinerary } = t;

  return (
    <Layout>
      {/* Header */}
      <section className="page-section w-[90%] max-w-[1000px] mx-auto text-center">
        <FadeIn>
          <h1 className="heading-section mb-4">{t.heading}</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-8" />
          <p className="body-editorial mx-auto text-balance">
            {t.intro}
          </p>
        </FadeIn>
      </section>

      {/* Itinerary Timeline */}
      <section className="w-[90%] max-w-[800px] mx-auto pb-24">
        <div className="relative w-[90%] max-w-[900px] mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10" />

          <div className="space-y-20">
            {itinerary.map((event, i) => (
              <FadeIn key={event.title} delay={i * 150}>
                <div className={`relative pl-16 ${i === 2 ? "mt-1" : ""}`}>
                  {/* Timeline marker */}
                  <div
                    className={`absolute left-3.5 w-5 h-5 rounded-full border-2 border-primary/40 bg-background flex items-center justify-center ${i === 2 ? "top-2" : "top-1"}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>

                  <p className={`heading-sub text-foreground mb-2 ${i === 2 ? "pt-1" : ""}`}>
                    {i === 2 ? (
                      <>
                        <span className="block sm:inline">{event.day.split(", ")[0]},</span>{" "}
                        <span className="block sm:inline">{event.day.split(", ")[1]}</span>
                      </>
                    ) : (
                      event.day
                    )}
                  </p>

                  {/* Icon */}
                  {i === 0 ? (
                    <div className="relative w-28 h-20 mb-1 mt-0.5">
                      <img src={welcomeCup} alt="Glass" className="absolute bottom-0 left-0 w-12 h-12 object-contain" />
                      <motion.img
                        src={welcomeBottle}
                        alt="Bottle"
                        className="absolute -top-[16px] left-[34px] w-16 h-16 object-contain origin-bottom-left"
                        animate={{ rotate: [0, -15, 0, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                      />
                    </div>
                  ) : i === 2 ? (
                    <div className="relative w-32 h-24 -mb-2 -mt-2.5">
                      <motion.img
                        src={poolSun}
                        alt="Sun"
                        className="absolute w-14 h-14 object-contain z-0"
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
                        className="absolute top-[30px] left-[22px] w-20 h-16 object-contain z-10"
                      />
                      <img
                        src={poolChairs}
                        alt="Chairs"
                        className="absolute bottom-[-14px] left-0 w-28 h-12 object-contain z-[5]"
                      />
                    </div>
                  ) : (
                    <motion.img
                      src={weddingIcon}
                      alt={event.title}
                      className="w-[100px] h-[100px] object-contain -mt-5"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  <h2
                    className={`font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-4 ${i === 1 ? "-mt-3.5" : i === 2 ? "mt-2.5" : ""}`}
                  >
                    {event.title}
                  </h2>
                  <p className="body-editorial mb-4">{event.description}</p>
                  <p className="font-body text-sm text-muted-foreground italic">{t.attireLabel} {event.attire}</p>
                  {i === 0 && (
                    <div className="mt-6">
                      <img
                        src={attireGraphicWelcomeParty}
                        alt="Welcome party attire color palette illustration"
                        className="block w-full max-w-[39.6rem]"
                      />
                    </div>
                  )}
                  {i === 1 && (
                    <div className="mt-6">
                      <img
                        src={attireGraphic}
                        alt="Wedding attire color palette illustration"
                        className="block w-full max-w-xl"
                      />
                      <p className="font-body text-sm text-muted-foreground italic mt-4">
                        {t.colorsNote}
                      </p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation buttons */}
      <section className="w-[90%] max-w-[900px] mx-auto px-6 md:px-12 pb-24">
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/travel"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.navTravel}
            </Link>
            <Link
              to="/rsvp-v2"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.navRsvp}
            </Link>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default TheWeekend;
