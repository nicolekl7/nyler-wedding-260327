import FadeIn from "@/components/FadeIn";

const Home = () => (
  <div className="min-h-screen flex items-center bg-[#464320] text-cream">
    <section className="w-[90%] max-w-[1200px] mx-auto py-16 md:py-24 text-center">
      <FadeIn>
        <div className="w-12 h-px bg-cream/40 mx-auto mb-5" />
        <h1 className="heading-section italic font-bold text-cream mb-6">Grazie mille!</h1>
        <p className="heading-card italic tracking-wide leading-relaxed text-cream mx-auto max-w-2xl text-pretty">
          We still can’t believe we got to spend a week in Italy with the people we love the most. Thank you for way too many happy tears and for making us laugh so hard it actually hurt. We already miss you. Same time next year?
        </p>
        <p className="heading-card italic tracking-wide leading-relaxed text-cream mx-auto max-w-2xl text-pretty mt-6">
          Check back soon for photos! Also, buffalo.
        </p>
        <p className="body-small tracking-[0.2em] uppercase text-cream/70 mt-8">
          xx Tyler & Nicole
        </p>
      </FadeIn>
    </section>
  </div>
);

export default Home;
