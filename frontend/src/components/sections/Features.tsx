"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    imageSrc: "/landing/1-AI-Customer-Assistant.png",
    title: "AI Customer Assistant",
    desc: "Responds to WhatsApp, email, and chat with context-aware AI. Handles order status, FAQs, and escalations automatically.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/2-Inventory-Management.png",
    title: "Inventory Management",
    desc: "Live stock tracking with AI reorder suggestions. Get low-stock alerts before customers notice.",
    badge: null,
  },
  {
    imageSrc: "/landing/3-Shipment-Tracking.png",
    title: "Shipment Tracking",
    desc: "Automated cargo tracking with delay detection. Notifies customers proactively — before they ask.",
    badge: null,
  },
  {
    imageSrc: "/landing/4-workflow-automation.png",
    title: "Workflow Automation",
    desc: "Build custom automation rules. Assign tasks to team members automatically based on triggers and conditions.",
    badge: null,
  },
  {
    imageSrc: "/landing/5-Operational-Analytics.png",
    title: "Operational Analytics",
    desc: "Sales trends, stock forecasts, and performance insights. Know what is happening before it becomes a problem.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/6-smart-notifications.png",
    title: "Smart Notifications",
    desc: "AI-prioritized alerts. No noise, only what matters — delivered to the right person at the right time.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/7-Multi-Agent-Architecture.png",
    title: "Multi-Agent Architecture",
    desc: "Domain-specific AI agents work together to orchestrate your entire operation seamlessly.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/8-Integrations-Ready.png",
    title: "Integrations Ready",
    desc: "Webhooks and REST API built in. Connect your existing tools, ERP, or marketplace with minimal effort.",
    badge: null,
  },
];

export function Features() {
  return (
    <section className="py-24" id="features">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything your operation needs
          </h2>
          <p className="text-lg text-muted-foreground">
            One platform. Eight pillars. Fully automated.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="group flex flex-col items-center text-center p-6 rounded-2xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all duration-300"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 bg-white border border-border/40 shadow-sm">
                <Image src={f.imageSrc} alt={f.title} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 300px" />
                {f.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-background/95 backdrop-blur-sm border shadow-sm text-foreground">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold mb-2 text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
