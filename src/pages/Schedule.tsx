import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";

const scheduleData = [
  {
    day: "Wednesday, September 16",
    events: [
      { time: "3:00 PM", title: "Check-In" },
      { time: "6:30 PM", title: "Welcome Party" },
    ],
  },
  {
    day: "Thursday, September 17",
    events: [
      { time: "4:30 PM", title: "Ceremony" },
      { time: "5:00 PM", title: "Aperitif" },
      { time: "6:30 PM", title: "Reception" },
    ],
  },
  {
    day: "Friday, September 18",
    events: [{ time: "12:00 PM", title: "Recovery Pool Day" }],
  },
  {
    day: "Saturday, September 19",
    events: [{ time: "10:00 AM", title: "Check Out" }],
  },
];

let eventIndex = 0;

const Schedule = () => (
  <Layout>
    <section className="page-section w-[90%] max-w-[900px] mx-auto">
      <FadeIn>
        <h1 className="heading-section text-center mb-4">The Schedule</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-16" />
      </FadeIn>

      <div className="relative">
        {/* Timeline line with gradient */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20" />

        {scheduleData.map((day, di) => (
          <div key={di} className="mb-16 last:mb-0">
            <FadeIn delay={di * 100}>
              <h2 className="heading-sub text-center mb-8 relative z-10">
                <span className="bg-background px-4">{day.day}</span>
              </h2>
            </FadeIn>
            {day.events.map((event, ei) => {
              const delay = (eventIndex++) * 80 + 150;
              return (
                <FadeIn key={ei} delay={delay}>
                  <div className="relative pl-12 md:pl-0 mb-8 last:mb-0 md:flex md:items-center">
                    {/* Refined marker: ring + inner dot */}
                    <div className="absolute left-1.5 md:left-1/2 md:-translate-x-1/2 top-1 w-5 h-5 rounded-full border-2 border-primary/50 bg-background flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <div className="md:w-1/2 md:text-right md:pr-10">
                      <span className="font-body text-sm text-muted-foreground font-light">
                        {event.time}
                      </span>
                    </div>
                    <div className="md:w-1/2 md:pl-10">
                      <span className="font-serif text-xl text-foreground">{event.title}</span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  </Layout>
);

export default Schedule;
