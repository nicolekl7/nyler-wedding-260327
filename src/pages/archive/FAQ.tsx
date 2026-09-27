import Layout from "@/components/Layout";
import FadeIn from "@/components/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Can I bring a date?",
    a: "While we'd love to celebrate with everyone, our venue has limited capacity. As a result, we are only able to accommodate the guests specifically listed on your invitation.",
  },
  {
    q: "Are kids welcome?",
    a: "We love your kids, we really do. However, this celebration is just for the grown-ups (and a few little ones who are in the wedding party). Thank you for understanding!",
  },
  {
    q: "Is there parking?",
    a: "Yes, there is plenty of onsite parking available at Borgo Laticastelli.",
  },
];

const FAQ = () => (
  <Layout>
    <section className="page-section w-[90%] max-w-[900px] mx-auto">
      <FadeIn>
        <h1 className="heading-section text-center mb-4">Frequently Asked</h1>
        <div className="w-12 h-px bg-primary mx-auto mb-16" />
      </FadeIn>

      <FadeIn delay={150}>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-b border-border/50 px-0"
            >
              <AccordionTrigger className="font-serif text-xl md:text-2xl text-foreground font-light py-6 hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-8">
                <p className="body-editorial text-left">{faq.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </section>
  </Layout>
);

export default FAQ;
