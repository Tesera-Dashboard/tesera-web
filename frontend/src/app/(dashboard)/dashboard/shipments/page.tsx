"use client";
// ============================================================
// Shipments Page — Kargo takip sayfası
// ============================================================

import { useMemo, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

import { Shipment, ShipmentStatus } from "@/types/shipment";

import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { ShipmentAlert } from "@/components/shipments/ShipmentAlerts";
import { ShipmentsTable } from "@/components/shipments/ShipmentsTable";

// Filtre tanımları (Normal durumlar + Özel "Gecikmeli" filtresi)
type ShipmentFilter = ShipmentStatus | "Tümü" | "Gecikmeli";
const FILTERS: ShipmentFilter[] = ["Tümü", "Yolda", "Beklemede", "Teslim Edildi", "Gecikmeli"];

export default function ShipmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ShipmentFilter>("Tümü");

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API'den kargoları çek
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/shipments")
      .then((res) => res.json())
      .then((data) => {
        setShipments(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("API hatası:", err);
        setIsLoading(false);
      });
  }, []);

  // Sayfanın en üstünde gösterilecek toplam gecikmeli kargo sayısı
  const delayedCount = useMemo(() => {
    return shipments.filter((s) => s.isDelayed).length;
  }, [shipments]);

  // Filtreleme ve Arama Mantığı
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // 1. Filtre: Durum kontrolü veya Gecikme kontrolü
      let matchesFilter = false;
      if (activeFilter === "Tümü") matchesFilter = true;
      else if (activeFilter === "Gecikmeli") matchesFilter = s.isDelayed;
      else matchesFilter = s.status === activeFilter;

      // 2. Arama: Kargo no, sipariş, firma veya takip kodu
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        q === "" || 
        s.id.toLowerCase().includes(q) || 
        s.orderId.toLowerCase().includes(q) || 
        s.trackingCode.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, activeFilter]);

  const handleSearch = useCallback((value: string) => setSearchQuery(value), []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Başlık */}
      <PageHeader 
        title="Kargo Takibi" 
        description={`${filteredShipments.length} kargo listeleniyor`} 
      />

      {/* Gecikme Bildirimi (Sadece gecikme varsa görünür) */}
      <ShipmentAlert delayedCount={delayedCount} />

      {/* Arama ve Filtreler */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Kargo no, sipariş, firma veya takip kodu ara..."
          onSearch={handleSearch}
          className="sm:w-[350px]"
        />

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-medium border transition-all duration-150",
                  "text-muted-foreground hover:text-foreground hover:border-foreground/30",
                  isActive && "bg-primary text-primary-foreground border-primary hover:text-primary-foreground",
                  // "Gecikmeli" filtresi seçiliyse kırmızı yapalım ki dikkat çeksin
                  isActive && filter === "Gecikmeli" && "bg-red-600 text-white border-red-600 hover:text-white"
                )}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tablo */}
      <ShipmentsTable shipments={filteredShipments} />
      
    </div>
  );
}
