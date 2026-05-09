"use client";
// ============================================================
// ReorderDialog — Yeniden stok sipariş dialog bileşeni
// ============================================================
// "Sipariş Ver" butonuna tıklanınca açılır.
// Mevcut stok, minimum stok ve önerilen sipariş miktarını gösterir.
// Kullanıcı miktarı değiştirip onaylayabilir.
// Onaylanınca Sonner toast gösterilir (şimdilik mock — ileride API).
// ============================================================

import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InventoryItem } from "@/types/inventory";
import { Package, AlertTriangle } from "lucide-react";

interface ReorderDialogProps {
  item: InventoryItem | null; // null = dialog kapalı
  onClose: () => void;
}

export function ReorderDialog({ item, onClose }: ReorderDialogProps) {
  // Önerilen sipariş miktarı: minimum stokun 3 katı eksi mevcut stok
  // Örn: min=10, stok=2 → öneri = (10*3) - 2 = 28
  const suggested = item ? Math.max(item.minStock * 3 - item.stock, item.minStock) : 0;

  const [quantity, setQuantity] = useState(suggested);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog her açıldığında miktarı yeniden hesapla
  useEffect(() => {
    if (item) setQuantity(Math.max(item.minStock * 3 - item.stock, item.minStock));
  }, [item]);

  function handleConfirm() {
    if (!item || quantity < 1) return;

    setIsLoading(true);

    // Gerçek API'ye bağlanana kadar 800ms gecikme simüle ediyoruz
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      toast.success("Sipariş oluşturuldu!", {
        description: `${item.name} için ${quantity} adet sipariş verildi.`,
      });
    }, 800);
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base">Yeniden Sipariş Ver</DialogTitle>
          </div>
        </DialogHeader>

        {item && (
          <div className="space-y-4 mt-1">
            {/* Ürün adı */}
            <p className="text-sm font-medium">{item.name}</p>

            <Separator />

            {/* Stok bilgileri */}
            <div className="grid grid-cols-2 gap-3">
              <InfoBox
                label="Mevcut Stok"
                value={`${item.stock} adet`}
                highlight={item.stock === 0 ? "danger" : item.stock <= item.minStock ? "warning" : "none"}
              />
              <InfoBox
                label="Minimum Stok"
                value={`${item.minStock} adet`}
              />
            </div>

            {/* Uyarı mesajı */}
            {item.stock <= item.minStock && (
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {item.stock === 0
                    ? "Bu ürün tamamen tükendi. Acil sipariş önerilir."
                    : "Stok seviyesi minimumun altında. Sipariş verilmesi önerilir."}
                </span>
              </div>
            )}

            <Separator />

            {/* Miktar girişi */}
            <div className="space-y-1.5">
              <Label htmlFor="reorder-qty" className="text-xs">
                Sipariş Miktarı (adet)
              </Label>
              <Input
                id="reorder-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Önerilen miktar: <span className="font-medium">{suggested} adet</span>
              </p>
            </div>

            {/* Tahmini maliyet */}
            <div className="flex justify-between items-center text-sm bg-muted/40 rounded-lg px-3 py-2">
              <span className="text-muted-foreground text-xs">Tahmini Tutar</span>
              <span className="font-semibold">
                ₺{(quantity * item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            İptal
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading || quantity < 1}
          >
            {isLoading ? "Gönderiliyor..." : "Siparişi Onayla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Yardımcı: Küçük bilgi kutusu ──────────────────────────────
function InfoBox({
  label,
  value,
  highlight = "none",
}: {
  label: string;
  value: string;
  highlight?: "warning" | "danger" | "none";
}) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={
          highlight === "danger"
            ? "text-sm font-bold text-red-600 dark:text-red-400"
            : highlight === "warning"
            ? "text-sm font-bold text-amber-600 dark:text-amber-400"
            : "text-sm font-semibold text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
