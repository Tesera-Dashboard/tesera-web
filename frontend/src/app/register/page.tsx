"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-bold text-2xl tracking-tight mb-2">
            Tesera
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground">
            Start your free trial. No credit card required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input 
              id="companyName" 

              placeholder="Acme Corp" 
              required 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}

            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 

              placeholder="John Doe" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}

            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input 
              id="email" 
              type="email" 

              placeholder="m@company.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}

            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            {isLoading ? "Creating Account..." : "Create Account"}

          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
