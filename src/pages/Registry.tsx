import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
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

const Registry = () => {
  const { language } = useLanguage();
  const registry = registryContent[language];

  return (
    <Layout>
      <section className="bg-[#464320] text-[#fdfbf7] pt-24 pb-24 sm:pt-28 sm:pb-28 min-h-[60vh] flex items-center">
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
    </Layout>
  );
};

export default Registry;
