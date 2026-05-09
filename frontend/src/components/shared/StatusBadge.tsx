// ============================================================
// StatusBadge — Durum etiketi bileşeni
// ============================================================
// Sipariş, envanter ve kargo durumlarını renkli etiketle gösterir.
// Mevcut projede RecentOrders.tsx'teki renk sistemini genelleştirdik.
// "variant" ile renk, "label" ile görüntülenen metin belirlenir.
//
// Kullanım örnekleri:
//   <StatusBadge variant="success" label="Teslim Edildi" />
//   <StatusBadge variant="warning" label="Azalıyor" />
//   <StatusBadge variant="danger" label="Gecikti" />
// ============================================================

import { cn } from "@/lib/utils";

// Desteklenen renk varyantları
export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  variant: BadgeVariant; // Renk teması
  label: string;         // Görüntülenecek metin
  className?: string;    // Opsiyonel ek CSS
}

// Her varyant için arka plan + yazı rengi (dark/light mode destekli)
const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400",
  danger:  "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400",
  info:    "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
  neutral: "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400",
};

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

// ============================================================
// Yardımcı fonksiyonlar: Durum değerini → varyanta çevir
// Bu sayede her sayfada tekrar tekrar if/switch yazmayız.
// ============================================================

/** Sipariş durumunu varyanta dönüştürür */
export function getOrderStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    "İşleniyor":       "info",
    "Kargoda":         "warning",
    "Teslim Edildi":   "success",
    "Gecikti":         "danger",
    "İptal":           "neutral",
  };
  return map[status] ?? "neutral";
}

/** Stok durumunu varyanta dönüştürür */
export function getStockVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    "Stokta":   "success",
    "Azalıyor": "warning",
    "Tükendi":  "danger",
  };
  return map[status] ?? "neutral";
}

/** Kargo durumunu varyanta dönüştürür */
export function getShipmentVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    "Yolda":          "info",
    "Teslim Edildi":  "success",
    "Gecikti":        "danger",
    "İade":           "warning",
    "Beklemede":      "neutral",
  };
  return map[status] ?? "neutral";
}
