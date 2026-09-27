import FadeIn from "@/components/FadeIn";

const Home = () => (
  <div className="min-h-screen flex items-center bg-background text-foreground">
    <section className="w-[90%] max-w-[1200px] mx-auto py-16 md:py-24 text-center">
      <FadeIn>
        <h1 className="heading-display mb-4">
          Nicole <span className="font-light italic">&</span> Tyler
        </h1>
        <p className="label-xs tracking-[0.158em] opacity-75 sm:-mt-2">
          <span className="inline sm:hidden">September 17, 2026 | Tuscany, Italy</span>
          <span className="hidden sm:inline text-[1.5048em]">September 17, 2026 | Rapolano Terme, Tuscany, Italy</span>
        </p>
      </FadeIn>

      <FadeIn delay={150} className="mt-12 md:mt-16">
        <div className="w-12 h-px bg-primary mx-auto mb-5" />
        <p className="heading-card italic tracking-wide text-foreground mb-4">Grazie mille!</p>
        <p className="heading-card italic tracking-wide leading-relaxed text-foreground mx-auto max-w-2xl text-pretty">
          We still can’t believe we got to spend an entire week in Italy with the people we love the most. Thank you for every tear, sore abs from all the laughter, and for giving us everything you had on the dance floor. Same time next year..? We love you all. Check back soon for photos.
        </p>
        <p className="body-small tracking-[0.2em] uppercase text-muted-foreground mt-8">
          Con amore,
          <br />
          Nicole & Tyler
        </p>
      </FadeIn>
    </section>
  </div>
);

export default Home;
