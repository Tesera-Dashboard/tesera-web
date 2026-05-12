import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8 flex justify-center">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/404.png"
                alt="404"
                width={500}
                height={500}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <p className="text-muted-foreground mb-8">Bu sayfa görünüşe göre 'miyav' diyip kaçmiş <br /> Belki de bir fare kovalıyordur!         </p>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
