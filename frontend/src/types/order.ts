// ============================================================
// Order Types — Sipariş veri yapısı tanımları
// ============================================================
// Bu dosya, uygulama genelinde sipariş verilerinin şeklini belirler.
// "Order" arayüzü, bir siparişin hangi bilgileri taşıdığını tanımlar.
// "OrderStatus" tipi, bir siparişin alabileceği durumları sınırlar.
// ============================================================

/** Bir siparişin alabileceği tüm durumlar */
export type OrderStatus =
  | "İşleniyor"    // Sipariş alındı, hazırlanıyor
  | "Kargoda"      // Kargoya verildi, yolda
  | "Teslim Edildi" // Müşteriye ulaştı
  | "Gecikti"      // Tahmini tarihten sonra hâlâ teslim edilmedi
  | "İptal";       // Müşteri veya işletme tarafından iptal edildi

/** Tek bir siparişi temsil eden arayüz */
export interface Order {
  id: string;           // Benzersiz sipariş numarası, örn. "ORD-1001"
  customer: string;     // Müşteri adı soyadı
  email: string;        // Müşteri e-posta adresi
  product: string;      // Sipariş edilen ürün adı
  quantity: number;     // Adet sayısı
  amount: number;       // Toplam tutar (₺)
  status: OrderStatus;  // Siparişin mevcut durumu
  date: string;         // Sipariş tarihi (ISO formatı)
  address: string;      // Teslimat adresi
  notes?: string;       // Opsiyonel notlar (müşteri veya işletme notu)
}
