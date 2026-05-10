"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Ücretsiz Deneme",
    price: "Ücretsiz",
    period: "14 gün",
    desc: "Tesera'yı ekibinizle keşfetmeniz için tam platform erişimi.",
    features: [
      "Tüm temel özellikler",
      "3 kullanıcıya kadar",
      "1.000 YZ mesajı",
      "Topluluk desteği",
    ],
    cta: "Ücretsiz Başla",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Başlangıç",
    price: "$49",
    period: "/aylık",
    desc: "Butik e-ticaret ve küçük ekipler için mükemmel.",
    features: [
      "Ücretsiz plandaki her şey",
      "10 kullanıcıya kadar",
      "10.000 YZ mesajı",
      "E-posta ve canlı destek",
      "3 entegrasyon",
    ],
    cta: "Hemen Başla",
    href: "/register?plan=starter",
    highlighted: false,
  },
  {
    name: "Büyüme",
    price: "$149",
    period: "/aylık",
    desc: "Karmaşık otomasyon ihtiyaçları olan ölçeklenen operasyonlar için.",
    features: [
      "Başlangıç planındaki her şey",
      "Sınırsız kullanıcı",
      "100.000 YZ mesajı",
      "Öncelikli destek",
      "Sınırsız entegrasyon",
      "Özel otomasyon kuralları",
      "Gelişmiş analitik",
    ],
    cta: "Hemen Başla",
    href: "/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Kurumsal",
    price: "Özel",
    period: "",
    desc: "Gelişmiş YZ ajanları, SLA'lar ve büyük ölçekli özel entegrasyonlar.",
    features: [
      "Büyüme planındaki her şey",
      "Özel atanmış YZ ajanları",
      "Size özel kurulum",
      "SSO ve gelişmiş güvenlik",
      "Özel SLA garantisi",
      "API öncelikli erişim",
    ],
    cta: "Satışla İletişime Geç",
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
            Basit, şeffaf fiyatlandırma
          </h2>
          <p className="text-lg text-muted-foreground">
            Ücretsiz başlayın. Büyüdükçe ölçekleyin.
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
                    En popüler
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
