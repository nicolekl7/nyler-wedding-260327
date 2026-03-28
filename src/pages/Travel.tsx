import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import { MapPin } from "lucide-react";
import airImg from "@/assets/travel-by-air.avif";
import trainImg from "@/assets/travel-by-train.jpg";
import carImg from "@/assets/travel-by-car.jpg";

const sections = [
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
    address: true,
  },
];

const Travel = () => (
  <Layout>
    <section className="page-section w-[90%] max-w-[1000px] mx-auto text-center">
      <FadeIn>
        <h1 className="heading-section mb-4">Getting to Borgo Laticastelli</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-8" />
        <p className="body-editorial mx-auto text-balance">
          The journey to Tuscany is part of the magic. Whether you fly, take the train, or rent a car, every route leads through some of the most beautiful landscape in the world.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="https://www.google.com/maps/place/Laticastelli+Country+Relais/data=!4m2!3m1!1s0x0:ce0b4890bdc26bce?sa=X&ved=1t:2428&ictx=111"
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif text-base md:text-lg text-foreground italic hover:text-primary transition-colors underline underline-offset-4 decoration-primary/40"
          >
            Laticastelli Country Relais
            <br />
            Via Laticastelli, Rapolano Terme, Province of Siena, Italy
          </a>
        </div>
      </FadeIn>
    </section>

    <section className="px-6 md:px-12 lg:px-24 pb-16 md:pb-24 w-[90%] max-w-[1400px] mx-auto">
      <FadeIn>
        <div className="border border-border bg-stone-light/40 px-8 py-8 md:px-12 md:py-10">
          <p className="heading-sub text-primary mb-4">Things to Know</p>
          <p className="font-body text-sm leading-[1.9] text-muted-foreground font-light">
            <strong className="text-foreground font-medium">Important:</strong> Italy requires your passport to be valid for at least six months beyond your planned date of departure. Please check your passport expiration date today! If it expires before March 2027, you will need to renew it before booking your flights.
          </p>
          <p className="font-body text-sm leading-[1.9] text-muted-foreground font-light mt-4">
              If you plan to rent a car, you will need an International Driver's Permit (IDP)—required by Italian law. You can obtain one through AAA for approximately $20 before your trip.
              <br />
              <strong className="text-foreground font-medium">Also, don't forget to pack Type C or Type L travel adapters.</strong>
            </p>
        </div>
      </FadeIn>
    </section>

    <div className="space-y-24 md:space-y-40 pb-16 md:pb-32">
      {sections.map((s, i) => (
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
  </Layout>
);

export default Travel;
