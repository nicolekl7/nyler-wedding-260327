import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";

const BookingSuccess = () => {
  const location = useLocation();
  const state = location.state as {
    roomName?: string;
    price?: number;
  } | null;

  return (
    <Layout>
      <section className="page-section max-w-xl mx-auto text-center">
        <h1 className="heading-section mb-4">Thank You</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-6" />

        <p className="body-editorial mx-auto text-balance mb-8">
          We can't wait to celebrate with you in Tuscany!
        </p>

        <p className="body-editorial mx-auto text-balance mb-4">
          Your room is officially on hold
          {state?.roomName ? ` (${state.roomName})` : ""}. To secure your spot, please send
          payment below via PayPal Friends &amp;&nbsp;Family to{" "}
          <a
            href="https://paypal.me/nylerwedding"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
          >
            @NylerWedding
          </a>{" "}
          within 48&nbsp;hours. In the payment note, include the names of all guests staying in
          your room.
        </p>
        <p className="body-editorial mx-auto text-balance mb-6">
          You can also pay via Venmo to{" "}
          <a
            href="https://venmo.com/u/tylermagee"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
          >
            @tylermagee
          </a>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={state?.price ? `https://paypal.me/nylerwedding/${state.price}` : "https://paypal.me/nylerwedding"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-white text-primary border border-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Pay with PayPal{state?.price ? ` — $${state.price.toLocaleString()}` : ""}
          </a>
          <a
            href={state?.price
              ? `https://venmo.com/tylermagee?txn=pay&amount=${state.price}&note=${encodeURIComponent("Wedding accommodation")}`
              : "https://venmo.com/u/tylermagee"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-white text-primary border border-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Pay with Venmo{state?.price ? ` — $${state.price.toLocaleString()}` : ""}
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default BookingSuccess;
