"use client";
// ============================================================
// Orders Page — Sipariş listesi sayfası
// ============================================================
// Bu sayfa 3 temel state yönetir:
//   1. searchQuery  → Kullanıcının arama kutusuna yazdığı metin
//   2. activeFilter → Seçili durum filtresi ("Tümü", "Kargoda" vb.)
//   3. selectedOrder → Detay dialog'u açılacak sipariş (null = kapalı)
//
// Filtreleme saf fonksiyonla yapılır (useMemo), yani her render'da
// tüm liste yeniden hesaplanmaz — sadece bağımlılıklar değişince.
// ============================================================

import { useMemo, useState, useCallback, useEffect } from "react";
import { Package } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

import { Order, OrderStatus } from "@/types/order";

import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { OrderFilters, OrderFilter } from "@/components/orders/OrderFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderDetail } from "@/components/orders/OrderDetail";

export default function OrdersPage() {
  // ── State tanımları ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("Tümü");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API'den siparişleri çek
  useEffect(() => {
    fetchWithAuth("/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("API hatası:", err);
        setIsLoading(false);
      });
  }, []);

  // ── Filtre sayaçları (her durum için kaç sipariş var?) ───
  // useMemo: sadece orders değişirse yeniden hesaplanır
  const counts = useMemo(() => {
    const result: Partial<Record<OrderFilter, number>> = {
      Tümü: orders.length,
    };
    orders.forEach((o) => {
      result[o.status] = (result[o.status] ?? 0) + 1;
    });
    return result;
  }, [orders]);

  // ── Arama + filtre uygulanmış sipariş listesi ────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Durum filtresi: "Tümü" seçiliyse hepsini göster
      const matchesFilter =
        activeFilter === "Tümü" || order.status === activeFilter;

      // 2. Arama filtresi: ID veya müşteri adında geçiyor mu?
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.product.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, activeFilter, orders]);

  // ── Handlers ─────────────────────────────────────────────
  // useCallback: SearchInput'un debounce'u ile uyumlu çalışır
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Sayfa başlığı */}
      <PageHeader
        title="Siparişler"
        description={`${filteredOrders.length} sipariş listeleniyor`}
      />

      {/* Arama + Filtre çubuğu */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Sipariş no, müşteri veya ürün ara..."
          onSearch={handleSearch}
          className="sm:w-72"
        />
        <OrderFilters
          active={activeFilter}
          onChange={setActiveFilter}
          counts={counts}
        />
      </div>

      {/* Sipariş tablosu */}
      <OrdersTable
        orders={filteredOrders}
        onSelect={setSelectedOrder}
      />

      {/* Detay dialog — selectedOrder null ise kapalı */}
      <OrderDetail
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

    </div>
  );
}
