"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useInView } from "framer-motion";
import { useRef } from "react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background" id="features">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
          >
            KOBiniz İhtiyaç Duyduğu Her Şey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Tek platform. Sekiz temel yapı taşı. Tamamen otomatik.
          </motion.p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group flex flex-col items-center text-center p-6 rounded-2xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 bg-white border border-border/40 shadow-sm">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image src={f.imageSrc} alt={f.title} fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 300px" />
                </motion.div>
                {f.badge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
                    className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-background/95 backdrop-blur-sm border shadow-sm text-foreground"
                  >
                    {f.badge}
                  </motion.span>
                )}
              </div>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
                className="font-semibold mb-2 text-lg relative z-10"
              >
                {f.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.3 }}
                className="text-sm text-muted-foreground leading-relaxed relative z-10"
              >
                {f.desc}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
