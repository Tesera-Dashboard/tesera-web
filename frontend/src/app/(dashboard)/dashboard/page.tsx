"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/api";
import { User } from "@/types/user";
import { Notification } from "@/types/notification";
import { toast } from "sonner";
import {
  ShoppingCart,
  Box,
  Truck,
  TrendingUp,
  Bell,
  BarChart3,
  Package,
  Truck as TruckIcon,
  Workflow,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

interface OverviewStats {
  total_orders: number;
  total_revenue: number;
  total_inventory: number;
  low_stock_items: number;
  active_shipments: number;
  delayed_shipments: number;
  pending_orders: number;
}

interface OrderTrend {
  date: string;
  count: number;
  revenue: number;
}

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/analytics/overview");
      console.log("Stats response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Stats data:", data);
        setStats(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Stats error:", errorData);
        toast.error(`İstatistikler yüklenirken hata oluştu: ${errorData.detail || errorData.message || "Bilinmeyen hata"}`);
      }
    } catch (err) {
      console.error("Stats load error:", err);
      toast.error("İstatistikler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTrends = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/analytics/orders/trends?days=7");
      console.log("Trends response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Trends data:", data);
        setOrderTrends(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Trends error:", errorData);
      }
    } catch (err) {
      console.error("Trends load error:", err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch (err) {
      console.error("Notifications load error:", err);
    }
  }, []);

  useEffect(() => {
    getCurrentUser().then(data => {
      if (data) setUser(data);
    });
    loadStats();
    loadTrends();
    loadNotifications();
  }, [loadStats, loadTrends, loadNotifications]);

  const companyName = user?.company?.name || "Tesera";

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "shipment":
        return <TruckIcon className="h-4 w-4 text-green-600" />;
      case "workflow":
        return <Workflow className="h-4 w-4 text-purple-600" />;
      case "inventory":
        return <Box className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "error":
        return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Hata</span>;
      case "warning":
        return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Uyarı</span>;
      case "success":
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Başarılı</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Bilgi</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Günaydın, {companyName} 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Operasyonlarınızda bugün neler olup bittiğine bir göz atın.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Siparişler"
          value={isLoading ? "..." : (stats?.total_orders ?? 0).toString()}
          delta={stats && stats.pending_orders > 0 ? `${stats.pending_orders} bekleyen` : ""}
          positive={stats?.pending_orders === 0}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Kritik Stok"
          value={isLoading ? "..." : (stats?.low_stock_items ?? 0).toString()}
          delta={stats && stats.low_stock_items > 0 ? "Dikkat gerekiyor" : "Normal"}
          positive={stats?.low_stock_items === 0}
          icon={<Box className="h-4 w-4" />}
        />
        <StatCard
          title="Aktif Kargolar"
          value={isLoading ? "..." : (stats?.active_shipments ?? 0).toString()}
          delta={stats && stats.delayed_shipments > 0 ? `${stats.delayed_shipments} gecikmeli` : "Hepsi zamanında"}
          positive={stats?.delayed_shipments === 0}
          icon={<Truck className="h-4 w-4" />}
        />
        <StatCard
          title="Toplam Gelir"
          value={isLoading ? "..." : `₺${(stats?.total_revenue ?? 0).toLocaleString()}`}
          delta="Toplam gelir"
          positive
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Analytics Chart + Notifications */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Trends Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sipariş Trendleri
            </h3>
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="sm">Detay</Button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={orderTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Sipariş Sayısı" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Notifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Son Bildirimler
            </h3>
            <Link href="/dashboard/notifications">
              <Button variant="outline" size="sm">Tümünü Gör</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Henüz bildirim yok
              </div>
            ) : (
              notifications.slice(0, 4).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    !notification.is_read
                      ? "bg-blue-50 border-blue-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{notification.title}</p>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* AI Recommendations + Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div>
          <AIRecommendations />
        </div>
      </div>
    </div>
  );
}
