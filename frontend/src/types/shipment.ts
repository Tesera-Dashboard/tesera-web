// ============================================================
// Shipment Types — Kargo / gönderi veri yapısı tanımları
// ============================================================
// Bu dosya, kargo gönderilerinin veri şeklini tanımlar.
// "ShipmentStatus" tipi, bir gönderinin alabileceği durumları sınırlar.
// "Shipment" arayüzü, takip kodu, kargo firması, gecikme bilgisi gibi
// tüm gönderi detaylarını taşır.
// ============================================================

/** Bir gönderinin alabileceği tüm durumlar */
export type ShipmentStatus =
  | "Yolda"           // Kargo yolda, taşınıyor
  | "Teslim Edildi"   // Alıcıya başarıyla ulaştı
  | "Gecikti"         // Tahmini tarihten sonra hâlâ teslim edilmedi
  | "İade"            // Alıcıdan gönderene iade sürecinde
  | "Beklemede";      // Henüz kargoya verilmedi

/** Tek bir kargo gönderisini temsil eden arayüz */
export interface Shipment {
  id: string;              // Benzersiz gönderi kodu, örn. "SHP-1001"
  orderId: string;         // Bağlı sipariş numarası, örn. "ORD-1001"
  carrier: string;         // Kargo firması adı, örn. "Yurtiçi Kargo"
  trackingCode: string;    // Kargo takip numarası
  status: ShipmentStatus;  // Gönderinin mevcut durumu
  origin: string;          // Çıkış şehri
  destination: string;     // Varış şehri
  estimatedDelivery: string; // Tahmini teslimat tarihi (ISO formatı)
  isDelayed: boolean;      // Gecikme var mı? (DelayFlag bileşeni için)
  delayReason?: string;    // Gecikme nedeni (opsiyonel)
}
