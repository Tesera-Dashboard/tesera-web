"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { verifyEmail } from "@/lib/auth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Doğrulama token'ı sağlanmadı.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        toast.success("E-posta başarıyla doğrulandı!");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message || "E-posta doğrulanamadı.");
      });
  }, [token]);

  if (status === "loading") {
    return <p className="text-sm text-center">E-postanız doğrulanıyor, lütfen bekleyin...</p>;
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-lg">
          <p className="text-sm font-medium">E-postanız başarıyla doğrulandı.</p>
        </div>
        <Button className="w-full" onClick={() => router.push("/onboarding")}>
          Başlayın
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        <p className="text-sm font-medium">{errorMessage}</p>
      </div>
      <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
        Giriş Ekranına Dön
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 space-y-6">
        <div className="text-center flex flex-col items-center space-y-2">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="Tesera Logo" width={600} height={200} className="w-[240px] md:w-[280px] h-auto object-contain dark:invert" priority />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">E-posta Doğrulama</h1>
        </div>

        <Suspense fallback={<p className="text-sm text-center">Yükleniyor...</p>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
