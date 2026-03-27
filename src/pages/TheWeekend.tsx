import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const itinerary = [
  {
    day: "Wednesday, September 16",
    title: "Welcome Party",
    description:
      "Join us under the stars for wood-fired pizza, Aperol Spritzes, and a warm welcome to Tuscany.",
    attire:
      "La Dolce Vita Casual (Linens, summer dresses, effortless Italian style)",
  },
  {
    day: "Thursday, September 17",
    title: "The Wedding Day",
    description:
      "Our ceremony overlooking the Tuscan hills, followed by an evening of aperitivo, dinner, and dancing the night away.",
    attire:
      "Tuscan Formal (Please note the grounds feature cobblestone and grass— block heels are recommended!)",
  },
  {
    day: "Friday, September 18",
    title: "La Dolce Far Niente Pool Party",
    description:
      "The art of doing nothing. Recover by the pool with lunch, drinks, and sunshine.",
    attire: "Vintage Resort Wear",
  },
];

const faqs = [
  {
    q: "What is the weather like in September?",
    a: "Late September in Tuscany is typically beautiful, with warm, sunny days (around 75°F / 24°C) and crisp, cool evenings (around 55°F / 13°C). We recommend bringing a light jacket, wrap, or shawl for the evening events. Don't forget a bathing suit for the pool!",
  },
  {
    q: "Are gifts expected?",
    a: "Absolutely not. You traveling across the world to celebrate with us is the greatest gift we could ever ask for! Please, no formal gifts.",
  },
];

const TheWeekend = () => (
  <Layout>
    {/* Header */}
    <section className="page-section w-[90%] max-w-[1000px] mx-auto text-center">
      <FadeIn>
        <h1 className="heading-section mb-4">The Events</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-8" />
        <p className="body-editorial mx-auto text-balance">
          Three days in the Tuscan countryside. Here's what to expect.
        </p>
      </FadeIn>
    </section>

    {/* Itinerary Timeline */}
    <section className="w-[90%] max-w-[800px] mx-auto pb-24">
      <div className="relative w-[90%] max-w-[900px] mx-auto">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10" />

        <div className="space-y-20">
          {itinerary.map((event, i) => (
            <FadeIn key={event.title} delay={i * 150}>
              <div className="relative pl-16">
                {/* Timeline marker */}
                <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full border-2 border-primary/40 bg-background flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                <p className="heading-sub text-foreground mb-3">{event.day}</p>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-4">
                  {event.title}
                </h2>
                <p className="body-editorial mb-4">{event.description}</p>
                <p className="font-body text-sm text-muted-foreground italic">
                  Attire: {event.attire}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    {/* Concierge FAQs */}
    <section className="w-[90%] max-w-[800px] mx-auto pb-24">
      <FadeIn>
        <h2 className="heading-section text-center mb-4">Concierge FAQs</h2>
        <div className="w-12 h-px bg-primary mx-auto mb-12" />
      </FadeIn>
      <FadeIn delay={150}>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-b border-border/50 px-0"
            >
              <AccordionTrigger className="font-serif text-xl md:text-2xl text-foreground font-light py-6 hover:no-underline text-left">
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

    {/* Navigation buttons */}
    <section className="w-[90%] max-w-[900px] mx-auto px-6 md:px-12 pb-24">
      <FadeIn>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/travel"
            className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            Travel →
          </Link>
          <Link
            to="/local-guide"
            className="inline-flex items-center justify-center gap-2 font-body text-sm tracking-widest uppercase border border-border px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            Explore →
          </Link>
        </div>
      </FadeIn>
    </section>
  </Layout>
);

export default TheWeekend;
