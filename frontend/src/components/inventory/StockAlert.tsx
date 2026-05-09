// ============================================================
// StockAlert — Stok uyarı banner bileşeni
// ============================================================
// Inventory sayfasının üstünde gösterilir.
// Azalan veya tükenen ürün varsa uyarı verir.
// Ürün yoksa (hepsi stokta) hiçbir şey render etmez.
// ============================================================

import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockAlertProps {
  lowCount: number;  // "Azalıyor" durumundaki ürün sayısı
  outCount: number;  // "Tükendi" durumundaki ürün sayısı
}

export function StockAlert({ lowCount, outCount }: StockAlertProps) {
  // Hiç sorun yoksa hiçbir şey gösterme
  if (lowCount === 0 && outCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Azalan stok uyarısı */}
      {lowCount > 0 && (
        <AlertBanner
          icon={<AlertTriangle className="h-4 w-4" />}
          message={`${lowCount} ürün minimum stok seviyesinin altına düştü.`}
          variant="warning"
        />
      )}

      {/* Tükenen stok uyarısı */}
      {outCount > 0 && (
        <AlertBanner
          icon={<XCircle className="h-4 w-4" />}
          message={`${outCount} ürün tamamen tükendi.`}
          variant="danger"
        />
      )}
    </div>
  );
}

// ── Yardımcı: Tek bir banner satırı ─────────────────────────
function AlertBanner({
  icon,
  message,
  variant,
}: {
  icon: React.ReactNode;
  message: string;
  variant: "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1",
        variant === "warning"
          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      )}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}
