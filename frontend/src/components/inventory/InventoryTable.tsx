// ============================================================
// InventoryTable — Envanter stok tablosu
// ============================================================
// DataTable shared bileşeni üzerine kurulu, envantere özgü
// içerik ve "Yeniden Sipariş Ver" butonu içerir.
// Azalan/tükenen satırlar vurgulanır.
// ============================================================

import { InventoryItem } from "@/types/inventory";
import { DataTable, DataTableRow, DataTableCell } from "@/components/shared/DataTable";
import { StatusBadge, getStockVariant } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { SearchX, RefreshCw } from "lucide-react";

const COLUMNS = ["Ürün Adı", "SKU", "Kategori", "Stok", "Min. Stok", "Birim Fiyat", "Durum", ""];

interface InventoryTableProps {
  items: InventoryItem[];                     // Gösterilecek envanter listesi
  onReorder: (item: InventoryItem) => void;   // "Yeniden Sipariş Ver" tıklanınca
}

export function InventoryTable({ items, onReorder }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-5 w-5" />}
        title="Ürün bulunamadı"
        description="Arama veya filtre kriterlerinizi değiştirip tekrar deneyin."
      />
    );
  }

  return (
    <DataTable columns={COLUMNS}>
      {items.map((item) => {
        // "Azalıyor" veya "Tükendi" olan satırları vurgula
        const isHighlighted = item.status !== "Stokta";

        return (
          <DataTableRow key={item.id} isHighlighted={isHighlighted}>

            {/* Ürün adı */}
            <DataTableCell className="font-medium text-foreground">
              {item.name}
            </DataTableCell>

            {/* SKU kodu (mobilde gizli) */}
            <DataTableCell mobileHidden className="font-mono text-muted-foreground">
              {item.sku}
            </DataTableCell>

            {/* Kategori (mobilde gizli) */}
            <DataTableCell mobileHidden className="text-muted-foreground">
              {item.category}
            </DataTableCell>

            {/* Stok adedi — azsa kırmızı, normalde yeşil */}
            <DataTableCell>
              <span
                className={
                  item.stock === 0
                    ? "font-bold text-red-600 dark:text-red-400"
                    : item.stock <= item.minStock
                    ? "font-bold text-amber-600 dark:text-amber-400"
                    : "font-medium text-foreground"
                }
              >
                {item.stock}
              </span>
            </DataTableCell>

            {/* Minimum stok seviyesi (mobilde gizli) */}
            <DataTableCell mobileHidden className="text-muted-foreground">
              {item.minStock}
            </DataTableCell>

            {/* Birim fiyat (mobilde gizli) */}
            <DataTableCell mobileHidden className="font-medium">
              ₺{item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </DataTableCell>

            {/* Durum rozeti */}
            <DataTableCell>
              <StatusBadge
                variant={getStockVariant(item.status)}
                label={item.status}
              />
            </DataTableCell>

            {/* Yeniden sipariş butonu */}
            <DataTableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={() => onReorder(item)}
              >
                <RefreshCw className="h-3 w-3" />
                Sipariş Ver
              </Button>
            </DataTableCell>

          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
