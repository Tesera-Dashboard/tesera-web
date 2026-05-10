"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { register, login } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      await register(companyName, fullName, email, password);
      toast.success("Account created successfully!");

      // Automatically login after register
      await login(email, password);
      router.push("/pending-verification");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");

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
          <h1 className="text-2xl font-semibold tracking-tight">Hesabınızı oluşturun</h1>
          <p className="text-sm text-muted-foreground">
            Ücretsiz denemenizi başlatın. Kredi kartı gerekmez.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Şirket Adı</Label>
            <Input
              id="companyName"

              placeholder="Şirket A.Ş."
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}

            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"

              placeholder="Ahmet Yılmaz"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}

            />
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"

              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}

          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Devam ederek şunları kabul etmiş olursunuz:{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Kullanım Koşulları
          </Link>{" "}
          ve{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Gizlilik Politikası
          </Link>
          .
        </div>

        <div className="text-center text-sm">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
}
