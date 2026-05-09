"use client";
// ============================================================
// SearchInput — Arama kutusu bileşeni
// ============================================================
// Üç sayfada da (Orders, Inventory, Shipments) kullanılacak.
// "debounce" sayesinde kullanıcı her tuşa basıldığında değil,
// yazmayı bıraktıktan 300ms sonra filtreleme tetiklenir.
// Bu, gereksiz render işlemlerini önler ve performansı artırır.
// ============================================================

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;         // Kutu içindeki ipucu metni
  onSearch: (value: string) => void; // Değer değiştiğinde çağrılacak fonksiyon
  className?: string;           // Opsiyonel ek CSS sınıfı
}

export function SearchInput({
  placeholder = "Ara...",
  onSearch,
  className,
}: SearchInputProps) {
  // "inputValue" = kullanıcının anlık yazdığı metin
  // "debouncedValue" = 300ms bekledikten sonra güncellenen değer
  const [inputValue, setInputValue] = useState("");

  // Kullanıcı yazmayı bıraktıktan 300ms sonra üst bileşene bildir
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);

    // Temizleme: Yeni bir tuşa basılırsa önceki timer iptal edilir
    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Arama ikonu — sol tarafta konumlandırılmış */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-9 pl-9 pr-4
          bg-background border rounded-lg
          text-sm text-foreground
          placeholder:text-muted-foreground
          outline-none
          focus:ring-2 focus:ring-primary/30 focus:border-primary
          transition-all duration-150
        "
      />
    </div>
  );
}
