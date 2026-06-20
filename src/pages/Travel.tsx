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
    intro: "The journey to Tuscany is part of the magic. Whether you fly, take the train, or rent a car, every route leads through some of the most beautiful landscape in the world.",
    thingsTitle: "Things to Know",
    thingsP1: (
      <>
        <strong className="text-foreground font-medium">Important:</strong> Italy requires your passport to be valid for at least six months beyond your planned date of departure. Please check your passport expiration date today! If it expires before March 2027, you will need to renew it before booking your flights.
      </>
    ),
    thingsP2: (
      <>
        If you plan to rent a car, you will need an International Driver's Permit (IDP)—required by Italian law. You can obtain one through AAA for approximately $20 before your trip. <strong className="text-foreground font-medium">Don't forget to pack Type C or Type L travel adapters.</strong>
      </>
    ),
    navEvents: "EVENTS",
    navRsvp: "RSVP",
    exploreHeading: "Explore Tuscany",
    exploreIntro: "Extending your trip? Here are our favorite highlights near the venue.",
    sections: [
      {
        title: "By Air",
        subtitle: "INTERNATIONAL & DOMESTIC FLIGHTS",
        image: airImg,
        alt: "Aerial view of Florence at golden hour",
        body: "Borgo Laticastelli is reachable from several airports:\n\n• Florence (FLR) — 1 hour\n• Pisa (PSA) — 2 hours\n• Rome (FCO) — 2.5 hours\n\nFor international flights, Rome offers the most direct options. For the easiest overall journey, Florence is your best bet.",
        extra: "If you're traveling solo and would like to coordinate a shared drive or train with other guests, just let us know and we'll connect you!",
      },
      {
        title: "By Train & Transfers",
        subtitle: "HIGH-SPEED ITALIAN RAIL",
        image: trainImg,
        alt: "Italian train winding through Tuscan countryside",
        body: "Italy has a fantastic high-speed train system across the country. You can use Google Maps to plan out your route based on where you fly in.",
        extra: (<>If you plan to train into Siena, we will be offering a group transfer from Siena to the estate at 2 PM on Wednesday, September 16th. To reserve your spot, please let Nicole or Tyler know by <strong className="text-foreground font-medium">August 1st</strong>—after that, transfers will need to be arranged independently.</>),
      },
      {
        title: "By Car",
        subtitle: "DRIVERS & CAR RENTALS",
        image: carImg,
        alt: "Winding cypress-lined road through Tuscan hills",
        body: "While you will not need a car for the 3 days of wedding events on the estate, renting a car is highly recommended if you plan to extend your trip or be able to explore freely. \n\nNote that Italy has ZTL zones in most historic city centers which are restricted areas cameras enforce automatically with steep fines. Navigation apps like Waze will help you avoid them. When in doubt, park outside the city walls and walk in.",
        extra: null,
      },
    ],
  },
  pl: {
    heading: "Jak dotrzeć do Borgo Laticastelli",
    intro: "Podróż do Toskanii jest częścią tej magii. Niezależnie czy lecisz samolotem, jedziesz pociągiem czy wynajmujesz samochód — każda trasa wiedzie przez jedno z najpiękniejszych krajobrazów na świecie.",
    thingsTitle: "Ważne informacje",
    thingsP1: (
      <>
        <strong className="text-foreground font-medium">Ważne:</strong> Włochy wymagają, aby paszport był ważny przez co najmniej sześć miesięcy po planowanej dacie wyjazdu. Sprawdź datę ważności swojego paszportu już dziś! Jeśli wygasa przed marcem 2027 roku, musisz go odnowić przed zakupem biletów lotniczych.
      </>
    ),
    thingsP2: (
      <>
        Jeśli planujesz wynająć samochód, będziesz potrzebować Międzynarodowego Prawa Jazdy (IDP) — wymaganego przez włoskie prawo. Możesz je uzyskać przez AAA za około 20 dolarów przed wyjazdem. <strong className="text-foreground font-medium">Nie zapomnij spakować adapterów podróżnych typu C lub L.</strong>
      </>
    ),
    navEvents: "EVENTS",
    navRsvp: "RSVP",
    exploreHeading: "Odkryj Toskanię",
    exploreIntro: "Przedłużasz pobyt? Oto nasze ulubione miejsca w Toskanii, w pobliżu posiadłości.",
    sections: [
      {
        title: "Samolotem",
        subtitle: "LOTY MIĘDZYNARODOWE I KRAJOWE",
        image: airImg,
        alt: "Aerial view of Florence at golden hour",
        body: "Do Borgo Laticastelli można dotrzeć z kilku lotnisk:\n\n• Florencja (FLR) — 1 godzina\n• Pisa (PSA) — 2 godziny\n• Rzym (FCO) — 2,5 godziny\n\nDla lotów międzynarodowych Rzym oferuje najwięcej bezpośrednich połączeń. Dla najwygodniejszej podróży najlepszym wyborem jest Florencja.",
        extra: "Jeśli podróżujesz sam/sama i chciałbyś/chciałabyś skoordynować wspólny przejazd lub pociąg z innymi gośćmi, daj nam znać, a my Was połączymy!",
      },
      {
        title: "Pociągiem i transfery",
        subtitle: "SZYBKA KOLEJ WŁOSKA",
        image: trainImg,
        alt: "Italian train winding through Tuscan countryside",
        body: "Włochy dysponują świetną siecią szybkich kolei. Możesz skorzystać z Google Maps, aby zaplanować trasę z lotniska, na którym wylądujesz.",
        extra: (<>Jeśli planujesz przyjechać pociągiem do Sieny, organizujemy grupowy transfer z Sieny do posiadłości o godzinie 14:00 w środę, 16 września. Aby zarezerwować miejsce, poinformuj Nicole lub Tylera do <strong className="text-foreground font-medium">1 sierpnia</strong> — po tej dacie dojazd należy zorganizować we własnym zakresie.</>),
      },
      {
        title: "Samochodem",
        subtitle: "KIEROWCY I WYNAJEM SAMOCHODÓW",
        image: carImg,
        alt: "Winding cypress-lined road through Tuscan hills",
        body: "Samochód nie jest potrzebny podczas trzech dni weselnych na terenie posiadłości, jednak wynajem auta jest bardzo polecany, jeśli planujesz przedłużyć pobyt lub chcesz swobodnie zwiedzać okolicę.\n\nPamiętaj, że we Włoszech większość historycznych centrów miast ma strefy ZTL — obszary ograniczonego ruchu, gdzie kamery automatycznie nakładają wysokie mandaty. Aplikacje nawigacyjne jak Waze pomogą Ci ich uniknąć. W razie wątpliwości zaparkuj poza murami miejskimi i wejdź pieszo.",
        extra: null,
      },
    ],
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
          Rapolano Terme is famous for its natural hot springs.{" "}
          <a href="https://share.google/hLQJwjNWHOtfJSOrm" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">Terme San Giovanni</a>{" "}
          and <a href="https://www.google.com/maps/place/antica+Querciolaia/data=!4m2!3m1!1s0x132bdbf2f9ea5175:0xdcd4979ed8ff98eb?sa=X&ved=1t:242&ictx=111" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">Antica Querciolaia</a> are just minutes from the venue, featuring travertine pools filled with naturally warm thermal water. Go in the evening to see the pools when they are illuminated under the Tuscan sky.
        </p>
      ),
    },
    {
      title: "Siena",
      subtitle: "20 Minutes Away",
      image: sienaImg,
      alt: "The medieval Piazza del Campo in Siena, Italy",
      richBody: (
        <>
          <p className="body-editorial">
            One of Italy's best-preserved medieval cities. Wander the Piazza del Campo, climb Torre del Mangia if you're up for it, and visit the Duomo before grabbing a gelato on the way out. Park outside the city walls as the historic center is car-free. We've always gotten lucky with free parking{" "}
            <a href="https://maps.app.goo.gl/JGiDDnaTtjUMnSdy9" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">here</a>.
          </p>
          <p className="body-editorial mt-3 italic text-muted-foreground">
            Fun fact: Siena is divided into 17 medieval neighborhoods called contrade, each with its own animal symbol and fierce rivalry during the Palio horse race, held in Piazza del Campo since 1482.
          </p>
        </>
      ),
    },
    {
      title: "Val d'Orcia & Pienza",
      subtitle: "45 Minutes Away",
      image: valdorciaImg,
      alt: "Rolling green hills with cypress trees in Val d'Orcia, Tuscany",
      richBody: (
        <>
          <p className="body-editorial">
            A Renaissance town perched above some of the most photographed landscape in Tuscany. Famous for its pecorino cheese—stop at La Taverna del Pecorino for a tasting and stay for the views.
          </p>
          <p className="body-editorial mt-3 italic text-muted-foreground">
            Fun fact: a scene from Gladiator was filmed just outside Pienza. Search "Gladiator scene" on Google Maps to find the exact spot.
          </p>
        </>
      ),
    },
    {
      title: "Chianti & Montepulciano",
      subtitle: "45 Minutes Away",
      image: chiantiImg,
      alt: "Vineyards in Chianti with a rustic stone winery, Tuscany",
      richBody: (
        <>
          <p className="body-editorial">
            Head north into the Chianti Classico region for world-class wine tastings among the vines, or south to Montepulciano to taste their famous Vino Nobile.
          </p>
          <p className="body-editorial mt-3 italic">
            Winery recommendations: Avignonesi, Contucci, Argiano, Castiglion del Bosco
          </p>
        </>
      ),
    },
    {
      title: "Montalcino",
      subtitle: "1 Hour Away",
      image: montalcinoImg,
      alt: "Hilltop town of Montalcino with vineyards, Tuscany",
      richBody: (
        <>
          <p className="body-editorial">
            Home to Brunello di Montalcino, one of Italy's most celebrated wines. Walk the fortress walls, go wine tasting, and be sure to pick up some local chestnut honey before you leave.
          </p>
          <p className="body-editorial mt-3 italic">
            Winery recommendations: Corte Pavone, Podere Le Ripi, Castello Banfi
          </p>
        </>
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
          Rapolano Terme słynie ze swoich naturalnych gorących źródeł.{" "}
          <a href="https://share.google/hLQJwjNWHOtfJSOrm" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">Terme San Giovanni</a>{" "}
          i <a href="https://www.google.com/maps/place/antica+Querciolaia/data=!4m2!3m1!1s0x132bdbf2f9ea5175:0xdcd4979ed8ff98eb?sa=X&ved=1t:242&ictx=111" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">Antica Querciolaia</a> są zaledwie kilka minut od posiadłości — z trawertynowymi basenami wypełnionymi naturalnie ciepłą wodą termalną. Wybierz się wieczorem, żeby zobaczyć oświetlone baseny pod toskańskim niebem.
        </p>
      ),
    },
    {
      title: "Siena",
      subtitle: "20 minut drogi",
      image: sienaImg,
      alt: "The medieval Piazza del Campo in Siena, Italy",
      richBody: (
        <>
          <p className="body-editorial">
            Jedno z najlepiej zachowanych średniowiecznych miast Włoch. Przejdź się po Piazza del Campo, wejdź na Torre del Mangia, jeśli masz ochotę, i odwiedź Duomo przed wyjściem — koniecznie z gelato w ręku. Parkuj poza murami miejskimi, bo historyczne centrum jest strefą tylko dla pieszych. Nam zawsze udawało się tu znaleźć bezpłatne miejsce{" "}
            <a href="https://maps.app.goo.gl/JGiDDnaTtjUMnSdy9" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary transition-colors">tutaj</a>.
          </p>
          <p className="body-editorial mt-3 italic text-muted-foreground">
            Ciekawostka: Siena podzielona jest na 17 średniowiecznych dzielnic zwanych contrade, z których każda ma swój symbol zwierzęcy i zaciekle rywalizuje podczas wyścigu konnego Palio, organizowanego na Piazza del Campo od 1482 roku.
          </p>
        </>
      ),
    },
    {
      title: "Val d'Orcia i Pienza",
      subtitle: "45 minut drogi",
      image: valdorciaImg,
      alt: "Rolling green hills with cypress trees in Val d'Orcia, Tuscany",
      richBody: (
        <>
          <p className="body-editorial">
            Renesansowe miasteczko wzniesione ponad jednym z najczęściej fotografowanych krajobrazów Toskanii. Słynące z sera pecorino — wstąp do La Taverna del Pecorino na degustację i zostań dla widoków.
          </p>
          <p className="body-editorial mt-3 italic text-muted-foreground">
            Ciekawostka: scena z filmu Gladiator była kręcona tuż za Pienzą. Wyszukaj "Gladiator scene" w Google Maps, żeby znaleźć dokładne miejsce.
          </p>
        </>
      ),
    },
    {
      title: "Chianti i Montepulciano",
      subtitle: "45 minut drogi",
      image: chiantiImg,
      alt: "Vineyards in Chianti with a rustic stone winery, Tuscany",
      richBody: (
        <>
          <p className="body-editorial">
            Jedź na północ do regionu Chianti Classico na degustacje światowej klasy win wśród winnic, lub na południe do Montepulciano, żeby spróbować słynnego Vino Nobile.
          </p>
          <p className="body-editorial mt-3 italic">
            Polecane winnice: Avignonesi, Contucci, Argiano, Castiglion del Bosco
          </p>
        </>
      ),
    },
    {
      title: "Montalcino",
      subtitle: "1 godzina drogi",
      image: montalcinoImg,
      alt: "Hilltop town of Montalcino with vineyards, Tuscany",
      richBody: (
        <>
          <p className="body-editorial">
            Ojczyzna Brunello di Montalcino — jednego z najbardziej cenionych włoskich win. Przejdź się po murach twierdzy, wybierz się na degustację wina i koniecznie kup trochę lokalnego miodu kasztanowego przed wyjazdem.
          </p>
          <p className="body-editorial mt-3 italic">
            Polecane winnice: Corte Pavone, Podere Le Ripi, Castello Banfi
          </p>
        </>
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
      <section className="relative page-section w-[90%] max-w-[1400px] mx-auto text-center">
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
            <div className="mt-8 flex justify-center">
              <a
                href="https://maps.app.goo.gl/4P2Z6mjKSBRC4FGG9?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-base md:text-lg text-foreground italic hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40"
              >
                Laticastelli Country Relais
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-24 pb-16 md:pb-24 w-[90%] max-w-[1400px] mx-auto">
        <FadeIn>
          <div className="border border-border bg-stone-light/40 px-8 py-8 md:px-12 md:py-10">
            <p className="heading-sub text-primary mb-4">{t.thingsTitle}</p>
            <p className="font-body text-sm leading-[1.9] text-muted-foreground font-light">
              {t.thingsP1}
            </p>
            <p className="font-body text-sm leading-[1.9] text-muted-foreground font-light mt-4">
              {t.thingsP2}
            </p>
          </div>
        </FadeIn>
      </section>

      <div className="space-y-24 md:space-y-40 pb-16 md:pb-32">
        {t.sections.map((s, i) => (
          <section key={s.title} className="px-6 md:px-12 lg:px-24 w-[90%] max-w-[1400px] mx-auto">
            <FadeIn delay={i * 100}>
              <div
                className={`flex flex-col ${
                  i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                } gap-10 md:gap-20 items-center`}
              >
                <div className="md:w-1/2 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="w-full h-72 md:h-[28rem] object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                <div className="md:w-1/2 space-y-5">
                  <p className="font-body text-xs uppercase tracking-[0.35em] text-muted-foreground font-medium">
                    {s.subtitle}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight">
                    {s.title}
                  </h2>
                  <div className="w-10 h-px bg-primary" />
                  <p className="font-body text-sm md:text-base leading-[1.9] text-muted-foreground font-light whitespace-pre-line">
                    {s.body}
                  </p>
                  {s.extra && (
                    <p className="font-body text-sm md:text-base leading-[1.9] text-muted-foreground font-light">
                      {s.extra}
                    </p>
                  )}
                </div>
              </div>
            </FadeIn>
          </section>
        ))}
      </div>

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

export default Travel;
