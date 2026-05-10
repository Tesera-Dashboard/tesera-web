"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Recommendation {
  type: string;
  message: string;
  action: string;
}

const fallbackRecommendations: Recommendation[] = [
  {
    type: "stock",
    message: "İncir Reçeli stokları tükenmiş görünüyor. Yeni üretim planlaması yapılması önerilir.",
    action: "Sipariş Ver",
  },
  {
    type: "shipment",
    message: "ORD-1004 nolu sipariş 2 gündür gecikmede. Müşteriye bilgi verilmesi gerekebilir.",
    action: "Gecikme Nedenini Gör",
  },
  {
    type: "workflow",
    message: "Bugün kargoya verilmesi gereken 3 yeni siparişiniz hazır bekliyor.",
    action: "Siparişleri Hazırla",
  },
];

function getRouteByType(type: string): string {
  switch (type) {
    case "stock":
      return "/dashboard/inventory";
    case "shipment":
      return "/dashboard/shipments";
    case "order":
    case "workflow":
    default:
      return "/dashboard/orders";
  }
}

export function AIRecommendations() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetchWithAuth("/ai/recommendations");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Öneriler alınamadı");
      }
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e: any) {
      setHasError(true);
      setRecommendations(fallbackRecommendations);
      toast.error(e.message || "YZ önerileri yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-card border rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-semibold text-sm">YZ Önerileri</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={load}
          disabled={isLoading}
          title="Yenile"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((r, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/60 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{r.message}</p>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => router.push(getRouteByType(r.type))}
              >
                {r.action}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {hasError && (
            <p className="text-[11px] text-muted-foreground text-center">
              YZ servisi kullanılamıyor; örnek öneriler gösteriliyor.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
