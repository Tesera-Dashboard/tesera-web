// ============================================================
// DataTable — Paylaşılan tablo iskeleti bileşeni
// ============================================================
// Orders, Inventory, Shipments sayfalarının hepsi tablo gösterir.
// Bu bileşen yalnızca tablonun görsel iskeletini (wrapper) sağlar:
// sticky header, overflow, hover efekti, responsive scrolling.
//
// Sütun tanımları (columns) ve satır içeriği (children) dışarıdan
// gelir — bu bileşen içeriğe karışmaz, sadece çerçeveyi çizer.
//
// Kullanım:
//   <DataTable columns={["Sipariş", "Müşteri", "Durum", "Tutar"]}>
//     {orders.map(order => (
//       <tr key={order.id}>
//         <td>{order.id}</td>
//         ...
//       </tr>
//     ))}
//   </DataTable>
// ============================================================

import { cn } from "@/lib/utils";

interface DataTableProps {
  columns: string[];          // Sütun başlıklarının listesi
  children: React.ReactNode;  // Tablo satırları (<tr> elementleri)
  className?: string;
}

export function DataTable({ columns, children, className }: DataTableProps) {
  return (
    <div className={cn("bg-card border rounded-2xl overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Tablo başlıkları */}
          <thead>
            <tr className="border-b bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-5 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Tablo gövdesi — satırlar dışarıdan gelir */}
          <tbody>
            {children}
          </tbody>

        </table>
      </div>
    </div>
  );
}

// ============================================================
// DataTableRow — Tablo satırı yardımcı bileşeni
// ============================================================
// Hover efekti ve tıklanabilirlik için. Satıra tıklanınca
// "onClick" çağrılır (örn. detay dialog'u açmak için).

interface DataTableRowProps {
  children: React.ReactNode;
  onClick?: () => void; // Satıra tıklanınca tetiklenir
  className?: string;
  isHighlighted?: boolean; // Gecikme gibi durumlarda hafif kırmızı arka plan
}

export function DataTableRow({
  children,
  onClick,
  className,
  isHighlighted = false,
}: DataTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b last:border-0 transition-colors",
        onClick && "cursor-pointer hover:bg-muted/20",
        isHighlighted && "bg-red-50/50 dark:bg-red-900/10",
        className
      )}
    >
      {children}
    </tr>
  );
}

// ============================================================
// DataTableCell — Tablo hücresi yardımcı bileşeni
// ============================================================

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  mobileHidden?: boolean; // true ise mobilde bu sütun gizlenir
}

export function DataTableCell({
  children,
  className,
  mobileHidden = false,
}: DataTableCellProps) {
  return (
    <td
      className={cn(
        "px-5 py-3.5 text-xs",
        mobileHidden && "hidden md:table-cell",
        className
      )}
    >
      {children}
    </td>
  );
}
