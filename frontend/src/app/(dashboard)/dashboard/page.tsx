import { StatCard } from "@/components/dashboard/StatCard";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import {
  ShoppingCart,
  Box,
  Truck,
  TrendingUp,
} from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Good morning, Acme Corp 👋</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening with your operations today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Orders Today"
          value="48"
          delta="+12% from yesterday"
          positive
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Low Stock Items"
          value="7"
          delta="Needs attention"
          positive={false}
          icon={<Box className="h-4 w-4" />}
        />
        <StatCard
          title="Active Shipments"
          value="23"
          delta="3 delayed"
          positive={false}
          icon={<Truck className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue (MTD)"
          value="$12,430"
          delta="+8.2% from last month"
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
