import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";

const Payment = () => {
  return (
    <Layout>
      <section className="page-section max-w-xl mx-auto text-center">
        <FadeIn>
          <h1 className="heading-section mb-4">Room Payment</h1>
          <div className="w-12 h-px bg-primary mx-auto mb-10" />

          <p className="body-editorial mx-auto text-balance mb-4">
            To secure your room, please send your total room amount via PayPal Friends &amp; Family
            or Venmo within 48&nbsp;hours of RSVPing.
          </p>
          <p className="body-editorial mx-auto text-balance mb-10">
            In your payment note, please include your room type and the names of all guests staying
            in your room.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://paypal.me/nylerwedding"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 bg-primary text-primary-foreground font-body text-xs uppercase tracking-[0.25em] hover:opacity-90 transition-opacity"
            >
              Pay with PayPal
            </a>
            <a
              href={`https://venmo.com/tylermagee?txn=pay&note=${encodeURIComponent("Wedding accommodation")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 border border-primary text-primary font-body text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Pay with Venmo
            </a>
          </div>

          <p className="font-body text-sm text-muted-foreground mt-10">
            Questions? Email us at{" "}
            <a
              href="mailto:nicoleandtylersitalianwedding@gmail.com"
              className="text-primary underline underline-offset-4"
            >
              nicoleandtylersitalianwedding@gmail.com
            </a>
          </p>
        </FadeIn>
      </section>
    </Layout>
  );
};

export default Payment;
