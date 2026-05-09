// ============================================================
// PageHeader — Sayfa başlık bileşeni
// ============================================================
// Orders, Inventory, Shipments gibi her sayfanın üstünde
// kullanılan tutarlı başlık + açıklama + sağ taraf aksiyon alanı.
// "children" prop'u sayesinde sağ tarafa buton, filtre vs. eklenebilir.
// ============================================================

interface PageHeaderProps {
  title: string;           // Ana başlık metni
  description: string;     // Açıklama metni (gri, küçük)
  children?: React.ReactNode; // Sağ tarafa eklenecek opsiyonel içerik (buton vb.)
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      {/* Sol: Başlık ve açıklama */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>

      {/* Sağ: Opsiyonel aksiyon alanı (örn. "Yeni Sipariş" butonu) */}
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
