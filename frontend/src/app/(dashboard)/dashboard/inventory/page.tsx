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
import { toast } from "sonner";
import { Plus, Download, Upload, FileSpreadsheet, X, UploadCloud } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

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

  // Import/Export states
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"overwrite" | "reset">("overwrite");
  const [isResetWarningOpen, setIsResetWarningOpen] = useState(false);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else {
      toast.error("Lütfen CSV dosyası seçin");
    }
  };

  // Handle CSV import
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    if (importMode === "reset") {
      setIsResetWarningOpen(true);
      return;
    }

    await performImport();
  };

  const performImport = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mode", importMode);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      const res = await fetch(`${API_URL}/inventory/import`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("İçe aktarma başarılı");
        setIsImportSheetOpen(false);
        setSelectedFile(null);
        setIsResetWarningOpen(false);
        loadInventory();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Import error:", errorData);
        toast.error(`İçe aktarma başarısız: ${errorData.detail || errorData.message || "Bilinmeyen hata"}`);
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("İçe aktarma sırasında hata oluştu");
    } finally {
      setImporting(false);
    }
  };

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

  const handleExport = useCallback(() => {
    const csv = [
      ["SKU", "Ürün Adı", "Kategori", "Stok", "Minimum Stok", "Fiyat", "Durum", "Son Stok Tarihi"],
      ...inventoryItems.map(item => [
        item.sku,
        item.name,
        item.category,
        item.stock,
        item.minStock,
        item.price,
        item.status,
        item.lastRestocked
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `envanter-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, [inventoryItems]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Sayfa başlığı */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Envanter"
          description={`${filteredItems.length} ürün listeleniyor`}
        />
        <div className="flex gap-2">
          <Button onClick={() => setIsImportSheetOpen(true)} variant="outline" className="h-10">
            <Upload className="mr-2 h-4 w-4" />
            İçe Aktar
          </Button>
          <Button onClick={() => handleExport()} variant="outline" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button onClick={() => { setEditItem(null); setIsProductSheetOpen(true); }} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün Ekle
          </Button>
        </div>
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
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Table header skeleton */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Table rows skeleton */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <InventoryTable
          items={filteredItems}
          onReorder={setReorderItem}
          onEdit={(item) => { setEditItem(item); setIsProductSheetOpen(true); }}
          onDelete={(item) => {
            setItemToDelete(item);
            setIsAlertOpen(true);
          }}
        />
      )}

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

      {/* Reset Warning Modal */}
      <AlertModal
        isOpen={isResetWarningOpen}
        onClose={() => setIsResetWarningOpen(false)}
        onConfirm={performImport}
        title="Envanteri Resetle ve Aktar"
        description="Tüm mevcut envanter ürünleri silinecek ve yeni envanter CSV dosyasından oluşturulacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
        confirmText="Evet, Resetle ve Aktar"
        cancelText="İptal"
        variant="danger"
      />

      {/* Import Sheet */}
      <Sheet open={isImportSheetOpen} onOpenChange={setIsImportSheetOpen}>
        <SheetContent className="sm:max-w-lg p-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Envanter İçe Aktar
            </SheetTitle>
            <SheetDescription>
              CSV formatındaki envanter dosyanızı yükleyin
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6 pb-6">
            {/* Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV Dosya Formatı
              </h4>
              <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">Sütunlar (sırasıyla):</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>SKU - Ürün benzersiz kodu</li>
                  <li>Ürün Adı - Ürünün adı</li>
                  <li>Kategori - Ürün kategorisi (Örn: Reçel, Turşu, Bal)</li>
                  <li>Stok - Mevcut stok miktarı</li>
                  <li>Minimum Stok - Minimum stok seviyesi</li>
                  <li>Fiyat - Birim fiyatı (TL)</li>
                  <li>Durum - Stok durumu (Stokta, Azalıyor, Tükendi)</li>
                  <li>Son Stok Tarihi - YYYY-MM-DD formatında</li>
                </ul>
              </div>
            </div>

            {/* Example */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Örnek CSV:</h4>
              <div className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">
                <pre>{`SKU,Ürün Adı,Kategori,Stok,Minimum Stok,Fiyat,Durum,Son Stok Tarihi
REC-001,Ayva Reçeli,Reçel,50,10,45.00,Stokta,2024-01-15
TUR-002,Kırmızı Biber Turşusu,Turşu,30,15,35.00,Azalıyor,2024-02-20
BAL-003,Çam Balı,Bal,20,10,120.00,Tükendi,2024-03-10`}</pre>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Dosya Yükle</h4>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <div
                onClick={() => document.getElementById("file-upload")?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                <UploadCloud className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  CSV dosyasını sürükleyip bırakın veya seçin
                </p>
                <Button variant="outline" size="sm">
                  Dosya Seç
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Import Mode Selection */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">İçe Aktarma Modu</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === "overwrite"}
                    onChange={(e) => setImportMode(e.target.value as "overwrite" | "reset")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Üstüne Yaz</p>
                    <p className="text-xs text-muted-foreground">Mevcut ürünleri günceller, aynı SKU'lu ürünleri atlar</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    value="reset"
                    checked={importMode === "reset"}
                    onChange={(e) => setImportMode(e.target.value as "overwrite" | "reset")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Envanteri Resetle ve Aktar</p>
                    <p className="text-xs text-muted-foreground">Tüm mevcut ürünleri siler ve yeni envanter oluşturur</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="w-full"
            >
              {importing ? "İçe Aktarılıyor..." : "İçe Aktar"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
