"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resetPassword } from "@/lib/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Geçersiz veya eksik sıfırlama token'ı");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, password);
      toast.success("Şifre başarıyla sıfırlandı. Artık giriş yapabilirsiniz.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Şifre sıfırlanamadı");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Yeni Şifre</Label>
        <Input 
          id="password" 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Yeni Şifreyi Onayla</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          required 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !token}>
        {isLoading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
      </Button>
      {!token && (
        <p className="text-xs text-destructive text-center mt-2">
          Sıfırlama token'ı eksik. Lütfen e-posta bağlantınızı kontrol edin.
        </p>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 space-y-6">
        <div className="text-center flex flex-col items-center space-y-2">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="Tesera Logo" width={600} height={200} className="w-[240px] md:w-[280px] h-auto object-contain dark:invert" priority />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Şifreyi Sıfırla</h1>
          <p className="text-sm text-muted-foreground">
            Yeni şifrenizi aşağıya girin.
          </p>
        </div>

        <Suspense fallback={<p className="text-sm text-center">Yükleniyor...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center text-sm">
          Şifrenizi hatırladınız mı?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Giriş ekranına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
