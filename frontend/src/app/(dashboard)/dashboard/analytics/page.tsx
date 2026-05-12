"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

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

interface AIPredictions {
  predictions: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [inventoryByCategory, setInventoryByCategory] = useState<InventoryByCategory[]>([]);
  const [shipmentStatus, setShipmentStatus] = useState<ShipmentStatus[]>([]);
  const [aiPredictions, setAiPredictions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const [trendsRes, inventoryRes, shipmentRes, predictionsRes] = await Promise.all([
        fetchWithAuth("/analytics/orders/trends?days=30"),
        fetchWithAuth("/analytics/inventory/by-category"),
        fetchWithAuth("/analytics/shipments/status"),
        fetchWithAuth("/ai/predictions")
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

      if (predictionsRes.ok) {
        const predictionsData: AIPredictions = await predictionsRes.json();
        setAiPredictions(predictionsData.predictions);
      }
    } catch (err) {
      console.error("Analytics load error:", err);
      toast.error("Analitik verileri yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
      setIsLoadingPredictions(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const regeneratePredictions = async () => {
    setIsRegenerating(true);
    try {
      const predictionsRes = await fetchWithAuth("/ai/predictions");
      if (predictionsRes.ok) {
        const predictionsData: AIPredictions = await predictionsRes.json();
        setAiPredictions(predictionsData.predictions);
        toast.success("Öngörüler başarıyla yenilendi");
      }
    } catch (err) {
      console.error("Regenerate predictions error:", err);
      toast.error("Öngörüler yenilenirken hata oluştu");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Analitik"
        description="İşletmenizin performans metrikleri ve trendler"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Skeleton */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
            <Card className="p-6 md:col-span-2">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
          </div>
          {/* AI Predictions Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* AI Predictions Section */}
          <Card className="p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">AI Öngörüleri</h3>
              </div>
              <Button
                onClick={regeneratePredictions}
                disabled={isRegenerating}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {isLoadingPredictions ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aiPredictions ? (
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiPredictions}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Öngörüler yüklenemedi.</p>
            )}
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Veriye dayalı tahminler</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
