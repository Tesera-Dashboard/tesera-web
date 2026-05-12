"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Mail } from "lucide-react";
import { resendVerification, logout } from "@/lib/auth";

function PendingVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resendVerification();
      toast.success("Verification email sent successfully!");
      setCountdown(60);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 space-y-6 text-center">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="Tesera Logo" width={600} height={200} className="mx-auto w-[220px] md:w-[260px] h-auto object-contain dark:invert" priority />
        </Link>

        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">E-postanızı kontrol edin</h1>
          <p className="text-sm text-muted-foreground">
            E-posta adresinize bir doğrulama bağlantısı gönderdik. Hesabınızı etkinleştirmek için lütfen bağlantıya tıklayın.
          </p>
          {email ? (
            <p className="text-sm font-medium text-foreground">{email}</p>
          ) : null}
        </div>

        <div className="rounded-xl border bg-muted/40 p-4 text-left space-y-3">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Gelen kutunuzu ve spam klasörünüzü kontrol edin.</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Doğrulama bağlantısı 24 saat boyunca geçerlidir.</p>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Doğrulama tamamlandıktan sonra şirket panelinize erişebilirsiniz.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            className="w-full" 
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
          >
            {isLoading 
              ? "Gönderiliyor..." 
              : countdown > 0 
                ? `${countdown} saniye içinde tekrar gönderilebilir` 
                : "Doğrulama E-postasını Tekrar Gönder"
            }
          </Button>

          <div className="flex flex-col space-y-2">
            <Link href="/onboarding" className="text-sm text-primary hover:underline">
              Hesabımı zaten doğruladım
            </Link>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:underline">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingVerificationPage() {
  return (
    <Suspense fallback={<p className="text-sm text-center">Yükleniyor...</p>}>
      <PendingVerificationContent />
    </Suspense>
  );
}
