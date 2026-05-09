"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Layers, Clock } from "lucide-react";

const problems = [
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Fragmented Communication",
    desc: "Your team juggles WhatsApp, emails, and DMs simultaneously — losing context, missing orders, and frustrating customers.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Manual Inventory Chaos",
    desc: "Spreadsheets break down the moment demand spikes. Stockouts and overstocking quietly drain your margins every week.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Shipment Blind Spots",
    desc: "Customers complain about delays before your team even knows there is a problem. Manual tracking simply cannot scale.",
  },
];

export function Problem() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Most SMEs hit the same operational wall. Manual processes that worked at 100 orders/month collapse at 1,000.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-background p-8 rounded-2xl border"
            >
              <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-5">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
