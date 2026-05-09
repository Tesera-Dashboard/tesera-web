// ============================================================
// OrderDetail — Sipariş detay dialog bileşeni
// ============================================================
// Bir siparişe tıklanınca açılan modal pencere.
// Projede zaten mevcut olan shadcn/ui Dialog bileşenini kullanır.
// Böylece tutarlılık sağlanır ve sıfırdan modal yazmayız.
// ============================================================

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, getOrderStatusVariant } from "@/components/shared/StatusBadge";
import { Order } from "@/types/order";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Package, Hash, CalendarDays, FileText } from "lucide-react";

interface OrderDetailProps {
  order: Order | null;     // Gösterilecek sipariş (null ise dialog kapalı)
  onClose: () => void;     // Dialog kapatılınca çağrılır
}

export function OrderDetail({ order, onClose }: OrderDetailProps) {
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base">{order?.id}</DialogTitle>
            {order && (
              <StatusBadge
                variant={getOrderStatusVariant(order.status)}
                label={order.status}
              />
            )}
          </div>
        </DialogHeader>

        {order && (
          <div className="space-y-4 mt-1">
            {/* Müşteri bilgileri */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Müşteri Bilgileri
              </p>
              <DetailRow icon={<Hash className="h-3.5 w-3.5" />} label="Ad Soyad" value={order.customer} />
              <DetailRow icon={<Mail className="h-3.5 w-3.5" />} label="E-posta" value={order.email} />
              <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Adres" value={order.address} />
            </div>

            <Separator />

            {/* Sipariş bilgileri */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sipariş Detayı
              </p>
              <DetailRow icon={<Package className="h-3.5 w-3.5" />} label="Ürün" value={order.product} />
              <DetailRow
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Adet"
                value={`${order.quantity} adet`}
              />
              <DetailRow
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Toplam Tutar"
                value={`₺${order.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                valueClassName="font-semibold text-foreground"
              />
              <DetailRow
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                label="Sipariş Tarihi"
                value={new Date(order.date).toLocaleString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>

            {/* Notlar — sadece varsa gösterilir */}
            {order.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notlar
                  </p>
                  <div className="flex gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// DetailRow — Dialog içindeki tek bir bilgi satırı
// ============================================================
function DetailRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 flex justify-between gap-2 min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span className={`text-xs text-right ${valueClassName ?? "text-foreground"}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
