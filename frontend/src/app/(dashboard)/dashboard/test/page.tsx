"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { InventoryItem } from "@/types/inventory";
import { Shipment } from "@/types/shipment";
import { DatabaseBackup, PackagePlus, ShoppingCart, Truck, Bot, Send, Loader2, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface AIMessage { role: "user" | "model"; content: string; }

export default function UnifiedTestSimulator() {
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [loadingShipment, setLoadingShipment] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

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
      toast.error(`Seed başarısız: ${err.message}`);
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

  // 5. Rastgele Kargo Oluştur
  const handleCreateRandomShipment = async () => {
    setLoadingShipment(true);
    try {
      const res = await fetchWithAuth("/test/shipments/create", { method: "POST" });
      const data = await res.json();
      toast.success(`${data.message}: ${data.shipment_id} (${data.carrier})`);
      loadData();
    } catch (err) {
      toast.error("Kargo oluşturulamadı");
    }
    setLoadingShipment(false);
  };

  // 6. Tüm Verileri Temizle
  const handleClearAll = async () => {
    if (!confirm("Tüm test verileri (envanter, sipariş, kargo ve yapay zeka konuşma geçmişi) silinecek. Emin misiniz?")) return;
    setClearing(true);
    try {
      const res = await fetchWithAuth("/test/clear", { method: "POST" });
      const data = await res.json();
      toast.success(data.message);
      setInventory([]);
      setShipments([]);
      setAiMessages([]);
      loadData();
    } catch (err) {
      toast.error("Veriler temizlenemedi");
    }
    setClearing(false);
  };

  // 7. AI Sohbet Testi
  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg: AIMessage = { role: "user", content: aiInput.trim() };
    const newMsgs = [...aiMessages, userMsg];
    setAiMessages(newMsgs);
    setAiInput("");
    setAiLoading(true);
    try {
      const res = await fetchWithAuth("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMsgs }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Hata");
      }
      const data = await res.json();
      setAiMessages([...newMsgs, { role: "model", content: data.message }]);
    } catch (err: any) {
      toast.error(`YZ Hatası: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title="Simülatör Paneli"
        description="Tek sayfadan tüm platform modüllerine mock veri ekleyin ve süreçleri test edin."
      />

      {/* Sistem Temizliği */}
      <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Veritabanını Temizle</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Envanter, sipariş, kargo ve yapay zeka konuşma geçmişini siler. Geri alınamaz.
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
          disabled={clearing}
          className="shrink-0"
        >
          {clearing ? "Temizleniyor..." : "Tümünü Sil"}
        </Button>
      </div>

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">4. Kargo Operasyonları</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateRandomShipment}
              disabled={loadingShipment}
              className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              {loadingShipment ? "Oluşturuluyor..." : "+ Rastgele Kargo"}
            </Button>
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

      <Separator />

      {/* Modül 5: YZ Asistanı Testi */}
      <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-pink-500/10 text-pink-600 rounded-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">5. YZ Asistanı Testi</h3>
            <p className="text-xs text-muted-foreground">Grok/OpenRouter API bağlantısını doğrudan bu ekrandan test edin.</p>
          </div>
        </div>
        <div className="border rounded-lg bg-muted/20 p-3 h-48 overflow-y-auto flex flex-col gap-2">
          {aiMessages.length === 0 && (
            <p className="text-xs text-muted-foreground italic m-auto">Henüz mesaj yok. Bir şey sorun!</p>
          )}
          {aiMessages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "text-xs rounded-lg px-3 py-2 max-w-[85%]",
                m.role === "user"
                  ? "bg-primary text-primary-foreground self-end whitespace-pre-wrap"
                  : "bg-card border self-start prose prose-xs max-w-none dark:prose-invert prose-p:mb-1 prose-p:mt-0 prose-ul:mb-1 prose-ul:mt-0 prose-ol:mb-1 prose-ol:mt-0 prose-headings:mb-1 prose-headings:mt-2 prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:bg-muted prose-code:text-muted-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[10px] prose-code:before:content-none prose-code:after:content-none"
              )}
            >
              {m.role === "model" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          ))}
          {aiLoading && (
            <div className="text-xs bg-card border rounded-lg px-3 py-2 self-start">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSend(); } }}
            placeholder="YZ'ye bir şey sorun..."
            className="resize-none text-sm min-h-[40px] max-h-24"
            rows={1}
            disabled={aiLoading}
          />
          <Button size="icon" onClick={handleAiSend} disabled={aiLoading || !aiInput.trim()} className="shrink-0 h-10 w-10">
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
