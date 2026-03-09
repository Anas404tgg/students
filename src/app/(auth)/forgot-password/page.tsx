// src/app/(auth)/forgot-password/page.tsx
"use client";

import { ArrowLeft, GraduationCap, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent if account exists");
    } catch {
      // error toast handled by api client
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="animate-fade-in text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 text-success-600">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account with that email exists, we&apos;ve sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fp-email" required>Email</Label>
            <Input
              id="fp-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send reset link
          </Button>
          <div className="text-center">
            <Link href="/login" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
              <ArrowLeft className="mr-1 inline h-3 w-3" /> Back to sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
