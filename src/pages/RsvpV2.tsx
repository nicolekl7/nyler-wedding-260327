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

    return (
      <Layout>
        <section className="page-section w-[90%] max-w-[700px] mx-auto text-center">
          <FadeIn>
            <h1 className="heading-section mb-4">Thank You</h1>
            <div className="w-12 h-px bg-primary mx-auto mb-8" />
            <p className="body-editorial mx-auto text-balance">
              Your RSVP has been recorded.
              <br />
              {submitResult.allDeclined
                ? "We're sorry we'll miss you!"
                : "We can't wait to celebrate with you!"}
            </p>
            {!submitResult.allDeclined && submitResult.accommodation !== "Not Staying Onsite" && (
              <>
                <p className="font-body text-sm text-muted-foreground mt-6">
                  Please note: your room is not reserved until payment is received. It will be held for 48 hours before being released.
                </p>
                <a
                  href={paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 px-8 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
                >
                  Pay Here{price ? ` — $${price}` : ""}
                </a>
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
          <div className="max-w-[660px] mx-auto mb-16">
            <p className="body-editorial mx-auto text-center !leading-snug">
              We have exclusively reserved all of Borgo Laticastelli for our guests. If you are staying onsite, all meals and drinks are covered for the full three days—our treat! To get started, select your room below or let us know you'll be staying offsite. Once you've made your selection, you'll be taken directly to the RSVP for the weekend's events.
            </p>
            <p className="body-editorial mx-auto text-center mt-4 text-foreground font-normal !leading-snug">
              Rooms are available on a first-come, first-served basis. Prices are per room for the full three-night stay and cannot be prorated. Please note that reservations not paid within 48 hours will be released.
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
