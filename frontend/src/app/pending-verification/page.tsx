"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { resendVerification, logout } from "@/lib/auth";

export default function PendingVerificationPage() {
  const router = useRouter();
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
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We have sent a verification link to your email address. Please click the link to activate your account.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            className="w-full" 
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
          >
            {isLoading 
              ? "Sending..." 
              : countdown > 0 
                ? `Resend available in ${countdown}s` 
                : "Resend Verification Email"
            }
          </Button>

          <div className="flex flex-col space-y-2">
            <Link href="/dashboard" className="text-sm text-primary hover:underline">
              I have already verified
            </Link>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:underline">
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
