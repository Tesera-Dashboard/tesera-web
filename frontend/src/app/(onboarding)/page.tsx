"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Sparkles, ShoppingCart, Package, Truck, BarChart3, Workflow, Bell, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    title: "Tesera'ya Hoş Geldiniz! 🎉",
    description: "İşletmenizi yönetmenin en kolay yolu. 14 günlük ücretsiz denemenin tadını çıkarın.",
    icon: "love.png",
    color: "from-orange-500 to-amber-500"
  },
  {
    title: "Ürünlerinizi Ekleyin",
    description: "Envanter yönetimi ile ürünlerinizi takip edin, stok seviyelerini izleyin ve düşük stok uyarıları alın.",
    icon: "love.png",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Siparişleri Yönetin",
    description: "Gelen siparişleri takip edin, durumlarını güncelleyin ve müşterilerinizi bilgilendirin.",
    icon: "love.png",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Kargoları Takip Edin",
    description: "Kargo süreçlerini yönetin, gecikmeli kargoları tespit edin ve kargo şirketleriyle entegre olun.",
    icon: "love.png",
    color: "from-purple-500 to-violet-500"
  },
  {
    title: "Analitiklerle Karar Verin",
    description: "İşletmenizin performansını analiz edin, trendleri görün ve veriye dayalı kararlar alın.",
    icon: "love.png",
    color: "from-pink-500 to-rose-500"
  },
  {
    title: "İş Akışları Oluşturun",
    description: "Otomatik iş akışları oluşturarak iş süreçlerinizi hızlandırın ve verimliliği artırın.",
    icon: "love.png",
    color: "from-indigo-500 to-blue-500"
  },
  {
    title: "Bildirimlerden Haberdar Olun",
    description: "Önemli olaylardan anında haberdar olun ve hiçbir detayı kaçırmayın.",
    icon: "love.png",
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Ayarlarınızı Özelleştirin",
    description: "Tercihlerinize göre arayüzü özelleştirin, bildirim ayarlarını yönetin ve işletmenizi yapılandırın.",
    icon: "love.png",
    color: "from-teal-500 to-cyan-500"
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tesera'ya Hoş Geldiniz</h1>
          <p className="text-lg text-gray-600">
            İşletmenizi yönetmenin en kolay yolu
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            14 günlük ücretsiz deneme
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Adım {currentStep + 1} / {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <Card className="p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center mb-6 shadow-lg`}>
              <Image 
                src={`/${steps[currentStep].icon}`} 
                alt="Step Icon"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {steps[currentStep].title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              {steps[currentStep].description}
            </p>

            {/* Step Indicators */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-8 bg-gradient-to-r from-orange-500 to-amber-500"
                      : index < currentStep
                      ? "w-2 bg-green-500"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 w-full max-w-md">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1"
              >
                {currentStep === 0 ? "Atla" : "Geri"}
                {currentStep === 0 && <ChevronRight className="ml-2 h-4 w-4" />}
                {currentStep > 0 && <ChevronLeft className="mr-2 h-4 w-4" />}
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {currentStep === steps.length - 1 ? "Panele Git" : "İleri"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <ShoppingCart className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Sipariş Yönetimi</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Package className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Envanter Takibi</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Truck className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Kargo Takibi</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Analitik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
