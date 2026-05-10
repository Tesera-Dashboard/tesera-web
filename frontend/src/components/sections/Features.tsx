"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    imageSrc: "/landing/1-AI-Customer-Assistant.png",
    title: "Yapay Zeka Müşteri Asistanı",
    desc: "WhatsApp, e-posta ve canlı destek üzerinden bağlama duyarlı yapay zeka ile yanıt verir. Sipariş durumlarını ve sık sorulan soruları otomatik halleder.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/2-Inventory-Management.png",
    title: "Envanter Yönetimi",
    desc: "Yapay zeka destekli sipariş önerileriyle canlı stok takibi. Müşteriler fark etmeden önce düşük stok uyarıları alın.",
    badge: null,
  },
  {
    imageSrc: "/landing/3-Shipment-Tracking.png",
    title: "Kargo Takibi",
    desc: "Gecikme tespiti ile otomatik kargo takibi. Müşterileri sormadan önce proaktif olarak bilgilendirir.",
    badge: null,
  },
  {
    imageSrc: "/landing/4-workflow-automation.png",
    title: "İş Akışı Otomasyonu",
    desc: "Özel otomasyon kuralları oluşturun. Tetikleyicilere ve koşullara göre ekip üyelerine otomatik görevler atayın.",
    badge: null,
  },
  {
    imageSrc: "/landing/5-Operational-Analytics.png",
    title: "Operasyonel Analitik",
    desc: "Satış trendleri, stok tahminleri ve performans analizleri. Sorunlar büyümeden önce gidişatı görün.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/6-smart-notifications.png",
    title: "Akıllı Bildirimler",
    desc: "Yapay zeka öncelikli uyarılar. Gürültü yok, sadece önemli olanlar — doğru kişiye doğru zamanda iletilir.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/7-Multi-Agent-Architecture.png",
    title: "Çoklu Ajan Mimarisi",
    desc: "Uzmanlaşmış yapay zeka ajanları tüm operasyonunuzu kusursuz bir şekilde yönetmek için birlikte çalışır.",
    badge: "AI",
  },
  {
    imageSrc: "/landing/8-Integrations-Ready.png",
    title: "Entegrasyona Hazır",
    desc: "Dahili Webhook ve REST API. Mevcut araçlarınızı, ERP'nizi veya pazaryerinizi minimum çabayla bağlayın.",
    badge: null,
  },
];

export function Features() {
  return (
    <section className="py-24" id="features">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Operasyonunuzun İhtiyaç Duyduğu Her Şey
          </h2>
          <p className="text-lg text-muted-foreground">
            Tek platform. Sekiz temel yapı taşı. Tamamen otomatik.
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
