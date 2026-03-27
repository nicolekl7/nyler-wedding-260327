import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import thermalImg from "@/assets/guide-thermal-baths.jpg";
import sienaImg from "@/assets/guide-siena.jpg";
import valdorciaImg from "@/assets/guide-valdorcia.jpg";
import chiantiImg from "@/assets/guide-chianti.jpg";

const guides = [
  {
    tag: "Relax",
    title: "The Thermal Baths of Rapolano",
    image: thermalImg,
    alt: "Natural thermal baths with turquoise pools in Rapolano Terme, Tuscany",
    body: "Rapolano Terme is famous for its natural hot springs. Terme San Giovanni and Antica Querciolaia are just minutes from the venue. They feature gorgeous travertine pools filled with naturally warm thermal water—the ultimate cure for jet lag.",
  },
  {
    tag: "Explore",
    title: "Siena",
    subtitle: "25 Minutes Away",
    image: sienaImg,
    alt: "The medieval Piazza del Campo in Siena, Italy",
    body: "Siena is a stunning medieval city. Wander through the Piazza del Campo (one of Europe's greatest medieval squares), grab a gelato, and visit the breathtaking Duomo di Siena.",
  },
  {
    tag: "Wander",
    title: "Val d'Orcia & Pienza",
    subtitle: "45 Minutes Away",
    image: valdorciaImg,
    alt: "Rolling green hills with cypress trees in Val d'Orcia, Tuscany",
    body: "Drive down to Pienza, a beautiful Renaissance town famous for its pecorino cheese and unbelievable panoramic views of classic Tuscan rolling hills and cypress trees.",
  },
  {
    tag: "Sip",
    title: "Chianti & Montepulciano",
    image: chiantiImg,
    alt: "Vineyards in Chianti with a rustic stone winery, Tuscany",
    body: "Head north into the Chianti Classico region, or south to Montepulciano to taste their famous Vino Nobile. We highly recommend booking tastings in advance!",
  },
];

const LocalGuide = () => (
  <Layout>
    <section className="page-section w-[90%] max-w-[1400px] mx-auto">
      <FadeIn>
        <h1 className="heading-section text-center mb-4">Local Guide</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-6" />
        <p className="body-editorial text-center mx-auto mb-16 whitespace-nowrap">
          Extending your trip? Here are some of our favorite Tuscan highlights near the venue.
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
                <p className="heading-sub text-primary">{g.tag}</p>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light">
                  {g.title}
                </h2>
                {g.subtitle && (
                  <p className="font-body text-sm text-muted-foreground">{g.subtitle}</p>
                )}
                <p className="body-editorial">{g.body}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  </Layout>
);

export default LocalGuide;
