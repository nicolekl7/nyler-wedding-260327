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
        <h1 className="heading-section mb-4">Success!</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-10" />

        <p className="body-editorial mx-auto text-balance mb-6">
          Your room is officially on hold
          {state?.roomName ? ` (${state.roomName})` : ""}. To finalize your booking, please send
          your total room amount
          {state?.price ? ` of $${state.price.toLocaleString()} USD` : ""} via PayPal Friends
          &amp;&nbsp;Family to{" "}
          <a
            href="https://paypal.me/nylerwedding"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
          >
            @NylerWedding
          </a>{" "}
          within 48&nbsp;hours. Please include your room type and the names of your guests in the
          payment note! (Select Friends &amp;&nbsp;Family to avoid fees.)
        </p>

        <a
          href="https://paypal.me/nylerwedding"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
        >
          Pay via PayPal
        </a>
      </section>
    </Layout>
  );
};

export default BookingSuccess;
