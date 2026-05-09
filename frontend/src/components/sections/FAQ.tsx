"use client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who is Tesera built for?",
    a: "Tesera is designed for SMEs, cooperatives, boutique e-commerce businesses, and hybrid physical-online sellers. If you manage orders, inventory, shipments, or customer communication — Tesera is for you.",
  },
  {
    q: "Do I need technical knowledge to set up Tesera?",
    a: "No. Tesera features a guided onboarding flow with step-by-step setup. Most businesses are fully operational within 30 minutes.",
  },
  {
    q: "How does the AI Customer Assistant work?",
    a: "Tesera's AI agent reads incoming messages across your connected channels, understands the customer's intent, and generates context-aware replies — including order status, shipping updates, and FAQs. You can review and customize all responses.",
  },
  {
    q: "Can I connect my existing tools?",
    a: "Yes. Tesera provides REST API and webhook support. Enterprise plans include dedicated integration assistance and custom connectors.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. Enterprise plans include SSO, advanced permissions, and dedicated SLAs.",
  },
  {
    q: "Can I try Tesera before paying?",
    a: "Yes — 14-day free trial with full access. No credit card required.",
  },
];

export function FAQ() {
  return (
    <section className="py-24">
      <div className="section-container max-w-3xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left font-medium py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
