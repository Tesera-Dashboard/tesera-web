// ============================================================
// EmptyState — Boş durum bileşeni
// ============================================================
// Tablo veya liste boş olduğunda (arama sonucu yok, veri yok vb.)
// kullanıcıya anlamlı bir geri bildirim verir.
// Global Rules: "Include loading, empty and error states" ✓
//
// Kullanım örnekleri:
//   // Arama sonucu boş:
//   <EmptyState
//     icon={<Search />}
//     title="Sonuç bulunamadı"
//     description="Arama kriterlerinizi değiştirip tekrar deneyin."
//   />
//
//   // Genel boş liste:
//   <EmptyState
//     icon={<Box />}
//     title="Henüz sipariş yok"
//     description="İlk siparişiniz geldiğinde burada görünecek."
//   />
// ============================================================

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode; // Üstteki ikon (lucide-react ikonları önerilir)
  title: string;          // Ana mesaj
  description?: string;   // Yardımcı açıklama
  action?: React.ReactNode; // Opsiyonel aksiyon butonu
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        "border rounded-2xl bg-card",
        className
      )}
    >
      {/* İkon — gri daire arka planı içinde */}
      {icon && (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}

      {/* Başlık */}
      <p className="font-semibold text-sm text-foreground">{title}</p>

      {/* Açıklama */}
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}

      {/* Aksiyon butonu */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
