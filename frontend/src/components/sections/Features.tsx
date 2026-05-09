"use client";
import { motion } from "framer-motion";
import { Bot, Box, Truck, Workflow, BarChart3, MessageSquare, BellRing, Plug } from "lucide-react";

const features = [
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "AI Customer Assistant",
    desc: "Responds to WhatsApp, email, and chat with context-aware AI. Handles order status, FAQs, and escalations automatically.",
    badge: "AI",
  },
  {
    icon: <Box className="h-5 w-5" />,
    title: "Inventory Management",
    desc: "Live stock tracking with AI reorder suggestions. Get low-stock alerts before customers notice.",
    badge: null,
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Shipment Tracking",
    desc: "Automated cargo tracking with delay detection. Notifies customers proactively — before they ask.",
    badge: null,
  },
  {
    icon: <Workflow className="h-5 w-5" />,
    title: "Workflow Automation",
    desc: "Build custom automation rules. Assign tasks to team members automatically based on triggers and conditions.",
    badge: null,
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Operational Analytics",
    desc: "Sales trends, stock forecasts, and performance insights. Know what is happening before it becomes a problem.",
    badge: "AI",
  },
  {
    icon: <BellRing className="h-5 w-5" />,
    title: "Smart Notifications",
    desc: "AI-prioritized alerts. No noise, only what matters — delivered to the right person at the right time.",
    badge: "AI",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "Multi-Agent Architecture",
    desc: "Domain-specific AI agents work together to orchestrate your entire operation seamlessly.",
    badge: "AI",
  },
  {
    icon: <Plug className="h-5 w-5" />,
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
              className="group p-6 rounded-2xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  {f.icon}
                </div>
                {f.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
