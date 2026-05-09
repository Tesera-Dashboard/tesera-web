// ============================================================
// ShipmentsTable — Kargo tablosu bileşeni
// ============================================================

import { Shipment } from "@/types/shipment";
import { DataTable, DataTableRow, DataTableCell } from "@/components/shared/DataTable";
import { StatusBadge, getShipmentVariant } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchX, ArrowRight } from "lucide-react";
import { DelayFlag } from "@/components/shipments/ShipmentAlerts";

const COLUMNS = ["Kargo No", "Bağlı Sipariş", "Kargo Firması", "Takip Kodu", "Güzergah", "Tahmini Teslimat", "Durum"];

interface ShipmentsTableProps {
  shipments: Shipment[];
}

export function ShipmentsTable({ shipments }: ShipmentsTableProps) {
  if (shipments.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-5 w-5" />}
        title="Kargo bulunamadı"
        description="Arama kriterlerinizi değiştirip tekrar deneyin."
      />
    );
  }

  return (
    <DataTable columns={COLUMNS}>
      {shipments.map((shipment) => (
        // isDelayed true ise arka plan hafif kırmızı olur (Shared DataTable özelliği)
        <DataTableRow key={shipment.id} isHighlighted={shipment.isDelayed}>
          
          {/* Kargo No */}
          <DataTableCell className="font-medium text-foreground">
            {shipment.id}
          </DataTableCell>

          {/* Bağlı Sipariş No */}
          <DataTableCell className="text-muted-foreground font-mono text-[11px]">
            {shipment.orderId}
          </DataTableCell>

          {/* Kargo Firması */}
          <DataTableCell>{shipment.carrier}</DataTableCell>

          {/* Takip Kodu */}
          <DataTableCell mobileHidden className="font-mono text-muted-foreground">
            {shipment.trackingCode}
          </DataTableCell>

          {/* Güzergah (Örn: İstanbul -> Ankara) */}
          <DataTableCell mobileHidden>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>{shipment.origin}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{shipment.destination}</span>
            </div>
          </DataTableCell>

          {/* Tahmini Teslimat & Gecikme Uyarı Bayrağı */}
          <DataTableCell>
            <p className="font-medium">{formatDate(shipment.estimatedDelivery)}</p>
            {shipment.isDelayed && <DelayFlag reason={shipment.delayReason} />}
          </DataTableCell>

          {/* Durum Rozeti */}
          <DataTableCell>
            <StatusBadge
              variant={getShipmentVariant(shipment.status)}
              label={shipment.status}
            />
          </DataTableCell>

        </DataTableRow>
      ))}
    </DataTable>
  );
}

// ============================================================
// Yardımcı: Tarih formatlayıcı (Örn: 12 Mayıs)
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}
