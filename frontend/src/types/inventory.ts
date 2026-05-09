// ============================================================
// Inventory Types — Envanter (stok) veri yapısı tanımları
// ============================================================
// Bu dosya, stokta tutulan ürünlerin veri şeklini tanımlar.
// "StockLevel" tipi, bir ürünün stok durumunu sınırlar.
// "InventoryItem" arayüzü, ürünün tüm stok bilgilerini taşır.
// ============================================================

/** Bir ürünün stok durumu */
export type StockLevel =
  | "Stokta"          // Yeterli stok var
  | "Azalıyor"        // Stok, minimum seviyenin altına düşmüş
  | "Tükendi";        // Stokta hiç ürün kalmamış

/** Tek bir stok kalemini temsil eden arayüz */
export interface InventoryItem {
  id: string;           // Benzersiz envanter kodu, örn. "INV-001"
  name: string;         // Ürün adı, örn. "Ev Yapımı Çilek Reçeli"
  sku: string;          // Stok takip kodu (Stock Keeping Unit), örn. "RCL-CLK-370"
  category: string;     // Ürün kategorisi, örn. "Reçel"
  stock: number;        // Mevcut stok adedi
  minStock: number;     // Minimum stok seviyesi (bunun altı = uyarı)
  price: number;        // Birim fiyat (₺)
  status: StockLevel;   // Hesaplanan stok durumu
  lastRestocked: string; // Son stok yenileme tarihi (ISO formatı)
}
