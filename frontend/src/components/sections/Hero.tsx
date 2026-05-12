"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-gradient pt-24 pb-20 md:pt-36 md:pb-32">
      <div className="section-container text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="mb-8 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <Image 
                src="/mini-logo.png" 
                alt="Tesera Logo" 
                width={200} 
                height={200} 
                className="w-24 md:w-32 h-auto object-contain drop-shadow-2xl" 
                priority 
              />
            </motion.div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Modern KOBİ'ler için yapay zeka destekli operasyonlar
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
            İşinizi daha zor değil,
            <br />
            <span className="gradient-text">daha akıllıca yönetin</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Tesera müşteri iletişimini, stok takibini, kargoları ve iş akışlarını otomatikleştirir — böylece ekibiniz hamallığa değil büyümeye odaklanabilir.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg">
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Nasıl çalıştığını gör
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Kredi kartı gerekmez · 14 gün ücretsiz · İstediğiniz zaman iptal edin
          </p>
        </motion.div>
      </div>

      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
    </section>
  );
}
