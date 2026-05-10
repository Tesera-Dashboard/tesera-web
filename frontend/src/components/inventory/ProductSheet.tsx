import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/types/inventory";
import { useEffect, useState } from "react";

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function ProductSheet({ isOpen, onClose, item }: ProductSheetProps) {
  const isEditing = !!item;

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
              <Input type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kritik Stok (min)</label>
              <Input type="number" placeholder="10" value={minStock} onChange={e => setMinStock(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Birim Fiyat (₺)</label>
            <Input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={onClose}>{isEditing ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
