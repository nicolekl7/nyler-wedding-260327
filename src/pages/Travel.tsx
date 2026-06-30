import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import airImg from "@/assets/travel-by-air.avif";
import trainImg from "@/assets/travel-by-train.jpg";
import carImg from "@/assets/travel-by-car.jpg";
import callaLily2 from "@/assets/calla-lilly-side.png";
import thermalImg from "@/assets/guide-thermal-baths.jpg";
import sienaImg from "@/assets/guide-siena.jpg";
import valdorciaImg from "@/assets/guide-valdorcia.jpg";
import chiantiImg from "@/assets/guide-chianti.jpg";
import montalcinoImg from "@/assets/guide-montalcino.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const pageContent = {
  en: {
    heading: "Getting to Borgo Laticastelli",
    intro: "Every route to Tuscany leads through some of the most beautiful landscape in the world.",
    thingsTitle: "Before You Go",
    beforeYouGoItems: [
      <>
        Confirm your travel{" "}
        <Link to="/comingsoon" className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors">
          here
        </Link>
      </>,
      "Passport must be valid through March 2027",
      "Renting a car? Get an International Driver's Permit through AAA (~$20)",
      "Pack Type C or Type L travel adapters",
    ],
    gettingThere: [
      {
        label: "By Air",
        image: airImg,
        alt: "Aerial view of Florence at golden hour",
        body: (
          <>
            <strong className="text-foreground font-medium">By Air:</strong> Florence (FLR, 1 hr), Pisa (PSA, 2 hrs), or Rome (FCO, 2.5 hrs). Rome has the most direct international options; Florence is the easiest overall. Traveling solo? Let us know and we'll connect you with other guests for a shared ride.
          </>
        ),
      },
      {
        label: "By Train",
        image: trainImg,
        alt: "Italian train winding through Tuscan countryside",
        body: (
          <>
            <strong className="text-foreground font-medium">By Train:</strong> Italy's high-speed rail connects all major airports to the region. We are offering shuttles from Siena train station to the venue on Wednesday, September 16th as well as shuttles back to Siena train station on Saturday, September 19th. Reserve your spot{" "}
            <Link to="/comingsoon" className="underline underline-offset-2 hover:text-primary transition-colors">here</Link>{" "}
            before July 16th.
          </>
        ),
      },
      {
        label: "By Car",
        image: carImg,
        alt: "Winding cypress-lined road through Tuscan hills",
        body: (
          <>
            <strong className="text-foreground font-medium">By Car:</strong> If you feel comfortable, we highly recommend renting a car. It's great to have due to the lack of public transportation and rideshare options in Tuscany. Be sure to book quickly as automatic cars are in high demand.
          </>
        ),
      },
    ],
    navEvents: "ATTIRE",
    navRegistry: "REGISTRY",
    reserveShuttle: "Confirm Travel",
    exploreHeading: "Explore Tuscany",
    exploreIntro: "Extending your trip? Here are our favorite highlights near the venue.",
  },
  pl: {
    heading: "Jak dotrzeć do Borgo Laticastelli",
    intro: "Każda droga do Toskanii wiedzie przez jedno z najpiękniejszych krajobrazów na świecie.",
    thingsTitle: "Przed wyjazdem",
    beforeYouGoItems: [
      <>
        Potwierdź swoją podróż{" "}
        <Link to="/comingsoon" className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors">
          tutaj
        </Link>
      </>,
      "Paszport musi być ważny do marca 2027",
      "Wynajmujesz samochód? Zdobądź Międzynarodowe Prawo Jazdy przez AAA (~20 USD)",
      "Zapakuj adaptery podróżne typu C lub L",
    ],
    gettingThere: [
      {
        label: "Samolotem",
        image: airImg,
        alt: "Aerial view of Florence at golden hour",
        body: (
          <>
            <strong className="text-foreground font-medium">Samolotem:</strong> Florencja (FLR, 1 godz.), Piza (PSA, 2 godz.) lub Rzym (FCO, 2,5 godz.). Rzym ma najwięcej bezpośrednich połączeń międzynarodowych; Florencja jest najwygodniejsza ogólnie. Podróżujesz sam/sama? Daj nam znać, a połączymy Cię z innymi gośćmi na wspólny przejazd.
          </>
        ),
      },
      {
        label: "Pociągiem",
        image: trainImg,
        alt: "Italian train winding through Tuscan countryside",
        body: (
          <>
            <strong className="text-foreground font-medium">Pociągiem:</strong> Włoska szybka kolej łączy wszystkie główne lotniska z regionem. Organizujemy transfery z dworca w Sienie do posiadłości w środę, 16 września, oraz transfery powrotne na dworzec w Sienie w sobotę, 19 września. Zarezerwuj swoje miejsce{" "}
            <Link to="/comingsoon" className="underline underline-offset-2 hover:text-primary transition-colors">tutaj</Link>{" "}
            przed 16 lipca.
          </>
        ),
      },
      {
        label: "Samochodem",
        image: carImg,
        alt: "Winding cypress-lined road through Tuscan hills",
        body: (
          <>
            <strong className="text-foreground font-medium">Samochodem:</strong> Jeśli czujesz się na siłach, zdecydowanie polecamy wynajem samochodu. Przyda się ze względu na ograniczoną komunikację publiczną i niewiele opcji rideshare w Toskanii. Zarezerwuj szybko — samochody z automatyczną skrzynią biegów cieszą się dużym zainteresowaniem.
          </>
        ),
      },
    ],
    navEvents: "STRÓJ",
    navRegistry: "LISTA PREZENTÓW",
    reserveShuttle: "Potwierdź podróż",
    exploreHeading: "Odkryj Toskanię",
    exploreIntro: "Przedłużasz pobyt? Oto nasze ulubione miejsca w Toskanii, w pobliżu posiadłości.",
  },
};

const guidesContent = {
  en: [
    {
      title: "Rapolano Thermal Baths",
      subtitle: "5 Minutes Away",
      image: thermalImg,
      alt: "Natural thermal baths with turquoise pools in Rapolano Terme, Tuscany",
      richBody: (
        <p className="body-editorial">
          Terme San Giovanni and Antica Querciolaia have travertine pools filled with natural hot springs. Go in the evening when they're lit up.
        </p>
      ),
    },
    {
      title: "Siena",
      subtitle: "20 Minutes Away",
      image: sienaImg,
      alt: "The medieval Piazza del Campo in Siena, Italy",
      richBody: (
        <p className="body-editorial">
          Piazza del Campo, Torre del Mangia, the Duomo, gelato. Park outside the walls — the center is car-free. Free parking is easy to find.
        </p>
      ),
    },
    {
      title: "Val d'Orcia & Pienza",
      subtitle: "45 Minutes Away",
      image: valdorciaImg,
      alt: "Rolling green hills with cypress trees in Val d'Orcia, Tuscany",
      richBody: (
        <p className="body-editorial">
          Pecorino cheese tastings at La Taverna del Pecorino with iconic Tuscan views. The Gladiator field is nearby — search "Gladiator scene" on Google Maps.
        </p>
      ),
    },
    {
      title: "Chianti & Montepulciano",
      subtitle: "45 Minutes Away",
      image: chiantiImg,
      alt: "Vineyards in Chianti with a rustic stone winery, Tuscany",
      richBody: (
        <p className="body-editorial">
          Chianti Classico to the north, Vino Nobile to the south. Wineries: Avignonesi, Contucci, Argiano, Castiglion del Bosco.
        </p>
      ),
    },
    {
      title: "Montalcino",
      subtitle: "1 Hour Away",
      image: montalcinoImg,
      alt: "Hilltop town of Montalcino with vineyards, Tuscany",
      richBody: (
        <p className="body-editorial">
          Brunello country. Walk the fortress, taste wine, grab chestnut honey. Wineries: Corte Pavone, Podere Le Ripi, Castello Banfi.
        </p>
      ),
    },
  ],
  pl: [
    {
      title: "Termy w Rapolano",
      subtitle: "5 minut drogi",
      image: thermalImg,
      alt: "Natural thermal baths with turquoise pools in Rapolano Terme, Tuscany",
      richBody: (
        <p className="body-editorial">
          Terme San Giovanni i Antica Querciolaia mają trawertynowe baseny wypełnione naturalnymi gorącymi źródłami. Wybierz się wieczorem, gdy są podświetlone.
        </p>
      ),
    },
    {
      title: "Siena",
      subtitle: "20 minut drogi",
      image: sienaImg,
      alt: "The medieval Piazza del Campo in Siena, Italy",
      richBody: (
        <p className="body-editorial">
          Piazza del Campo, Torre del Mangia, Duomo, gelato. Parkuj poza murami — centrum jest strefą tylko dla pieszych. Łatwo znajdziesz bezpłatne miejsce.
        </p>
      ),
    },
    {
      title: "Val d'Orcia i Pienza",
      subtitle: "45 minut drogi",
      image: valdorciaImg,
      alt: "Rolling green hills with cypress trees in Val d'Orcia, Tuscany",
      richBody: (
        <p className="body-editorial">
          Degustacje sera pecorino w La Taverna del Pecorino z widokami na Toskanię. Pole z filmu Gladiator jest niedaleko — wyszukaj "Gladiator scene" w Google Maps.
        </p>
      ),
    },
    {
      title: "Chianti i Montepulciano",
      subtitle: "45 minut drogi",
      image: chiantiImg,
      alt: "Vineyards in Chianti with a rustic stone winery, Tuscany",
      richBody: (
        <p className="body-editorial">
          Chianti Classico na północy, Vino Nobile na południu. Winnice: Avignonesi, Contucci, Argiano, Castiglion del Bosco.
        </p>
      ),
    },
    {
      title: "Montalcino",
      subtitle: "1 godzina drogi",
      image: montalcinoImg,
      alt: "Hilltop town of Montalcino with vineyards, Tuscany",
      richBody: (
        <p className="body-editorial">
          Kraina Brunello. Przejdź się po fortecy, spróbuj wina, kup miód kasztanowy. Winnice: Corte Pavone, Podere Le Ripi, Castello Banfi.
        </p>
      ),
    },
  ],
};

const Travel = () => {
  const { language } = useLanguage();
  const t = pageContent[language];
  const guides = guidesContent[language];

  return (
    <Layout dark hideFooterImage>
      {/* Hero */}
      <section className="relative page-section pb-0 w-[90%] max-w-[1400px] mx-auto text-center">
        <div
          aria-hidden
          className="hidden md:block pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-40 lg:w-56 aspect-square opacity-70"
          style={{
            backgroundColor: "hsl(63 30% 80%)",
            WebkitMaskImage: `url(${callaLily2})`,
            maskImage: `url(${callaLily2})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
        <div
          aria-hidden
          className="hidden md:block pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-40 lg:w-56 aspect-square opacity-70 scale-x-[-1]"
          style={{
            backgroundColor: "hsl(63 30% 80%)",
            WebkitMaskImage: `url(${callaLily2})`,
            maskImage: `url(${callaLily2})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <h1 className="heading-section mb-4">{t.heading}</h1>
            <div className="w-12 h-px bg-primary mx-auto mb-8" />
            <p className="body-editorial mx-auto text-balance">
              {t.intro}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-24 pt-10 md:pt-12 pb-6 md:pb-8 w-[90%] max-w-[1400px] mx-auto">
        <FadeIn>
          <div className="border border-border bg-stone-light/40 px-8 py-8 md:px-12 md:py-10">
            <p className="heading-sub text-primary mb-4">{t.thingsTitle}</p>
            <ul className="space-y-2">
              {t.beforeYouGoItems.map((item, i) => (
                <li key={i} className="font-body text-xs leading-[1.8] text-muted-foreground font-light flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </section>

      <section className="px-6 md:px-12 lg:px-24 pb-16 md:pb-32 w-[90%] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {t.gettingThere.map((s, i) => (
            <FadeIn key={s.label} delay={i * 100}>
              <div className="flex flex-col gap-5">
                <div className="overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="w-full h-48 md:h-56 object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <p className="font-body text-sm leading-[1.9] text-muted-foreground font-light">
                  {s.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={100}>
          <div className="flex justify-center mt-10">
            <Link
              to="/comingsoon"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.reserveShuttle}
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Explore Tuscany */}
      <section className="w-[90%] max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 pb-24 md:pb-32">
        <FadeIn>
          <h2 className="heading-section text-center mb-4">{t.exploreHeading}</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-6" />
          <p className="body-editorial text-center mx-auto mb-16">
            {t.exploreIntro}
          </p>
        </FadeIn>

        <div className="space-y-24">
          {guides.map((g, i) => (
            <FadeIn key={g.title} delay={i * 120}>
              <div
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 md:gap-14 items-center`}
              >
                <div className="md:w-1/2 overflow-hidden">
                  <img
                    src={g.image}
                    alt={g.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="w-full h-64 md:h-80 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="md:w-1/2 space-y-3">
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light">
                    {g.title}
                  </h3>
                  {g.subtitle && (
                    <p className="font-body text-sm text-muted-foreground">{g.subtitle}</p>
                  )}
                  {g.richBody}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Navigation buttons */}
      <section className="w-[90%] max-w-[900px] mx-auto px-6 md:px-12 pb-24 pt-24">
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/the-weekend"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.navEvents}
            </Link>
            <a
              href="https://www.zola.com/registry/nicoleandtylersregistry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.navRegistry}
            </a>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default Travel;
