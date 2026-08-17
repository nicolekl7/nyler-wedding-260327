import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const ZOLA_URL = "https://www.zola.com/registry/nicoleandtylersregistry/";
const AMAZON_URL = "https://www.amazon.com/wedding/guest-view/10UL21FCFHV3X";

const registryContent = {
  en: {
    body: "No gifts expected—we are just thrilled to celebrate with you in Italy! Should you wish to honor us with a gift, we are registered at the links below. To save your precious suitcase space, we kindly request that any physical items be shipped directly to our home rather than brought to the venue.",
    signature: "xx Tyler & Nicole",
    zolaLabel: "Zola",
    amazonLabel: "Amazon",
  },
  pl: {
    body: "Nie oczekujemy żadnych prezentów — najważniejsze jest dla nas to, że będziecie z nami świętować we Włoszech! Jeśli mimo wszystko chcielibyście nas obdarować, jesteśmy zarejestrowani pod linkami poniżej. Aby oszczędzić miejsce w bagażu, prosimy o wysyłkę fizycznych prezentów bezpośrednio do naszego domu, a nie przynoszenie ich na miejsce uroczystości.",
    signature: "xx Tyler i Nicole",
    zolaLabel: "Zola",
    amazonLabel: "Amazon",
  },
};

const faqContent = {
  en: {
    heading: "Concierge FAQs",
    faqs: [
      {
        q: "What is the weather like in September?",
        a: "Late September in Tuscany is typically beautiful, with warm, sunny days (around 75°F / 24°C) and crisp evenings (around 55°F / 13°C). We recommend bringing a light jacket or wrap for the evening events. Don't forget a bathing suit!",
      },
      {
        q: "What shoes should I wear?",
        a: "The estate features cobblestone paths and grass — stilettos will not be your friend. Block heels, wedges, or dressy flats are strongly recommended for all three days. This applies especially to the ceremony on Thursday.",
      },
      {
        q: "Are gifts expected?",
        a: "No! The greatest gift you can give us is being there. That said, for those who'd like to celebrate from afar or do a little something extra, we are registered on Zola.",
      },
    ],
  },
  pl: {
    heading: "Najczęstsze pytania",
    faqs: [
      {
        q: "Jaka jest pogoda we wrześniu?",
        a: "Koniec września w Toskanii jest zazwyczaj piękny — ciepłe, słoneczne dni (około 24°C) i rześkie wieczory (około 13°C). Polecamy zabrać lekką kurtkę lub szal na wieczorne imprezy. I nie zapomnijcie o stroju kąpielowym!",
      },
      {
        q: "Jakie buty powinnam/powinienem włożyć?",
        a: "Posiadłość ma brukowane ścieżki i trawniki — szpilki nie będą najlepszym wyborem. Słupki, koturny lub eleganckie baleriny są zdecydowanie polecane na wszystkie trzy dni. Dotyczy to szczególnie ceremonii w czwartek.",
      },
      {
        q: "Czy oczekujemy prezentów?",
        a: "Nie! Największym prezentem jest Wasza obecność. Ale dla tych, którzy chcieliby świętować z daleka lub zrobić coś extra — lista prezentów pojawi się wkrótce.",
      },
    ],
  },
};

const Faqs = () => {
  const { language } = useLanguage();
  const registry = registryContent[language];
  const t = faqContent[language];

  return (
    <Layout>
      {/* Registry */}
      <section className="bg-[#464320] text-[#fdfbf7] pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div className="w-[90%] max-w-[700px] mx-auto text-center">
          <FadeIn>
            <div className="w-12 h-px bg-[#fdfbf7]/40 mx-auto mb-8" />
            <p className="heading-card italic tracking-wide leading-relaxed text-[#fdfbf7] mx-auto max-w-2xl text-pretty">
              {registry.body}
            </p>
            <p className="body-small tracking-[0.2em] uppercase text-[#fdfbf7]/70 mt-6 mb-10">
              {registry.signature}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <a
                href={ZOLA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 body-small tracking-widest uppercase bg-[#fdfbf7] text-sage border border-sage px-8 py-2.5 hover:bg-sage hover:text-[#fdfbf7] transition-colors duration-300"
              >
                {registry.zolaLabel}
              </a>
              <a
                href={AMAZON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 body-small tracking-widest uppercase bg-[#fdfbf7] text-sage border border-sage px-8 py-2.5 hover:bg-sage hover:text-[#fdfbf7] transition-colors duration-300"
              >
                {registry.amazonLabel}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQs */}
      <section className="w-[90%] max-w-[800px] mx-auto pt-16 sm:pt-20 pb-24">
        <FadeIn>
          <h1 className="heading-section text-center mb-4">{t.heading}</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>
        <FadeIn delay={150}>
          <Accordion type="single" collapsible className="space-y-2">
            {t.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/50 px-0">
                <AccordionTrigger className="heading-card text-foreground py-6 hover:no-underline text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                  <p className="body-editorial text-left">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default Faqs;
