import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import RoadmapStop, { RoadmapStopData } from "@/components/RoadmapStop";
import { useLanguage } from "@/contexts/LanguageContext";

import nye1 from "@/assets/2016-12-1.jpeg";
import nye2 from "@/assets/2016-12-2.jpeg";
import dating1 from "@/assets/2017-3-5.jpeg";
import dating2 from "@/assets/2017-3-2.jpeg";
import dating4 from "@/assets/2017-5-7.jpeg";
import florence2 from "@/assets/2017-8-2.jpeg";
import florence3 from "@/assets/2017-11-1.jpeg";
import florence4 from "@/assets/2017-11-2.jpeg";
import purrc1 from "@/assets/2018-5-1.jpeg";
import purrc2 from "@/assets/2018-5-2.jpeg";
import purrc3 from "@/assets/2018-5-3.png";
import mango1 from "@/assets/2019-4.jpeg";
import mango2 from "@/assets/2019-2.jpeg";
import mango3 from "@/assets/2019-3.jpeg";
import ks1 from "@/assets/2020-1.jpeg";
import ks2 from "@/assets/2020-2.jpeg";
import ks3 from "@/assets/2020-3.jpeg";
import ks4 from "@/assets/2020-4.jpeg";
import house1 from "@/assets/2021-1.jpeg";
import house2 from "@/assets/2021-2.jpeg";
import house3 from "@/assets/2021-3.jpg";
import ct1 from "@/assets/2022-1.jpeg";
import ct2 from "@/assets/2022-5.jpeg";
import ct3 from "@/assets/2022-3.jpeg";
import ct4 from "@/assets/2022-6.jpeg";
import ct5 from "@/assets/2022-2.jpeg";
import poland1 from "@/assets/2024-1.jpeg";
import poland2 from "@/assets/2024-2.jpeg";
import proposal1 from "@/assets/2025-5-1.jpeg";
import proposal2 from "@/assets/2025-5-2.jpeg";

const stopsEN: RoadmapStopData[] = [
  {
    year: "2016",
    month: "December",
    place: "New York",
    headline: "",
    blurb: "Met, talked all night, told our parents we'd get married. When you know, you know.",
    disclaimer:
      "(Tyler didn't want to include this iconic tweet so here's a disclaimer: He no longer talks like this nor does he typically drink for 7 days nonstop.)",
    photos: [{ src: nye1 }, { src: nye2 }],
  },
  {
    year: "2017",
    month: "Spring",
    place: "South Carolina",
    headline: "",
    blurb:
      "Suddenly, monthly flights. One weekend visit and we couldn’t stop planning the next. Nicole was in school in South Carolina and Tyler was stationed at a Kansas AirForce base but distance couldn’t stop this connection.",
    photos: [{ src: dating1 }, { src: dating2 }, { src: dating4, nudgeX: 20 }],
  },
  {
    year: "2017",
    month: "Autumn",
    place: "Italy",
    headline: "",
    blurb:
      "Nicole suggested a break but left a letter for each day she'd be gone during her semester abroad. Tyler agreed to break up but bought a flight to visit 3 weeks in. Neither of us were good at this.",
    photos: [{ src: florence2 }, { src: florence3 }, { src: florence4, nudgeX: 40 }],
  },
  {
    year: "2018",
    month: "May",
    place: "Kansas",
    headline: "",
    blurb: "Went to \"just look\" at shelter cats. Welcome Purrcocet!",
    photos: [{ src: purrc1 }, { src: purrc2 }, { src: purrc3, nudgeY: -10 }],
  },
  {
    year: "2019",
    month: "November",
    place: "Kansas",
    headline: "",
    blurb:
      "Tyler who was \"not a cat person\" just had to go back to the shelter to look at cats because Nicole stole Purrc. Welcome Mango!",
    photos: [{ src: mango1 }, { src: mango2 }, { src: mango3, nudgeY: 50 }],
  },
  {
    year: "2020",
    month: "February",
    place: "Kansas",
    headline: "",
    blurb:
      "Just us and really only us because there was a pandemic. First place together. Three weeks in: lockdown. We survived.",
    photos: [{ src: ks1 }, { src: ks2 }, { src: ks3, nudgeY: 30 }, { src: ks4 }],
  },
  {
    year: "2021",
    month: "March",
    place: "Kansas",
    headline: "",
    blurb: "Somehow, homeowners. Still not sure how this happened.",
    tightMobile: true,
    photos: [{ src: house1 }, { src: house2, nudgeX: 60 }, { src: house3, rotate: 5 }],
  },
  {
    year: "2022",
    month: "Summer",
    place: "Connecticut",
    headline: "",
    blurb: "Temporarily moved to the east coast to be near family. Still in Stamford. Whoops.",
    tightMobile: true,
    photos: [
      { src: ct1, nudgeX: -2 },
      { src: ct2, nudgeX: 60, rotate: -10 },
      { src: ct3, rotate: -10 },
      { src: ct4, nudgeX: 40, rotate: 2 },
      { src: ct5, nudgeX: -40, rotate: 1 },
    ],
  },
  {
    year: "2024",
    month: "July",
    place: "Poland",
    headline: "",
    blurb:
      "Family trip to Poland for Babcia's birthday. Babcia pulled Tyler aside and gave him exactly one year to propose. We had already discussed getting married soon.. but if Babcia asks, it was entirely her idea.",
    photos: [{ src: poland1 }, { src: poland2 }],
  },
  {
    year: "2025",
    month: "May",
    place: "Amelia Island",
    headline: "",
    blurb:
      "Tyler filled the patio with photos of us from over the years. His phone ran out of storage right as Nicole walked out so no one will ever really know what was said. But what we can share is: she did say yes.",
    photos: [{ src: proposal1 }, { src: proposal2, nudgeX: 40 }],
  },
];

const stopsPL: RoadmapStopData[] = [
  {
    year: "2016",
    month: "Grudzień",
    place: "Nowy Jork",
    headline: "",
    blurb: "Poznaliśmy się, rozmawialiśmy całą noc, powiedzieliśmy rodzicom, że się pobierzemy. Gdy wiesz, to wiesz.",
    disclaimer:
      "(Tyler nie chciał zamieszczać tego słynnego tweeta, więc oto zastrzeżenie: Nie mówi już w ten sposób i zazwyczaj nie pije przez 7 dni z rzędu.)",
    photos: [{ src: nye1 }, { src: nye2 }],
  },
  {
    year: "2017",
    month: "Wiosna",
    place: "Karolina Południowa",
    headline: "",
    blurb: "Nagle miesięczne loty. Jeden weekendowy wypad i nie mogliśmy przestać planować kolejnego. Nicole studiowała w Karolinie Południowej, a Tyler stacjonował w bazie lotniczej w Kansas — ale odległość nie była w stanie zatrzymać tego połączenia.",
    photos: [{ src: dating1 }, { src: dating2 }, { src: dating4, nudgeX: 20 }],
  },
  {
    year: "2017",
    month: "Jesień",
    place: "Włochy",
    headline: "",
    blurb:
      "Nicole zaproponowała przerwę, ale zostawiła list na każdy dzień swojej nieobecności. Tyler zgodził się na rozstanie, ale kupił bilet i odwiedził ją 3 tygodnie później. Żadne z nas nie było dobre w tej zabawie.",
    photos: [{ src: florence2 }, { src: florence3 }, { src: florence4, nudgeX: 40 }],
  },
  {
    year: "2018",
    month: "Maj",
    place: "Kansas",
    headline: "",
    blurb: `Poszliśmy „tylko popatrzeć" na schroniskowe koty. Witaj, Purrcocet!`,
    photos: [{ src: purrc1 }, { src: purrc2 }, { src: purrc3, nudgeY: -10 }],
  },
  {
    year: "2019",
    month: "Listopad",
    place: "Kansas",
    headline: "",
    blurb:
      `Tyler, który „nie był kocim człowiekiem", musiał wrócić do schroniska, bo Nicole ukradła Purrc. Witaj, Mango!`,
    photos: [{ src: mango1 }, { src: mango2 }, { src: mango3, nudgeY: 50 }],
  },
  {
    year: "2020",
    month: "Luty",
    place: "Kansas",
    headline: "",
    blurb:
      "Tylko my i naprawdę tylko my, bo była pandemia. Pierwsze wspólne mieszkanie. Trzy tygodnie później: lockdown. Przeżyliśmy.",
    photos: [{ src: ks1 }, { src: ks2 }, { src: ks3, nudgeY: 30 }, { src: ks4 }],
  },
  {
    year: "2021",
    month: "Marzec",
    place: "Kansas",
    headline: "",
    blurb: "Jakoś staliśmy się właścicielami domu. Nadal nie wiemy, jak to się stało.",
    tightMobile: true,
    photos: [{ src: house1 }, { src: house2, nudgeX: 60 }, { src: house3, rotate: 5 }],
  },
  {
    year: "2022",
    month: "Lato",
    place: "Connecticut",
    headline: "",
    blurb: "Tymczasowo przenieśliśmy się na wschodnie wybrzeże, żeby być bliżej rodziny. Nadal jesteśmy w Stamford. Ups.",
    tightMobile: true,
    photos: [
      { src: ct1, nudgeX: -2 },
      { src: ct2, nudgeX: 60, rotate: -10 },
      { src: ct3, rotate: -10 },
      { src: ct4, nudgeX: 40, rotate: 2 },
      { src: ct5, nudgeX: -40, rotate: 1 },
    ],
  },
  {
    year: "2024",
    month: "Lipiec",
    place: "Polska",
    headline: "",
    blurb:
      "Babcia wzięła Tylera na bok i dała mu dokładnie rok na oświadczyny. Wcześniej rozmawialiśmy już o ślubie — ale jeśli Babcia pyta, to był wyłącznie jej pomysł.",
    photos: [{ src: poland1 }, { src: poland2 }],
  },
  {
    year: "2025",
    month: "Maj",
    place: "Amelia Island",
    headline: "",
    blurb:
      "Tyler wypełnił taras naszymi zdjęciami. Jego telefon skończył pamięć dokładnie w chwili, gdy Nicole wychodziła, więc nikt naprawdę nie wie, co zostało powiedziane. Ale możemy zdradzić: powiedziała tak.",
    photos: [{ src: proposal1 }, { src: proposal2, nudgeX: 40 }],
  },
];

const pageStrings = {
  en: {
    eyebrow: "December 2016 — September 2026",
    headline: <>The long way <em className="italic font-light">here.</em></>,
    footerEyebrow: "September · Tuscany · 2026",
    footerHeadline: "Next up, you!",
    footerBody: "Everyone we love, in the most beautiful country in the world.",
    footerClose: "See you in Tuscany.",
  },
  pl: {
    eyebrow: "Grudzień 2016 — Wrzesień 2026",
    headline: <>Nasza długa droga <em className="italic font-light">tutaj.</em></>,
    footerEyebrow: "Wrzesień · Toskania · 2026",
    footerHeadline: "Teraz czas na Was!",
    footerBody: "Wszyscy, których kochamy, w najpiękniejszym kraju na świecie.",
    footerClose: "Do zobaczenia w Toskanii.",
  },
};

const OurStoryV2 = () => {
  const { language } = useLanguage();
  const stops = language === "pl" ? stopsPL : stopsEN;
  const t = pageStrings[language];

  return (
    <Layout>
      <article className="bg-background">
        {/* Hero */}
        <header className="w-[90%] mx-auto max-w-4xl pt-20 sm:pt-28 pb-16 text-center">
          <FadeIn>
            <p className="font-body text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              {t.eyebrow}
            </p>
            <h1 className="heading-section text-foreground">
              {t.headline}
            </h1>
            <div className="w-12 h-px bg-primary/30 mx-auto mt-8 mb-6" />
          </FadeIn>
        </header>

        {/* Roadmap */}
        <section className="w-[90%] mx-auto max-w-6xl pb-32 relative">
          {/* Vertical center line — desktop */}
          <div
            aria-hidden
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 w-px"
            style={{
              bottom: "3rem",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--foreground) / 0.25) 0 6px, transparent 6px 14px)",
            }}
          />
          {/* Vertical left rail — mobile */}
          <div
            aria-hidden
            className="lg:hidden absolute left-[12px] top-0 w-px"
            style={{
              bottom: "3rem",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--foreground) / 0.25) 0 6px, transparent 6px 14px)",
            }}
          />

          <ol className="space-y-20 sm:space-y-28">
            {stops.map((stop, i) => (
              <li key={i}>
                <RoadmapStop
                  stop={stop}
                  index={i}
                  side={i % 2 === 0 ? "left" : "right"}
                  isLast={i === stops.length - 1}
                />
              </li>
            ))}
          </ol>
        </section>

        {/* Outro */}
        <footer className="bg-foreground text-cream">
          <div className="w-[90%] mx-auto max-w-2xl py-28 sm:py-32 text-center">
            <FadeIn>
              <p className="font-body uppercase tracking-[0.3em] text-[0.65rem] text-cream/70 mb-3">
                {t.footerEyebrow}
              </p>
              <h2 className="font-serif italic text-3xl sm:text-4xl font-light text-cream leading-tight mb-4 text-balance">
                {t.footerHeadline}
              </h2>
              <p className="font-body text-sm sm:text-base text-cream/80 leading-relaxed text-balance max-w-md mx-auto mb-8">
                {t.footerBody}
              </p>
              <p className="font-serif italic text-2xl sm:text-3xl font-light text-cream/90 text-balance">
                {t.footerClose}
              </p>
            </FadeIn>
          </div>
        </footer>
      </article>
    </Layout>
  );
};

export default OurStoryV2;
