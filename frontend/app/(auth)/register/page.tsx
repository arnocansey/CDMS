"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { branding } from "@/lib/branding";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import {
  Eye, EyeOff, Church, ArrowRight, Mail, Lock, User, Check, X, Search, ChevronRight,
} from "lucide-react";
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel";
import { siteImages } from "@/lib/site-images";

interface ChurchSearchResult {
  id: number;
  name: string;
  city: string;
  state: string;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];
  const metCount = checks.filter((c) => c.met).length;
  const strength = metCount === 0 ? 0 : metCount <= 1 ? 1 : metCount <= 3 ? 2 : 3;
  const colors = ["bg-muted", "bg-red-500", "bg-yellow-500", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? colors[strength] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`flex items-center gap-1 text-xs ${
              check.met ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {check.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<"type" | "search" | "form">("type");
  const [churchQuery, setChurchQuery] = useState("");
  const [churchResults, setChurchResults] = useState<ChurchSearchResult[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<ChurchSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const searchChurches = useCallback(async (query: string) => {
    if (query.length < 2) {
      setChurchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await api.get("/approvals/churches/search", { params: { query } });
      setChurchResults(response.data);
    } catch {
      setChurchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchChurches(churchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [churchQuery, searchChurches]);

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        churchId: selectedChurch?.id,
      } as any);
      toast.success("Registration submitted!");
      router.push("/pending-approval");
    } catch (err: any) {
      const data = err.response?.data;
      let message = "Registration failed";
      if (data?.message) {
        message = data.message;
      } else if (data?.errors) {
        message = Object.values(data.errors).join(", ");
      }
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <AuthBrandPanel imageSrc={siteImages.congregation} imageAlt="People gathering in community">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Church className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Join Our Community
        </h1>
        <p className="mb-8 text-lg text-white/80">
          Create your account and start managing your church&apos;s financial
          operations with transparency and efficiency.
        </p>
        <div className="space-y-4 text-left text-sm text-white/80">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Check className="h-4 w-4" />
            </div>
            Track donations, tithes, and offerings in real time
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Check className="h-4 w-4" />
            </div>
            Generate financial reports and receipts instantly
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Check className="h-4 w-4" />
            </div>
            Full audit trail for complete accountability
          </div>
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

          {step === "type" && (
            <>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  How would you like to register?
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setStep("search")}
                  className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Register as Member</p>
                    <p className="text-sm text-muted-foreground">Join an existing church</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                <Link href="/register/church">
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Church className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Register Church</p>
                      <p className="text-sm text-muted-foreground">Register a new church on the platform</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </Link>
              </div>
            </>
          )}

          {step === "search" && (
            <>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Find your church</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Search for your church to join
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by church name..."
                    className="h-11 pl-10"
                    value={churchQuery}
                    onChange={(e) => setChurchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                {searching && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {!searching && churchResults.length > 0 && (
                  <div className="space-y-2">
                    {churchResults.map((church) => (
                      <button
                        key={church.id}
                        onClick={() => {
                          setSelectedChurch(church);
                          setStep("form");
                        }}
                        className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Church className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{church.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {church.city}, {church.state}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                {!searching && churchQuery.length >= 2 && churchResults.length === 0 && (
                  <div className="space-y-4 py-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No churches found matching &quot;{churchQuery}&quot;
                    </p>
                    <Link href="/register/church">
                      <Button variant="outline" className="w-full">
                        Can&apos;t find your church? Request Registration
                      </Button>
                    </Link>
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setStep("type")}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </>
          )}

          {step === "form" && (
            <>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Joining <span className="font-medium text-foreground">{selectedChurch?.name}</span>
                  {" "}({selectedChurch?.city}, {selectedChurch?.state})
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="h-11 pl-10"
                        {...register("firstName")}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="h-11"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

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
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="h-11 pl-10 pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  <PasswordStrength password={passwordValue} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className="h-11 pl-10"
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
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
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button variant="outline" className="h-11 w-full text-sm font-semibold">
              Sign in instead
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
