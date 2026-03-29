import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import RoomCardsDisplay from "@/components/RoomCardsDisplay";
import RsvpFormEmbed from "@/components/RsvpFormEmbed";
import { supabase } from "@/integrations/supabase/client";

const RsvpV2 = () => {
  const [accommodation, setAccommodation] = useState("");
  const [submitResult, setSubmitResult] = useState<{ allDeclined: boolean; accommodation: string } | null>(null);
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>({});
  const formRef = useRef<HTMLDivElement>(null);

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
    const price = roomPrices[submitResult.accommodation];
    const paypalUrl = price
      ? `https://paypal.me/nylerwedding/${price}`
      : "https://paypal.me/nylerwedding";

    const isStayingOnsite = !submitResult.allDeclined && submitResult.accommodation !== "Not Staying Onsite";
    const isOffsite = !submitResult.allDeclined && submitResult.accommodation === "Not Staying Onsite";
    const isDeclined = submitResult.allDeclined;

    return (
      <Layout>
        <section className="page-section w-[90%] max-w-[700px] mx-auto text-center">
          <FadeIn>
            <h1 className="heading-section mb-4">Thank You</h1>
            <div className="w-12 h-px bg-primary mx-auto mb-8" />

            {isStayingOnsite && (
              <>
                <p className="body-editorial mx-auto text-balance">
                  We can't wait to celebrate with you in Tuscany!
                </p>
                <p className="body-editorial mx-auto text-balance mt-6">
                  Your room is officially on hold. To secure your spot, please send payment below via PayPal Friends &amp;&nbsp;Family to @NylerWedding within 48&nbsp;hours. In the payment note, include the names of all guests staying in your room.
                </p>
                <a
                  href={paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-8 px-10 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
                >
                  Pay via PayPal{price ? ` — $${price}` : ""}
                </a>
                <p className="font-display italic text-lg text-foreground mt-8">
                  Ci vediamo in Italia!
                </p>
              </>
            )}

            {isOffsite && (
              <>
                <p className="body-editorial mx-auto text-balance">
                  We can't wait to celebrate with you in Tuscany!
                </p>
                <p className="body-editorial mx-auto text-balance mt-6">
                  You're all set—we've noted that you'll be joining us offsite. We're so glad you're making the trip and can't wait to see you there.
                </p>
                <p className="font-display italic text-lg text-foreground mt-8">
                  Ci vediamo in Italia!
                </p>
              </>
            )}

            {isDeclined && (
              <>
                <p className="body-editorial mx-auto text-balance">
                  Thank you so much for letting us know. It truly means a lot that you took the time to respond.
                </p>
                <p className="body-editorial mx-auto text-balance mt-6">
                  You will absolutely be missed! We hope to celebrate with you soon, and we'll make sure to share all the photos so you can experience a little bit of Tuscany with us from afar.
                </p>
                <p className="font-display italic text-lg text-foreground mt-8">
                  With so much love,
                  <br />
                  Nicole &amp; Tyler
                </p>
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
          <h1 className="heading-section text-center mb-4">
            Accommodations & RSVP
          </h1>
          <div className="w-12 h-px bg-primary mx-auto mb-12" />
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-[655px] mx-auto mb-16">
            <p className="body-editorial mx-auto text-center !leading-snug">
              We have exclusively reserved all of Borgo Laticastelli for our guests. For those opting to stay onsite, all meals and drinks throughout the full stay are on&nbsp;us.
            </p>
            <p className="body-editorial mx-auto text-center mt-6 !leading-snug">
              To get started, select your room below or let us know you'll be staying offsite.
            </p>
            <p className="body-editorial mx-auto text-center mt-6 text-foreground font-normal !leading-snug">
              Rooms are available on a first-come, first-served basis. Prices are based per room for the entire three-night stay.
              <span className="block mt-3 md:inline md:mt-0"> Please note that reservations not paid within 48&nbsp;hours will be released.</span>
            </p>
            <p className="mt-6 text-center">
              <a
                href="#rsvp-form"
                onClick={(e) => { e.preventDefault(); formRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                className="font-display italic text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Not able to make it? Skip right to the RSVP &gt;
              </a>
            </p>
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
