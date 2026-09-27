import FadeIn from "@/components/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  en: {
    dateLine: "September 17, 2026 | Tuscany, Italy",
    dateLineLong: "September 17, 2026 | Rapolano Terme, Tuscany, Italy",
    quote: "There is no place more beautiful and no group of people we’d rather share it with. Thank you for deciding to make the journey to celebrate with us! Ci vediamo in Italia!",
    signature: "xx Tyler & Nicole",
  },
  pl: {
    dateLine: "17 września 2026 | Toskania, Włochy",
    dateLineLong: "17 września 2026 | Rapolano Terme, Toskania, Włochy",
    quote: "Nie ma piękniejszego miejsca i wspanialszej grupy ludzi, z którą wolelibyśmy się nim podzielić. Dziękujemy, że zdecydowaliście się na tę podróż, aby świętować razem z nami! Ci vediamo in Italia!",
    signature: "xx Tyler i Nicole",
  },
};

const Home = () => {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Hero — video background */}
      <section className="relative h-[85vh] flex items-end overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover pointer-events-none [&::-webkit-media-controls-start-playback-button]:hidden [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-panel]:hidden"
          style={{ WebkitAppearance: "none" } as React.CSSProperties}
        >
          <source src="https://res.cloudinary.com/dx9jqeqxj/video/upload/v1774652318/hero-tuscany-video_vkp2gn.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1a]/90 via-[#1a2e1a]/20 to-transparent" />
        <FadeIn className="relative z-10 px-6 md:px-12 lg:px-24 pb-16 md:pb-24">
          <h1 className="heading-display mb-4 text-[#fdfbf7]">
            Nicole <span className="font-light italic">&</span> Tyler
          </h1>
          <p className="label-xs tracking-[0.158em] text-[#fdfbf7] opacity-75 sm:-mt-2">
            <span className="inline sm:hidden">{t.dateLine}</span>
            <span className="hidden sm:inline text-[1.5048em]">{t.dateLineLong}</span>
          </p>
        </FadeIn>
      </section>

      {/* Quote */}
      <section className="flex-1 pt-12 md:pt-16 pb-16 md:pb-24 w-[90%] max-w-[1200px] mx-auto text-center">
        <FadeIn>
          <div className="w-12 h-px bg-primary mx-auto mb-5" />
          <p className="heading-card italic tracking-wide leading-relaxed text-foreground mx-auto max-w-2xl text-pretty">
            {t.quote}
          </p>
          <p className="body-small tracking-[0.2em] uppercase text-muted-foreground mt-8">
            {t.signature}
          </p>
        </FadeIn>
      </section>
    </div>
  );
};

export default Home;
