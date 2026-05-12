"use client";

import { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { getCurrentUser } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/api";
import { User } from "@/types/user";
import { toast } from "sonner";
import {
  ShoppingCart,
  Box,
  Truck,
  TrendingUp,
} from "lucide-react";

interface OverviewStats {
  total_orders: number;
  total_revenue: number;
  total_inventory: number;
  low_stock_items: number;
  active_shipments: number;
  delayed_shipments: number;
  pending_orders: number;
}

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/analytics/overview");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats load error:", err);
      toast.error("İstatistikler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser().then(data => {
      if (data) setUser(data);
    });
    loadStats();
  }, [loadStats]);

  const companyName = user?.company?.name || "Tesera";

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
          value={isLoading ? "..." : stats?.total_orders.toString() || "0"}
          delta={stats?.pending_orders ? `${stats.pending_orders} bekleyen` : ""}
          positive={stats?.pending_orders === 0}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Kritik Stok"
          value={isLoading ? "..." : stats?.low_stock_items?.toString() || "0"}
          delta={(stats?.low_stock_items || 0) > 0 ? "Dikkat gerekiyor" : "Normal"}
          positive={(stats?.low_stock_items || 0) === 0}
          icon={<Box className="h-4 w-4" />}
        />
        <StatCard
          title="Aktif Kargolar"
          value={isLoading ? "..." : stats?.active_shipments?.toString() || "0"}
          delta={(stats?.delayed_shipments || 0) > 0 ? `${stats?.delayed_shipments} gecikmeli` : "Hepsi zamanında"}
          positive={(stats?.delayed_shipments || 0) === 0}
          icon={<Truck className="h-4 w-4" />}
        />
        <StatCard
          title="Toplam Gelir"
          value={isLoading ? "..." : `₺${stats?.total_revenue.toLocaleString() || "0"}`}
          delta="Toplam gelir"
          positive
          icon={<TrendingUp className="h-4 w-4" />}
        />
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
