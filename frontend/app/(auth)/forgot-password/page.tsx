"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { branding } from "@/lib/branding";
import { toast } from "sonner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Church, ArrowLeft, Mail, Send, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel";
import { siteImages } from "@/lib/site-images";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setSent(true);
    } catch (err: any) {
      const message = err.response?.data?.message || "If an account exists with that email, a reset link has been sent.";
      setSubmittedEmail(data.email);
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <AuthBrandPanel imageSrc={siteImages.hero} imageAlt="Church sanctuary">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Church className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Reset Your Password
        </h1>
        <p className="mb-8 text-lg text-white/80">
          No worries! Enter your email address and we&apos;ll send you a link to
          reset your password.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-white/70">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Mail className="h-4 w-4" />
          </div>
          Secure password reset process
        </div>
      </AuthBrandPanel>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="text-center lg:hidden">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Church className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>

          {!sent ? (
            <>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Forgot password?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 pl-10"
                      autoFocus
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full text-sm font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send reset link
                    </div>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{submittedEmail}</span>,
                  we&apos;ve sent a password reset link.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>
                  Didn&apos;t receive the email? Check your spam folder or try again
                  with a different email address.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="h-11 w-full text-sm font-semibold"
                  onClick={() => {
                    setSent(false);
                    setSubmittedEmail("");
                  }}
                >
                  Try a different email
                </Button>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
