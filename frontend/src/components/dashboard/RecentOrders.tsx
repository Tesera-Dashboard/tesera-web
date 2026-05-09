import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const orders = [
  { id: "ORD-2904", customer: "Elif Yıldız", product: "Nike Air Max 270", status: "Shipped", amount: "$129.00", date: "Today, 09:14" },
  { id: "ORD-2903", customer: "Mehmet Demir", product: "Adidas Ultraboost 22", status: "Processing", amount: "$189.00", date: "Today, 08:41" },
  { id: "ORD-2902", customer: "Zeynep Kaya", product: "Puma RS-X x3", status: "Delivered", amount: "$94.99", date: "Yesterday, 18:22" },
  { id: "ORD-2901", customer: "Can Özkan", product: "New Balance 574", status: "Delayed", amount: "$112.00", date: "Yesterday, 14:05" },
  { id: "ORD-2900", customer: "Selin Arslan", product: "Converse Chuck Taylor", status: "Delivered", amount: "$79.00", date: "Yesterday, 11:30" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  Shipped:    { label: "Shipped",    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  Processing: { label: "Processing", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  Delivered:  { label: "Delivered",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  Delayed:    { label: "Delayed",    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function RecentOrders() {
  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Recent Orders</h3>
        <a href="/dashboard/orders" className="text-xs text-primary hover:underline font-medium">
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Order</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Product</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const s = statusConfig[o.status];
              return (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-xs">{o.id}</p>
                    <p className="text-[11px] text-muted-foreground">{o.date}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs">{o.customer}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{o.product}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium", s.className)}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs font-medium">{o.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
