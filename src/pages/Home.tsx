import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  en: {
    heading: "Grazie mille!",
    body: "We still can’t believe we got to spend a week in Italy with the people we love the most. Thank you for way too many happy tears and for making us laugh so hard it actually hurt. We already miss you. Same time next year?",
    closing: "Check back soon for photos! Also, buffalo.",
    signature: "xx Tyler & Nicole",
  },
  pl: {
    heading: "Grazie mille!",
    body: "Wciąż nie możemy uwierzyć, że spędziliśmy tydzień we Włoszech z ludźmi, których kochamy najbardziej. Dziękujemy za mnóstwo łez szczęścia i za to, że rozśmieszaliście nas tak bardzo, że aż bolało. Już za Wami tęsknimy. Za rok o tej samej porze?",
    closing: "Zajrzyjcie tu wkrótce po zdjęcia! Aha, i buffalo.",
    signature: "xx Tyler i Nicole",
  },
};

const Home = () => {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <Layout hideFooterImage>
      <div className="min-h-[calc(100vh-4rem)] flex items-center bg-[#464320] text-cream">
        <section className="w-[90%] max-w-[1200px] mx-auto py-16 md:py-24 text-center">
          <FadeIn>
            <div className="w-12 h-px bg-cream/40 mx-auto mb-5" />
            <h1 className="heading-section italic font-bold text-cream mb-6">{t.heading}</h1>
            <p className="heading-card italic tracking-wide leading-relaxed text-cream mx-auto max-w-2xl text-pretty">
              {t.body}
            </p>
            <p className="heading-card italic tracking-wide leading-relaxed text-cream mx-auto max-w-2xl text-pretty mt-6">
              {t.closing}
            </p>
            <p className="body-small tracking-[0.2em] uppercase text-cream/70 mt-8">
              {t.signature}
            </p>
          </FadeIn>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
