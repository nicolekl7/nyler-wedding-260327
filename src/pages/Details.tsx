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

const ZOLA_URL = "https://www.zola.com/registry/nicoleandtylersregistry/";
const AMAZON_URL = "https://www.amazon.com/wedding/guest-view/10UL21FCFHV3X";

const registryContent = {
  en: {
    heading: "Registry",
    body: "Please, no gifts expected—we are just thrilled to celebrate with you in Italy! Should you wish to honor us with a gift, we are registered at the links below. To save your precious suitcase space, we kindly request that any physical items be shipped directly to our home rather than brought to the venue.",
    zolaLabel: "Zola",
    amazonLabel: "Amazon",
  },
  pl: {
    heading: "Lista Prezentów",
    body: "Nie oczekujemy żadnych prezentów — najważniejsze jest dla nas to, że będziecie z nami świętować we Włoszech! Jeśli mimo wszystko chcielibyście nas obdarować, jesteśmy zarejestrowani pod linkami poniżej. Aby oszczędzić miejsce w bagażu, prosimy o wysyłkę fizycznych prezentów bezpośrednio do naszego domu, a nie przynoszenie ich na miejsce uroczystości.",
    zolaLabel: "Zola",
    amazonLabel: "Amazon",
  },
};

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
    blurb: "Poznaliśmy się, przegadaliśmy całą noc i rano powiedzieliśmy rodzicom, że się pobierzemy. Jak się wie, to się wie.",
    disclaimer:
      "(Tyler nie chciał tu zamieszczać tego kultowego tweeta, więc mamy zastrzeżenie: już tak nie mówi i zazwyczaj nie pije przez 7 dni z rzędu.)",
    photos: [{ src: nye1 }, { src: nye2 }],
  },
  {
    year: "2017",
    month: "Wiosna",
    place: "Karolina Południowa",
    headline: "",
    blurb:
      "Nagle — comiesięczne loty. Po każdym weekendowym wyjeździe już planowaliśmy następny. Nicole studiowała w Karolinie Południowej, a Tyler stacjonował na bazie lotniczej w Kansas, ale żadna odległość nie mogła zatrzymać tego związku.",
    photos: [{ src: dating1 }, { src: dating2 }, { src: dating4, nudgeX: 20 }],
  },
  {
    year: "2017",
    month: "Jesień",
    place: "Włochy",
    headline: "",
    blurb:
      "Nicole zaproponowała przerwę, ale zostawiła list na każdy dzień swojego wyjazdu na semestr we Florencji. Tyler zgodził się na rozstanie, ale kupił bilet i odwiedził ją po 3 tygodniach. Rozstanie po prostu nie wychodziło.",
    photos: [{ src: florence2 }, { src: florence3 }, { src: florence4, nudgeX: 40 }],
  },
  {
    year: "2018",
    month: "Maj",
    place: "Kansas",
    headline: "",
    blurb: "Poszliśmy \"tylko popatrzeć\" na koty w schronisku. Witaj, Purrcocet!",
    photos: [{ src: purrc1 }, { src: purrc2 }, { src: purrc3, nudgeY: -10 }],
  },
  {
    year: "2019",
    month: "Listopad",
    place: "Kansas",
    headline: "",
    blurb:
      "Tyler, który \"nie był kocim człowiekiem\", musiał wrócić do schroniska, bo Nicole zabrała Purrc do SC. Witaj, Mango!",
    photos: [{ src: mango1 }, { src: mango2 }, { src: mango3, nudgeY: 50 }],
  },
  {
    year: "2020",
    month: "Luty",
    place: "Kansas",
    headline: "",
    blurb:
      "Tylko my i naprawdę tylko my, bo był lockdown. Pierwsze wspólne mieszkanie. Trzy tygodnie później: pandemia. Przetrwaliśmy.",
    photos: [{ src: ks1 }, { src: ks2 }, { src: ks3, nudgeY: 30 }, { src: ks4 }],
  },
  {
    year: "2021",
    month: "Marzec",
    place: "Kansas",
    headline: "",
    blurb: "Jakoś staliśmy się właścicielami domu. Do dziś nie do końca wiemy, jak do tego doszło.",
    tightMobile: true,
    photos: [{ src: house1 }, { src: house2, nudgeX: 60 }, { src: house3, rotate: 5 }],
  },
  {
    year: "2022",
    month: "Lato",
    place: "Connecticut",
    headline: "",
    blurb: "Tymczasowo przeprowadziliśmy się na wschodnie wybrzeże, żeby być bliżej rodziny. Nadal jesteśmy w Stamford. Ups.",
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
      "Rodzinny wyjazd do Polski na urodziny Babci. Babcia wzięła Tylera na bok i dała mu dokładnie rok na oświadczyny. Rozmawialiśmy już o ślubie... ale co Babcia chce wiedzieć, to Babcia wie.",
    photos: [{ src: poland1 }, { src: poland2 }],
  },
  {
    year: "2025",
    month: "Maj",
    place: "Amelia Island",
    headline: "",
    blurb:
      "Tyler wypełnił taras zdjęciami z naszych lat razem. Pamięć w jego telefonie skończyła się dokładnie w chwili, gdy Nicole wyszła, więc nikt nie dowie się, co zostało powiedziane. Ale jedno możemy zdradzić: powiedziała tak.",
    photos: [{ src: proposal1 }, { src: proposal2, nudgeX: 40 }],
  },
];

const ourStoryStrings = {
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
    headline: <>Długa droga <em className="italic font-light">do tego miejsca.</em></>,
    footerEyebrow: "Wrzesień · Toskania · 2026",
    footerHeadline: "A teraz Wy!",
    footerBody: "Wszyscy, których kochamy, w najpiękniejszym kraju na świecie.",
    footerClose: "Do zobaczenia w Toskanii.",
  },
};

const Details = () => {
  const { language } = useLanguage();
  const registry = registryContent[language];
  const stops = language === "pl" ? stopsPL : stopsEN;
  const story = ourStoryStrings[language];

  return (
    <Layout>
      {/* Registry */}
      <section className="bg-[#464320] text-[#fdfbf7] pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div className="w-[90%] max-w-[700px] mx-auto text-center">
          <FadeIn>
            <h1 className="heading-section mb-4">{registry.heading}</h1>
            <div className="w-12 h-px bg-[#fdfbf7]/40 mx-auto mb-8" />
            <p className="body-editorial text-[#fdfbf7]/80 mx-auto text-balance mb-10">
              {registry.body}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <a
                href={ZOLA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 body-small tracking-widest uppercase bg-sage text-[#fdfbf7] px-8 py-2.5 hover:bg-sage/90 transition-colors duration-300"
              >
                {registry.zolaLabel}
              </a>
              <a
                href={AMAZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 body-small tracking-widest uppercase bg-sage text-[#fdfbf7] px-8 py-2.5 hover:bg-sage/90 transition-colors duration-300"
              >
                {registry.amazonLabel}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Story */}
      <article className="bg-background">
        <header className="w-[90%] mx-auto max-w-4xl pt-6 sm:pt-8 pb-16 text-center">
          <FadeIn>
            <p className="label-xs tracking-[0.3em] mb-4">
              {story.eyebrow}
            </p>
            <h2 className="heading-section text-foreground">
              {story.headline}
            </h2>
            <div className="w-12 h-px bg-primary/30 mx-auto mt-8 mb-6" />
          </FadeIn>
        </header>

        <section className="w-[90%] mx-auto max-w-6xl pb-32 relative">
          <div
            aria-hidden
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 w-px"
            style={{
              bottom: "3rem",
              backgroundImage:
                "repeating-linear-gradient(to bottom, hsl(var(--foreground) / 0.25) 0 6px, transparent 6px 14px)",
            }}
          />
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

        <footer className="bg-foreground text-cream">
          <div className="w-[90%] mx-auto max-w-2xl py-28 sm:py-32 text-center">
            <FadeIn>
              <p className="label-xs tracking-[0.3em] text-cream/70 mb-3">
                {story.footerEyebrow}
              </p>
              <h2 className="heading-section italic text-cream leading-tight mb-4 text-balance">
                {story.footerHeadline}
              </h2>
              <p className="body-small text-cream/80 leading-relaxed text-balance max-w-md mx-auto mb-8">
                {story.footerBody}
              </p>
              <p className="heading-section italic text-cream/90 text-balance">
                {story.footerClose}
              </p>
            </FadeIn>
          </div>
        </footer>
      </article>
    </Layout>
  );
};

export default Details;
