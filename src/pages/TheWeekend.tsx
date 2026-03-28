import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import welcomeBottle from "@/assets/Welcome-Party-Bottle.png";
import welcomeCup from "@/assets/Welcome-Party-Cup.png";
import weddingIcon from "@/assets/Wedding-4.png";
import poolUmbrella from "@/assets/Pool-Party-Umbrella.png";
import poolChairs from "@/assets/Pool-Party-Chairs.png";
import poolSun from "@/assets/Pool-Party-Sun.png";

const itinerary = [
  {
    day: "Wednesday, September 16",
    title: "Welcome Party",
    description:
      "Join us under the stars for wood-fired pizza and the best wine in the world to welcome you to Tuscany.",
    attire:
      "La Notte Bianca — All white everything: linens, summer dresses, effortless Italian style. You've spent years avoiding white at weddings. This is your night. Head to toe, linens to silk.. whatever you'd like but all white, no exceptions.",
    icon: null, // handled separately
  },
  {
    day: "Thursday, September 17",
    title: "The Wedding Day",
    description:
      "Our ceremony overlooking the Tuscan hills, followed by an evening of aperitivo, dinner, and dancing the night away.",
    attire:
      "Tuscan Formal — Floor-length dresses. Suits. Rich colors and textures are encouraged. Dress up and have fun with it!\n\n\n(Please note the grounds feature cobblestone and grass—block heels are recommended)",
    icon: weddingIcon,
  },
  {
    day: "Friday, September 18",
    title: "La Dolce Far Niente Pool Party",
    description: "The art of doing nothing. Recover by the pool with lunch, drinks, and sunshine.",
    attire: "Vintage Resort Wear",
    icon: null,
  },
];

const faqs = [
  {
    q: "What is the weather like in September?",
    a: "Late September in Tuscany is typically beautiful, with warm, sunny days (around 75°F / 24°C) and crisp evenings (around 55°F / 13°C). We recommend bringing a light jacket or wrap for the evening events. Don't forget a bathing suit!",
  },
  {
    q: "What shoes should I wear?",
    a: "The estate features cobblestone paths and grass so please keep this in mind when selecting your shoes. Block heels or wedges are strongly recommended across all three days, and especially for the ceremony on Thursday. Refer to each day's attire description for full guidance.",
  },
  {
    q: "Are kids welcome?",
    a: "This celebration is just for the grown-ups. We do have a small number of children attending who are part of the immediate family. Thank you for understanding!",
  },
  {
    q: "Can I bring a date?",
    a: "While we'd love to celebrate with everyone, our venue has limited capacity. We are only able to accommodate the guests specifically listed on your invitation.",
  },
  {
    q: "Are gifts expected?",
    a: "No! The greatest gift you can give us is being there. That said, for those who'd like to celebrate from afar or do a little something extra, we will put together a registry.",
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
              <div className={`relative pl-16 ${i === 2 ? "mt-1" : ""}`}>
                {/* Timeline marker — aligned with the date */}
                <div
                  className={`absolute left-3.5 w-5 h-5 rounded-full border-2 border-primary/40 bg-background flex items-center justify-center ${i === 2 ? "top-2" : "top-1"}`}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                <p className={`heading-sub text-foreground mb-2 ${i === 2 ? "pt-1" : ""}`}>
                  {i === 2 ? (
                    <>
                      <span className="block sm:inline">Friday,</span>{" "}
                      <span className="block sm:inline">September 18</span>
                    </>
                  ) : (
                    event.day
                  )}
                </p>

                {/* Icon */}
                {i === 0 ? (
                  <div className="relative w-28 h-20 mb-1 mt-0.5">
                    {/* Glass — stays still */}
                    <img src={welcomeCup} alt="Glass" className="absolute bottom-0 left-0 w-12 h-12 object-contain" />
                    {/* Bottle — pours */}
                    <motion.img
                      src={welcomeBottle}
                      alt="Bottle"
                      className="absolute -top-[16px] left-[34px] w-16 h-16 object-contain origin-bottom-left"
                      animate={{ rotate: [0, -15, 0, -15, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                    />
                  </div>
                ) : i === 2 ? (
                  <div className="relative w-32 h-24 -mb-2 -mt-1">
                    {/* Sun — twirling rise */}
                    <motion.img
                      src={poolSun}
                      alt="Sun"
                      className="absolute w-14 h-14 object-contain z-0"
                      animate={{
                        top: [17, -10, 17],
                        right: [44, 0, 44],
                        rotate: [0, 360, 0],
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Umbrella */}
                    <img
                      src={poolUmbrella}
                      alt="Umbrella"
                      className="absolute top-[30px] left-[22px] w-20 h-16 object-contain z-10"
                    />
                    {/* Chairs */}
                    <img
                      src={poolChairs}
                      alt="Chairs"
                      className="absolute bottom-0 left-0 w-28 h-12 object-contain z-[5]"
                    />
                  </div>
                ) : (
                  <motion.img
                    src={event.icon!}
                    alt={event.title}
                    className="w-[100px] h-[100px] object-contain -mt-5"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                <h2
                  className={`font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-4 ${i === 1 ? "-mt-3.5" : i === 2 ? "-mt-1" : ""}`}
                >
                  {event.title}
                </h2>
                <p className="body-editorial mb-4">{event.description}</p>
                <p className="font-body text-sm text-muted-foreground italic">Attire: {event.attire}</p>
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
            <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/50 px-0">
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
