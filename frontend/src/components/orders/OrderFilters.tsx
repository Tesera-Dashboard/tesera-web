"use client";
// ============================================================
// OrderFilters — Sipariş durum filtresi
// ============================================================
// "Tümü", "İşleniyor", "Kargoda" gibi durum butonları.
// Aktif olan buton vurgulanır. Tıklanınca üst bileşene bildirir.
// ============================================================

import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/order";

// "Tümü" seçeneği dahil tüm filtre değerleri
export type OrderFilter = OrderStatus | "Tümü";

// Filtre çubuğunda gösterilecek seçenekler
const FILTERS: OrderFilter[] = [
  "Tümü",
  "İşleniyor",
  "Kargoda",
  "Teslim Edildi",
  "Gecikti",
  "İptal",
];

interface OrderFiltersProps {
  active: OrderFilter;                   // Şu an seçili filtre
  onChange: (filter: OrderFilter) => void; // Filtre değişince çağrılır
  counts: Partial<Record<OrderFilter, number>>; // Her durumdaki sipariş sayısı
}

export function OrderFilters({ active, onChange, counts }: OrderFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const isActive = active === filter;
        const count = counts[filter];

        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={cn(
              // Temel stil
              "h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150",
              "flex items-center gap-1.5",
              // Aktif değilken
              "border text-muted-foreground hover:text-foreground hover:border-foreground/30",
              // Aktifken
              isActive && "bg-primary text-primary-foreground border-primary hover:text-primary-foreground"
            )}
          >
            {filter}
            {/* Sipariş sayısı rozeti */}
            {count !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px]",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
