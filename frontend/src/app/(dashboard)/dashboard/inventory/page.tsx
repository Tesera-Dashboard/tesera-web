"use client";
// ============================================================
// Inventory Page — Envanter yönetim sayfası
// ============================================================
// Bu sayfa 4 temel state yönetir:
//   1. searchQuery    → Ürün adı veya SKU araması
//   2. stockFilter    → Stok durumu filtresi (Tümü / Azalıyor / Tükendi)
//   3. categoryFilter → Kategori filtresi (Tümü / Reçel / Turşu vb.)
//   4. reorderItem    → "Sipariş Ver" tıklanan ürün (dialog için)
// ============================================================

import { useMemo, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { Plus } from "lucide-react";

import { InventoryItem, StockLevel } from "@/types/inventory";

import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { StockAlert } from "@/components/inventory/StockAlert";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ReorderDialog } from "@/components/inventory/ReorderDialog";
import { ProductSheet } from "@/components/inventory/ProductSheet";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/ui/AlertModal";
import { SuccessModal } from "@/components/ui/SuccessModal";

// Stok seviyesi filtreleri
type StockFilter = StockLevel | "Tümü";
const STOCK_FILTERS: StockFilter[] = ["Tümü", "Stokta", "Azalıyor", "Tükendi"];

// Stok filtresi için renk sınıfları
const STOCK_FILTER_COLORS: Record<StockFilter, string> = {
  "Tümü":     "",
  "Stokta":   "data-[active=true]:bg-emerald-600 data-[active=true]:border-emerald-600",
  "Azalıyor": "data-[active=true]:bg-amber-500  data-[active=true]:border-amber-500",
  "Tükendi":  "data-[active=true]:bg-red-600    data-[active=true]:border-red-600",
};

export default function InventoryPage() {
  // ── State tanımları ────────────────────────────────────────
  const [searchQuery, setSearchQuery]       = useState("");
  const [stockFilter, setStockFilter]       = useState<StockFilter>("Tümü");
  const [reorderItem, setReorderItem]       = useState<InventoryItem | null>(null);
  const [editItem, setEditItem]             = useState<InventoryItem | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Alert modal states
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // API'den stokları çek
  const loadInventory = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/inventory");
      const data = await res.json();
      if (Array.isArray(data)) {
        setInventoryItems(data);
      } else {
        setInventoryItems([]);
      }
    } catch (err) {
      console.error("API hatası:", err);
      setInventoryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ── Uyarı sayıları (sadece bir kez hesaplanır) ────────────
  const { lowCount, outCount } = useMemo(() => ({
    lowCount: inventoryItems.filter((i) => i.status === "Azalıyor").length,
    outCount: inventoryItems.filter((i) => i.status === "Tükendi").length,
  }), [inventoryItems]);

  // ── Filtreli envanter listesi ─────────────────────────────
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      // 1. Stok durumu filtresi
      const matchesStock = stockFilter === "Tümü" || item.status === stockFilter;

      // 2. Arama: ürün adı veya SKU'da geçiyor mu?
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q);

      return matchesStock && matchesSearch;
    });
  }, [searchQuery, stockFilter, inventoryItems]);

  const handleSearch = useCallback((value: string) => setSearchQuery(value), []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Sayfa başlığı */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Envanter"
          description={`${filteredItems.length} ürün listeleniyor`}
        />
        <Button onClick={() => { setEditItem(null); setIsProductSheetOpen(true); }} className="h-10">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ürün Ekle
        </Button>
      </div>

      {/* Stok uyarı banner'ları */}
      <StockAlert lowCount={lowCount} outCount={outCount} />

      {/* Arama + Filtreler (Tek satır layout) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Ürün adı veya SKU ara..."
          onSearch={handleSearch}
          className="sm:w-72"
        />

        <div className="flex flex-wrap gap-2 items-center">
          {STOCK_FILTERS.map((filter) => {
            const isActive = stockFilter === filter;
            return (
              <button
                key={filter}
                data-active={isActive}
                onClick={() => setStockFilter(filter)}
                className={cn(
                  "h-9 px-3 rounded-lg text-xs font-medium border transition-all duration-150",
                  "text-muted-foreground hover:text-foreground hover:border-foreground/30",
                  isActive && "text-white border-transparent",
                  isActive && filter === "Tümü"     && "bg-primary border-primary",
                  isActive && filter === "Stokta"   && "bg-emerald-600 border-emerald-600",
                  isActive && filter === "Azalıyor" && "bg-amber-500 border-amber-500",
                  isActive && filter === "Tükendi"  && "bg-red-600 border-red-600",
                )}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Envanter tablosu */}
      <InventoryTable
        items={filteredItems}
        onReorder={setReorderItem}
        onEdit={(item) => { setEditItem(item); setIsProductSheetOpen(true); }}
        onDelete={(item) => {
          setItemToDelete(item);
          setIsAlertOpen(true);
        }}
      />

      {/* Yeniden sipariş dialog */}
      <ReorderDialog
        item={reorderItem}
        onClose={() => setReorderItem(null)}
      />

      {/* Ürün Ekle / Düzenle Sheet */}
      <ProductSheet
        isOpen={isProductSheetOpen}
        onClose={() => setIsProductSheetOpen(false)}
        item={editItem}
        onSave={loadInventory}
      />

      {/* Alert Modal for Delete Confirmation */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            setInventoryItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            setSuccessMessage(`${itemToDelete.name} ürünü başarıyla silindi`);
            setIsSuccessOpen(true);
            setItemToDelete(null);
          }
        }}
        title="Ürünü Sil"
        description={`${itemToDelete?.name || "Bu ürün"}ü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="İptal"
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="İşlem Başarılı"
        description={successMessage}
        confirmText="Tamam"
      />

    </div>
  );
}
