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
import { SearchX, RefreshCw, Edit2, Trash2 } from "lucide-react";

const COLUMNS = ["Ürün Adı", "SKU", "Kategori", "Stok", "Min. Stok", "Birim Fiyat", "Durum", ""];

interface InventoryTableProps {
  items: InventoryItem[];
  onReorder: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onReorder, onEdit, onDelete }: InventoryTableProps) {
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

            {/* Aksiyon Butonları */}
            <DataTableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button 
                  size="icon-sm" 
                  variant="ghost" 
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                  onClick={() => onEdit(item)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon-sm" 
                  variant="ghost" 
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => onReorder(item)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Sipariş Ver
                </Button>
              </div>
            </DataTableCell>

          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
