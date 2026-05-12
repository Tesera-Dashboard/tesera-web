"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface OrderTrend {
  date: string;
  count: number;
  revenue: number;
}

interface InventoryByCategory {
  category: string;
  total_stock: number;
  item_count: number;
  total_value: number;
}

interface ShipmentStatus {
  status: string;
  count: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [inventoryByCategory, setInventoryByCategory] = useState<InventoryByCategory[]>([]);
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const [trendsRes, inventoryRes, shipmentRes] = await Promise.all([
        fetchWithAuth("/analytics/orders/trends?days=30"),
        fetchWithAuth("/analytics/inventory/by-category"),
        fetchWithAuth("/analytics/shipments/status")
      ]);

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setOrderTrends(trendsData);
      }

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventoryByCategory(inventoryData);
      }

      if (shipmentRes.ok) {
        const shipmentData = await shipmentRes.json();
        setShipmentStatus(shipmentData);
      }
    } catch (err) {
      console.error("Analytics load error:", err);
      toast.error("Analitik verileri yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analitik"
        description="İşletmenizin performans metrikleri ve trendler"
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Trends Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sipariş Trendleri (Son 30 Gün)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Sipariş Sayısı" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Gelir (₺)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Inventory by Category */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Envanter Kategorilere Göre</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_stock" fill="#3b82f6" name="Toplam Stok" />
                <Bar dataKey="item_count" fill="#10b981" name="Ürün Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Shipment Status Distribution */}
          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Kargo Durumu Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={shipmentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {shipmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Inventory Value by Category */}
          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Envanter Değeri Kategorilere Göre</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_value" fill="#8b5cf6" name="Toplam Değer (₺)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
