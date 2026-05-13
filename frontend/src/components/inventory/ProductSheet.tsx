import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/types/inventory";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSave?: () => void;
}

export function ProductSheet({ isOpen, onClose, item, onSave }: ProductSheetProps) {
  const isEditing = !!item;
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setSku(item.sku);
      setCategory(item.category);
      setStock(item.stock.toString());
      setMinStock(item.minStock.toString());
      setPrice(item.price.toString());
    } else {
      setName("");
      setSku("");
      setCategory("");
      setStock("");
      setMinStock("");
      setPrice("");
    }
  }, [item, isOpen]);

  const handleSave = async () => {
    // Validate non-negative values before saving
    const qty = Math.max(0, parseInt(stock) || 0);
    const min = Math.max(0, parseInt(minStock) || 0);
    const prc = Math.max(0, parseFloat(price) || 0);

    setIsSaving(true);
    try {
      const payload = {
        name,
        sku,
        category,
        quantity: qty,
        minStock: min,
        price: prc
      };

      console.log("Saving inventory item:", { isEditing, itemId: item?.id, payload });

      if (isEditing && item) {
        // Update existing item
        const res = await fetchWithAuth(`/inventory/${item.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Update response:", data);

        if (!res.ok) {
          throw new Error(data.detail || data.error || "Güncelleme başarısız");
        }
        toast.success("Ürün başarıyla güncellendi");
      } else {
        // Create new item
        const res = await fetchWithAuth("/inventory", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Create response:", data);

        if (!res.ok) {
          throw new Error(data.detail || data.error || "Oluşturma başarısız");
        }
        toast.success("Ürün başarıyla eklendi");
      }

      if (onSave) onSave();
      
      // Trigger notification refresh across the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notification-refresh"));
      }
      
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(`İşlem başarısız: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</SheetTitle>
          <SheetDescription>
            {isEditing 
              ? "Envanterdeki ürünü güncellemek için bilgileri düzenleyin." 
              : "Envantere yeni bir ürün eklemek için aşağıdaki bilgileri doldurun."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 py-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ürün Adı</label>
            <Input placeholder="Örn: Kablosuz Mouse" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU</label>
            <Input placeholder="Örn: MOUSE-001" value={sku} onChange={e => setSku(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Input placeholder="Örn: Elektronik" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{isEditing ? "Mevcut Stok" : "Başlangıç Stoğu"}</label>
              <Input type="number" min="0" placeholder="0" value={stock} onChange={e => { const v = e.target.value; setStock(v === '' ? '' : String(Math.max(0, parseInt(v) || 0))); }} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kritik Stok (min)</label>
              <Input type="number" min="0" placeholder="10" value={minStock} onChange={e => { const v = e.target.value; setMinStock(v === '' ? '' : String(Math.max(0, parseInt(v) || 0))); }} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Birim Fiyat (₺)</label>
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={e => { const v = e.target.value; setPrice(v === '' ? '' : String(Math.max(0, parseFloat(v) || 0))); }} />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>İptal</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : (isEditing ? "Değişiklikleri Kaydet" : "Ürünü Kaydet")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
