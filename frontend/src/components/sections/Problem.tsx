"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Layers, Clock } from "lucide-react";

const problems = [
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Kopuk İletişim",
    desc: "Ekibiniz aynı anda WhatsApp, e-posta ve DM'lerle boğuşur — bağlam kaybolur, siparişler kaçar ve müşteriler hüsrana uğrar.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Manuel Envanter Kaosu",
    desc: "Talep arttığı anda e-tablolar (Excel) yetersiz kalır. Stok tükenmeleri ve fazla stoklar her hafta marjlarınızı sessizce eritir.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Kargo Kör Noktaları",
    desc: "Ekibiniz daha sorunu fark etmeden müşteriler gecikmelerden şikayet eder. Manuel kargo takibi kesinlikle ölçeklenemez.",
  },
];

export function Problem() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Tanıdık geldi mi?
          </h2>
          <p className="text-lg text-muted-foreground">
            Çoğu KOBİ aynı operasyonel duvara çarpar. Ayda 100 siparişte çalışan manuel süreçler 1.000 siparişte çöker.
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
