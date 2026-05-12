import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { Order } from "@/types/order";

const statusConfig: Record<string, { label: string; className: string }> = {
  "Kargoda":        { label: "Kargoda",        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  "İşleniyor":      { label: "İşleniyor",      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "Teslim Edildi":  { label: "Teslim Edildi",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  "Gecikti":        { label: "Gecikti",        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/orders?limit=5")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data.slice(0, 5));
        } else {
          console.error("Unexpected data format:", data);
          setOrders([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Dashboard orders fetch error:", err);
        setOrders([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Yükleniyor...</div>;
  }

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Son Siparişler</h3>
        <a href="/dashboard/orders" className="text-xs text-primary hover:underline font-medium">
          Tümünü gör
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Sipariş</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Müşteri</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Ürün</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Durum</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const s = statusConfig[o.status] || { label: o.status, className: "bg-gray-100 text-gray-700" };
              
              // Date format fix: "2026-05-09T09:14:00" -> "Today, 09:14"
              let displayDate = o.date;
              try {
                const date = new Date(o.date);
                displayDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch (e) {}

              return (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-xs">{o.id}</p>
                    <p className="text-[11px] text-muted-foreground">{displayDate}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs">{o.customer}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{o.product}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium", s.className)}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs font-medium">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(o.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
