// src/app/(auth)/login/login-form.tsx
"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@sms.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required>Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-600 hover:underline dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
