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
    q: "Tesera kimler için tasarlandı?",
    a: "Tesera; KOBİ'ler, kooperatifler, butik e-ticaret işletmeleri ve hem fiziksel hem online satış yapanlar için tasarlandı. Eğer sipariş, stok, kargo veya müşteri iletişimi yönetiyorsanız — Tesera tam size göre.",
  },
  {
    q: "Tesera'yı kurmak için teknik bilgiye ihtiyacım var mı?",
    a: "Hayır. Tesera, adım adım yönlendiren bir kurulum akışına sahiptir. Çoğu işletme 30 dakika içinde tam olarak operasyonel hale gelir.",
  },
  {
    q: "Yapay Zeka Müşteri Asistanı nasıl çalışır?",
    a: "Tesera'nın YZ ajanı bağlı kanallarınızdan gelen mesajları okur, müşterinin niyetini anlar ve sipariş durumu, kargo güncellemeleri veya SSS'ler dahil olmak üzere bağlama duyarlı yanıtlar üretir. Tüm yanıtları inceleyebilir ve özelleştirebilirsiniz.",
  },
  {
    q: "Mevcut araçlarımı bağlayabilir miyim?",
    a: "Evet. Tesera, REST API ve webhook desteği sunar. Kurumsal planlar özel entegrasyon desteği ve bağlayıcılar içerir.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Kesinlikle. Tüm veriler hem bekleme hem aktarım anında şifrelenir. Kurumsal planlarda SSO, gelişmiş izinler ve özel SLA'lar bulunur.",
  },
  {
    q: "Ödeme yapmadan önce Tesera'yı deneyebilir miyim?",
    a: "Evet — Tam erişimli 14 günlük ücretsiz deneme sürümümüz mevcut. Kredi kartı gerekmez.",
  },
];

export function FAQ() {
  return (
    <section className="py-24">
      <div className="section-container max-w-3xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-lg text-muted-foreground">
            Başlamadan önce bilmeniz gereken her şey.
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
