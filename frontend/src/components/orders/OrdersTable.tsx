// ============================================================
// OrdersTable — Sipariş listesi tablosu
// ============================================================
// Gelen siparişleri DataTable içinde gösterir.
// Satıra tıklanınca "onSelect" çağrılır → OrderDetail dialog açılır.
// Boş sonuçta EmptyState gösterilir.
// ============================================================

import { Order } from "@/types/order";
import { DataTable, DataTableRow, DataTableCell } from "@/components/shared/DataTable";
import { StatusBadge, getOrderStatusVariant } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchX } from "lucide-react";

// Tablo sütun başlıkları
const COLUMNS = ["Sipariş No", "Müşteri", "Ürün", "Durum", "Tutar", "Adet"];

interface OrdersTableProps {
  orders: Order[];                  // Gösterilecek sipariş listesi (zaten filtreli)
  onSelect: (order: Order) => void; // Satıra tıklanınca çağrılır
}

export function OrdersTable({ orders, onSelect }: OrdersTableProps) {
  // Boş sonuç durumu
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-5 w-5" />}
        title="Sipariş bulunamadı"
        description="Arama veya filtre kriterlerinizi değiştirip tekrar deneyin."
      />
    );
  }

  return (
    <DataTable columns={COLUMNS}>
      {orders.map((order) => (
        <DataTableRow
          key={order.id}
          onClick={() => onSelect(order)}
          // Gecikmiş siparişlerde arka plan hafif kırmızıya döner
          isHighlighted={order.status === "Gecikti"}
        >
          {/* Sipariş No + Tarih */}
          <DataTableCell>
            <p className="font-medium text-xs">{order.id}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatDate(order.date)}
            </p>
          </DataTableCell>

          {/* Müşteri adı */}
          <DataTableCell>{order.customer}</DataTableCell>

          {/* Ürün adı (mobilde gizli) */}
          <DataTableCell mobileHidden className="text-muted-foreground">
            {order.product}
          </DataTableCell>

          {/* Durum rozeti */}
          <DataTableCell>
            <StatusBadge
              variant={getOrderStatusVariant(order.status)}
              label={order.status}
            />
          </DataTableCell>

          {/* Tutar */}
          <DataTableCell className="font-medium">
            ₺{order.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </DataTableCell>

          {/* Adet (mobilde gizli) */}
          <DataTableCell mobileHidden className="text-muted-foreground">
            {order.quantity} adet
          </DataTableCell>
        </DataTableRow>
      ))}
    </DataTable>
  );
}

// ============================================================
// Yardımcı: ISO tarih stringini okunabilir formata çevirir
// Örn: "2026-05-09T09:14:00" → "9 May 2026, 09:14"
// ============================================================
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
