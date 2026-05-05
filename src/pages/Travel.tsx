import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import airImg from "@/assets/travel-by-air.avif";
import trainImg from "@/assets/travel-by-train.jpg";
import carImg from "@/assets/travel-by-car.jpg";
import callaLily2 from "@/assets/calla-lilly-side.png";
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
        If you plan to rent a car, you will need an International Driver's Permit (IDP)—required by Italian law. You can obtain one through AAA for approximately $20 before your trip.
        <br />
        <strong className="text-foreground font-medium">Also, don't forget to pack Type C or Type L travel adapters.</strong>
      </>
    ),
    navEvents: "Events →",
    navExplore: "Explore →",
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
        Jeśli planujesz wynająć samochód, będziesz potrzebować Międzynarodowego Prawa Jazdy (IDP) — wymaganego przez włoskie prawo. Możesz je uzyskać przez AAA za około 20 dolarów przed wyjazdem.
        <br />
        <strong className="text-foreground font-medium">Nie zapomnij też spakować adapterów podróżnych typu C lub L.</strong>
      </>
    ),
    navEvents: "Program →",
    navExplore: "Odkryj okolice →",
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

const Travel = () => {
  const { language } = useLanguage();
  const t = pageContent[language];

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

      {/* Navigation buttons */}
      <section className="w-[90%] max-w-[900px] mx-auto px-6 md:px-12 pb-24">
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/the-weekend"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.navEvents}
            </Link>
            <Link
              to="/local-guide"
              className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {t.navExplore}
            </Link>
          </div>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default Travel;
