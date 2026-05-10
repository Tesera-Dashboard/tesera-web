"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { InventoryItem } from "@/types/inventory";
import { Shipment } from "@/types/shipment";
import { DatabaseBackup, PackagePlus, ShoppingCart, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function UnifiedTestSimulator() {
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const loadData = () => {
    fetchWithAuth("/inventory").then(res => res.json()).then(setInventory);
    fetchWithAuth("/shipments").then(res => res.json()).then(setShipments);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Veritabanını Doldur
  const handleSeed = async () => {
    setLoadingSeed(true);
    try {
      const res = await fetchWithAuth("/test/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Hata oluştu");
      toast.success(data.message);
      loadData();
    } catch (err: any) {
      toast.error(`Seed failed: ${err.message}`);
    }
    setLoadingSeed(false);
  };

  // 2. Rastgele Ürün Oluştur
  const handleCreateRandomItem = async () => {
    setLoadingItem(true);
    try {
      const res = await fetchWithAuth("/test/inventory/create", { method: "POST" });
      const data = await res.json();
      toast.success(`${data.message}: ${data.item}`);
      loadData();
    } catch (err) {
      toast.error("Ürün oluşturulamadı");
    }
    setLoadingItem(false);
  };

  // 3. Sipariş Oluştur
  const handleCreateOrder = async (item: InventoryItem) => {
    try {
      const res = await fetchWithAuth("/test/orders/create", {
        method: "POST",
        body: JSON.stringify({ product: item.name, quantity: 1 })
      });
      const data = await res.json();
      toast.success(`Sipariş oluşturuldu: ${data.order_id}`);
    } catch (err) {
      toast.error("Sipariş oluşturulamadı");
    }
  };

  // 4. Kargo Güncelle
  const handleUpdateShipment = async (shipmentId: string, status: string, isDelayed: boolean) => {
    try {
      const res = await fetchWithAuth("/test/shipments/update", {
        method: "POST",
        body: JSON.stringify({ 
          shipment_id: shipmentId, 
          status, 
          is_delayed: isDelayed,
          delay_reason: isDelayed ? "Kötü hava koşulları" : ""
        })
      });
      const data = await res.json();
      toast.success(data.message);
      loadData();
    } catch (err) {
      toast.error("Güncelleme başarısız");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader 
        title="Simülatör Paneli" 
        description="Tek sayfadan tüm platform modüllerine mock veri ekleyin ve süreçleri test edin." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modül 1: Toplu Veri */}
        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <DatabaseBackup className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">1. Toplu Veri (Seed)</h3>
          </div>
          <p className="text-sm text-muted-foreground h-10">
            Sisteme rastgele id'lerle 4 ürün, 3 sipariş ve 2 kargo yükler. İstediğiniz kadar basabilirsiniz.
          </p>
          <Button onClick={handleSeed} disabled={loadingSeed} className="w-full">
            {loadingSeed ? "Yükleniyor..." : "Veritabanını Doldur"}
          </Button>
        </div>

        {/* Modül 2: Rastgele Ürün */}
        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <PackagePlus className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">2. Rastgele Ürün Ekle</h3>
          </div>
          <p className="text-sm text-muted-foreground h-10">
            Envanterinize anında yeni bir ürün ekler. Liste güncellenir.
          </p>
          <Button onClick={handleCreateRandomItem} disabled={loadingItem} variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
            {loadingItem ? "Oluşturuluyor..." : "Rastgele Ürün Oluştur"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modül 3: Sipariş Yarat */}
        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">3. Sipariş Simülatörü</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Mevcut envanterdeki ürünlerden sipariş verin.</p>
          
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            {inventory.length === 0 && <p className="text-sm italic text-muted-foreground">Envanter boş.</p>}
            {inventory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-200 transition-colors">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Stok: {item.stock}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleCreateOrder(item)}>
                  Sipariş Et
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Modül 4: Kargo Operasyonları */}
        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">4. Kargo Operasyonları</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Kargo durumlarını güncelleyin ve taşıyıcı gibi davranın.</p>
          
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            {shipments.length === 0 && <p className="text-sm italic text-muted-foreground">Aktif kargo yok.</p>}
            {shipments.map(s => (
              <div key={s.id} className="flex flex-col gap-3 p-4 border rounded-lg hover:border-purple-200 transition-colors">
                <div>
                  <p className="font-medium text-sm">{s.id} - {s.carrier}</p>
                  <p className="text-xs text-muted-foreground mt-1">Durum: <span className="font-semibold">{s.status}</span> {s.isDelayed ? "(Gecikmeli)" : ""}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleUpdateShipment(s.id, "Yolda", false)}>Yolda</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleUpdateShipment(s.id, s.status, true)}>Gecikme</Button>
                  <Button size="sm" variant="default" className="flex-1 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => handleUpdateShipment(s.id, "Teslim Edildi", false)}>Teslim Et</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
