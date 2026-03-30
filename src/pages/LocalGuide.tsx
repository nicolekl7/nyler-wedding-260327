import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import thermalImg from "@/assets/guide-thermal-baths.jpg";
import sienaImg from "@/assets/guide-siena.jpg";
import valdorciaImg from "@/assets/guide-valdorcia.jpg";
import chiantiImg from "@/assets/guide-chianti.jpg";

import montalcinoImg from "@/assets/guide-montalcino.jpg";

const guides = [
  {
    title: "Rapolano Thermal Baths",
    subtitle: "5 Minutes Away",
    image: thermalImg,
    alt: "Natural thermal baths with turquoise pools in Rapolano Terme, Tuscany",
    body: null,
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
    body: null,
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
    body: null,
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
    body: null,
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
    body: null,
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
];

const LocalGuide = () => (
  <Layout>
    <section className="page-section w-[90%] max-w-[1400px] mx-auto">
      <FadeIn>
        <h1 className="heading-section text-center mb-4">Local Guide</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-6" />
        <p className="body-editorial text-center mx-auto mb-16">
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
                
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light">
                  {g.title}
                </h2>
                {g.subtitle && (
                  <p className="font-body text-sm text-muted-foreground">{g.subtitle}</p>
                )}
                {g.body ? <p className="body-editorial">{g.body}</p> : g.richBody}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  </Layout>
);

export default LocalGuide;
