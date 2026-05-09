"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types/user";
import {
  ShoppingCart,
  Box,
  Truck,
  TrendingUp,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(data => {
      if (data) setUser(data);
    });
  }, []);

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
          title="Bugünkü Siparişler"
          value="8"
          delta="+25% dünden itibaren"
          positive
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Kritik Stok"
          value="2"
          delta="Dikkat gerekiyor"
          positive={false}
          icon={<Box className="h-4 w-4" />}
        />
        <StatCard
          title="Aktif Kargolar"
          value="3"
          delta="1 gecikmeli"
          positive={false}
          icon={<Truck className="h-4 w-4" />}
        />
        <StatCard
          title="Aylık Gelir"
          value="₺12.430"
          delta="+8.2% geçen aya göre"
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
