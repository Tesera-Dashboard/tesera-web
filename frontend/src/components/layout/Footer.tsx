import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="Tesera Logo" width={500} height={160} className="w-[160px] md:w-[200px] h-auto object-contain dark:invert" />
            </Link>
            <p className="text-sm text-muted-foreground pr-4">
              Modern KOBİ'ler, kooperatifler ve e-ticaret işletmeleri için yapay zeka destekli operasyon asistanı platformu.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Ürün</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Özellikler</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</Link></li>
              <li><Link href="#integrations" className="hover:text-foreground transition-colors">Entegrasyonlar</Link></li>
              <li><Link href="#changelog" className="hover:text-foreground transition-colors">Sürüm Notları</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Şirket</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-foreground transition-colors">Hakkımızda</Link></li>
              <li><Link href="#careers" className="hover:text-foreground transition-colors">Kariyer</Link></li>
              <li><Link href="#blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#contact" className="hover:text-foreground transition-colors">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Yasal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#privacy" className="hover:text-foreground transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="#terms" className="hover:text-foreground transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="#security" className="hover:text-foreground transition-colors">Güvenlik</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tesera. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="#twitter" className="hover:text-foreground transition-colors">Twitter</Link>
            <Link href="#linkedin" className="hover:text-foreground transition-colors">LinkedIn</Link>
            <Link href="#github" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
