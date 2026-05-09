"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free Trial",
    price: "Free",
    period: "14 days",
    desc: "Full platform access to explore Tesera with your team.",
    features: [
      "All core features",
      "Up to 3 users",
      "1,000 AI messages",
      "Community support",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    desc: "Perfect for boutique e-commerce and small teams.",
    features: [
      "Everything in Free",
      "Up to 10 users",
      "10,000 AI messages",
      "Email & chat support",
      "3 integrations",
    ],
    cta: "Get Started",
    href: "/register?plan=starter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/month",
    desc: "For scaling operations with complex automation needs.",
    features: [
      "Everything in Starter",
      "Unlimited users",
      "100,000 AI messages",
      "Priority support",
      "Unlimited integrations",
      "Custom automation rules",
      "Advanced analytics",
    ],
    cta: "Get Started",
    href: "/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Advanced AI agents, SLAs, and custom integrations at scale.",
    features: [
      "Everything in Growth",
      "Dedicated AI agents",
      "Custom onboarding",
      "SSO & advanced security",
      "Dedicated SLA",
      "API priority access",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 bg-muted/40" id="pricing">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free. Scale as you grow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className={cn(
                "relative p-7 rounded-2xl border flex flex-col",
                plan.highlighted
                  ? "bg-primary text-primary-foreground border-primary glow-border"
                  : "bg-card"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-background text-primary border border-primary/30">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={cn("font-semibold mb-1", plan.highlighted ? "text-primary-foreground" : "")}>
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={cn("text-sm pb-0.5", plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={cn("text-sm leading-relaxed", plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm">
                    <Check className={cn("h-4 w-4 shrink-0", plan.highlighted ? "text-primary-foreground" : "text-primary")} />
                    <span className={plan.highlighted ? "text-primary-foreground/90" : ""}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "secondary" : "outline"}
                  size="sm"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
