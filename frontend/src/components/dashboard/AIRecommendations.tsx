import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const recommendations = [
  {
    type: "stock",
    message: "SKU-1042 (Running Shoes – Black, Size 42) has only 3 units left. Reorder recommended.",
    action: "View Inventory",
  },
  {
    type: "shipment",
    message: "Order #ORD-2891 is delayed by 2 days. Customer has not been notified.",
    action: "Notify Customer",
  },
  {
    type: "workflow",
    message: "12 pending orders have no assigned team member. Assign automatically?",
    action: "Auto-assign",
  },
];

export function AIRecommendations() {
  return (
    <div className="bg-card border rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <h3 className="font-semibold text-sm">AI Recommendations</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className="p-3 rounded-xl bg-muted/60 space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">{r.message}</p>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              {r.action}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
