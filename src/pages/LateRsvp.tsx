import Layout from "@/components/Layout";

const LateRsvp = () => {
  return (
    <Layout>
      <section className="page-section max-w-xl mx-auto text-center">
        <h1 className="heading-section mb-4">RSVPs Closed</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-6" />
        <p className="body-editorial mx-auto text-balance">
          RSVPs for this event have closed. Contact Nicole or Tyler for help.
        </p>
      </section>
    </Layout>
  );
};

export default LateRsvp;
