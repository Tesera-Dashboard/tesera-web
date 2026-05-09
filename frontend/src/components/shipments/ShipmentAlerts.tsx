// ============================================================
// ShipmentAlert — Kargo sayfasının üstündeki genel gecikme uyarısı
// ============================================================

import { AlertTriangle } from "lucide-react";

interface ShipmentAlertProps {
  delayedCount: number; // Gecikmeli kargo sayısı
}

export function ShipmentAlert({ delayedCount }: ShipmentAlertProps) {
  // Gecikme yoksa hiçbir şey gösterme
  if (delayedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{delayedCount} kargo gönderisinde gecikme yaşanıyor. Lütfen detayları kontrol edin.</span>
    </div>
  );
}

// ============================================================
// DelayFlag — Tablo içinde satırlarda gösterilen gecikme detayı
// ============================================================

interface DelayFlagProps {
  reason?: string; // Gecikme nedeni (opsiyonel)
}

export function DelayFlag({ reason }: DelayFlagProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] mt-1 text-red-600 dark:text-red-400 font-medium">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{reason || "Gecikmeli Teslimat"}</span>
    </div>
  );
}
