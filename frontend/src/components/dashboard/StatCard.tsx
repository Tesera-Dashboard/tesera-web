import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ReactNode;
}

export function StatCard({ title, value, delta, positive, icon }: StatCardProps) {
  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className={cn("text-xs mt-1.5 font-medium", positive ? "text-emerald-600 dark:text-emerald-400" : "text-orange-500 dark:text-orange-400")}>
        {delta}
      </p>
    </div>
  );
}
