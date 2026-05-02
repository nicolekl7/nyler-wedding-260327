import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import RoomCardsDisplay from "@/components/RoomCardsDisplay";
import RsvpFormEmbed from "@/components/RsvpFormEmbed";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const strings = {
  en: {
    heading: "Accommodations & RSVP",
    intro1: "We have exclusively reserved all of Borgo Laticastelli for our guests. For guests staying onsite, breakfast, dinners, and drinks at all events are included in your stay.",
    intro2: "To get started, select your room below or let us know you'll be staying offsite.",
    intro3: <><strong>Prices are per room for the entire three-night stay (September 16–19).</strong></>,
    firstComeNote: <>Rooms are available on a first-come, first-served basis.<span className="hidden sm:inline"><br /></span><span className="sm:hidden"> </span>Reservations not paid within 48&nbsp;hours will be released.</>,
    skipRsvp: "Not able to make it? Skip right to the RSVP >",
    skipPayment: "Already RSVP'd and picked a room? Skip right to the payment >",
    thankYou: "Thank You",
    stayingOnsiteP1: "We can't wait to celebrate with you in Tuscany!",
    stayingOnsiteP2: <>Your room is officially on hold. To secure your spot, please send payment below via PayPal Friends &amp;&nbsp;Family to{" "}<a href="https://paypal.me/nylerwedding" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">@NylerWedding</a>{" "}within 48&nbsp;hours. In the payment note, include the names of all guests staying in your room.</>,
    stayingOnsiteP3: <>You can also pay via Venmo to{" "}<a href="https://venmo.com/u/tylermagee" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">@tylermagee</a>.</>,
    joiningRoomP1: "We can't wait to celebrate with you in Tuscany!",
    joiningRoomP2: "You're all set—we've noted that you'll be joining a reserved room. No payment is needed from you; the room holder will take care of it.",
    offsiteP1: "We can't wait to celebrate with you in Tuscany!",
    offsiteP2: "You're all set—we've noted that you'll be joining us offsite. We're so glad you're making the trip and can't wait to see you there.",
    declinedP1: "Thank you so much for letting us know. It truly means a lot that you took the time to respond.",
    declinedP2: "You will absolutely be missed! We hope to celebrate with you soon, and we'll make sure to share all the photos so you can experience a little bit of Tuscany with us from afar.",
    declinedClose: <>With so much love,<br />Nicole &amp; Tyler</>,
    italianClose: "Ci vediamo in Italia!",
    payPaypal: (price?: number) => `Pay with PayPal${price ? ` — $${price.toLocaleString()}` : ""}`,
    payVenmo: (price?: number) => `Pay with Venmo${price ? ` — $${price.toLocaleString()}` : ""}`,
  },
};

const RsvpV2 = () => {
  const [accommodation, setAccommodation] = useState("");
  const [submitResult, setSubmitResult] = useState<{ allDeclined: boolean; accommodation: string } | null>(null);
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>({});
  const formRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = strings[language];

  useEffect(() => {
    const fetchPrices = async () => {
      const { data } = await supabase.from("room_categories").select("name, price");
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((r) => { map[r.name] = r.price; });
        setRoomPrices(map);
      }
    };
    fetchPrices();
  }, []);

  if (submitResult) {
    const noPaymentAccommodations = ["Not Staying Onsite", "Joining a Reserved Room"];
    const price = noPaymentAccommodations.includes(submitResult.accommodation)
      ? undefined
      : roomPrices[submitResult.accommodation];
    const paypalUrl = price
      ? `https://paypal.me/nylerwedding/${price}`
      : "https://paypal.me/nylerwedding";
    const venmoUrl = price
      ? `https://venmo.com/tylermagee?txn=pay&amount=${price}&note=${encodeURIComponent("Wedding accommodation")}`
      : `https://venmo.com/tylermagee?txn=pay&note=${encodeURIComponent("Wedding accommodation")}`;

    const isJoiningRoom = !submitResult.allDeclined && submitResult.accommodation === "Joining a Reserved Room";
    const isStayingOnsite = !submitResult.allDeclined && !noPaymentAccommodations.includes(submitResult.accommodation);
    const isOffsite = !submitResult.allDeclined && submitResult.accommodation === "Not Staying Onsite";
    const isDeclined = submitResult.allDeclined;

    return (
      <Layout>
        <section className="page-section w-[90%] max-w-[700px] mx-auto text-center">
          <FadeIn>
            <h1 className="heading-section mb-4">{t.thankYou}</h1>
            <div className="w-12 h-px bg-primary mx-auto mb-8" />

            {isStayingOnsite && (
              <>
                <p className="body-editorial mx-auto text-balance">{t.stayingOnsiteP1}</p>
                <p className="body-editorial mx-auto text-balance mt-6">{t.stayingOnsiteP2}</p>
                <p className="body-editorial mx-auto text-balance mt-4">{t.stayingOnsiteP3}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                  <a
                    href={paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-10 py-4 bg-white text-primary border border-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {t.payPaypal(price)}
                  </a>
                  <a
                    href={venmoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-10 py-4 bg-white text-primary border border-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {t.payVenmo(price)}
                  </a>
                </div>
                <p className="font-display italic text-lg text-foreground mt-8">{t.italianClose}</p>
              </>
            )}

            {isJoiningRoom && (
              <>
                <p className="body-editorial mx-auto text-balance">{t.joiningRoomP1}</p>
                <p className="body-editorial mx-auto text-balance mt-6">{t.joiningRoomP2}</p>
                <p className="font-display italic text-lg text-foreground mt-8">{t.italianClose}</p>
              </>
            )}

            {isOffsite && (
              <>
                <p className="body-editorial mx-auto text-balance">{t.offsiteP1}</p>
                <p className="body-editorial mx-auto text-balance mt-6">{t.offsiteP2}</p>
                <p className="font-display italic text-lg text-foreground mt-8">{t.italianClose}</p>
              </>
            )}

            {isDeclined && (
              <>
                <p className="body-editorial mx-auto text-balance">{t.declinedP1}</p>
                <p className="body-editorial mx-auto text-balance mt-6">{t.declinedP2}</p>
                <p className="font-display italic text-lg text-foreground mt-8">{t.declinedClose}</p>
              </>
            )}
          </FadeIn>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="page-section w-[90%] max-w-[1400px] mx-auto">
        <FadeIn>
          <h1 className="heading-section text-center mb-4">{t.heading}</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-[655px] mx-auto mb-16">
            <p className="body-editorial mx-auto text-center !leading-snug">{t.intro1}</p>
            <p className="body-editorial mx-auto text-center mt-6 !leading-snug">{t.intro2}</p>
            <p className="body-editorial mx-auto text-center mt-6 text-foreground font-normal !leading-snug">
              {t.intro3}
            </p>
            <div className="mt-4 flex justify-center">
              <div className="px-5 py-3 bg-sage-light rounded-md text-center">
                <p className="body-editorial text-foreground font-normal !leading-snug">
                  {t.firstComeNote}
                </p>
              </div>
            </div>
            <div className="mt-6 text-center space-y-2">
              <p>
                <a
                  href="#rsvp-form"
                  onClick={(e) => { e.preventDefault(); formRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                  className="font-display italic text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.skipRsvp}
                </a>
              </p>
              <p>
                <a
                  href="https://www.nicoleandtylerswedding.com/payment"
                  className="font-display italic text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.skipPayment}
                </a>
              </p>
            </div>
          </div>
        </FadeIn>

        <RoomCardsDisplay
          selectedAccommodation={accommodation}
          onSelectAccommodation={setAccommodation}
          formRef={formRef}
        />
      </section>

      <section ref={formRef} className="page-section w-[90%] max-w-[700px] mx-auto scroll-mt-24">
        <RsvpFormEmbed
          accommodation={accommodation}
          onAccommodationChange={setAccommodation}
          onSubmitSuccess={(allDeclined, acc) => setSubmitResult({ allDeclined, accommodation: acc })}
        />
      </section>
    </Layout>
  );
};

export default RsvpV2;
