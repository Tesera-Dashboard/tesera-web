import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 md:h-24 items-center justify-between px-4 md:px-8">
        <div className="flex gap-6 md:gap-10">
          <Image src="/logo.png" alt="Tesera Logo" width={500} height={160} className="w-[160px] md:w-[200px] h-auto object-contain dark:invert" priority />
          <nav className="hidden md:flex gap-6 mt-3">
            <Link
              href="#features"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Özellikler
            </Link>
            <Link
              href="#solutions"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Çözümler
            </Link>
            <Link
              href="#pricing"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Fiyatlandırma
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Ücretsiz Başla</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
