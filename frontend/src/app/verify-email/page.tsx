"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
      setErrorMessage("No verification token provided.");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        toast.success("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message || "Failed to verify email.");
      });
  }, [token]);

  if (status === "loading") {
    return <p className="text-sm text-center">Verifying your email, please wait...</p>;
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-lg">
          <p className="text-sm font-medium">Your email has been successfully verified.</p>
        </div>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Continue to Login
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
        Back to Login
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-bold text-2xl tracking-tight mb-2">
            Tesera
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Email Verification</h1>
        </div>

        <Suspense fallback={<p className="text-sm text-center">Loading...</p>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
