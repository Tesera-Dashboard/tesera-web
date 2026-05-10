"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 space-y-6">
        <div className="text-center flex flex-col items-center space-y-2">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="Tesera Logo" width={600} height={200} className="w-[240px] md:w-[280px] h-auto object-contain dark:invert" priority />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Şifremi Unuttum</h1>
          <p className="text-sm text-muted-foreground">
            Şifre sıfırlama bağlantısı almak için e-postanızı girin.
          </p>
        </div>

        {isSent ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">Şifrenizi sıfırlamanız için <strong>{email}</strong> adresine bir bağlantı gönderdik.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
              Başka bir e-posta dene
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">İş E-postası</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="isim@sirket.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Bağlantı gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </Button>
          </form>
        )}

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
