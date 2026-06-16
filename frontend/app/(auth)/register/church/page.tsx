"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { branding } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Church, ArrowLeft, ArrowRight, Mail, Lock, User, MapPin, Check, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

const churchRegistrationSchema = z.object({
  churchName: z.string().min(2, "Church name is required"),
  churchSlug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ChurchRegistrationData = z.infer<typeof churchRegistrationSchema>;

export default function ChurchRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChurchRegistrationData>({
    resolver: zodResolver(churchRegistrationSchema),
  });

  const churchSlug = watch("churchSlug", "");

  const onSubmit = async (data: ChurchRegistrationData) => {
    try {
      await api.post("/churches", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        churchSlug: data.churchSlug,
        name: data.churchName,
        phone: data.phone,
        city: data.city,
        state: data.state,
      });
      toast.success("Church registered! You can now sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative hidden w-1/2 items-center justify-center bg-gradient-to-br from-primary/90 via-primary to-primary/70 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 max-w-md px-8 text-center text-white">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Church className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Register Your Church
          </h1>
          <p className="mb-8 text-lg text-white/80">
            Set up your church on {branding.shortName} in minutes. Start managing your
            finances with transparency and accountability.
          </p>
          <div className="space-y-4 text-left text-sm text-white/80">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-4 w-4" />
              </div>
              Free plan available — no credit card required
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-4 w-4" />
              </div>
              Full data isolation — your church&apos;s data is secure
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-4 w-4" />
              </div>
              Upgrade or downgrade plans anytime
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:hidden">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Church className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Register your church</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Step {step} of 2 — {step === 1 ? "Church details" : "Your admin account"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="churchName" className="text-sm font-medium">Church Name</Label>
                  <div className="relative">
                    <Church className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="churchName" placeholder="Grace Community Church" className="h-11 pl-10" {...register("churchName")} />
                  </div>
                  {errors.churchName && <p className="text-sm text-red-500">{errors.churchName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churchSlug" className="text-sm font-medium">Church URL Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">cdms.app/</span>
                    <Input id="churchSlug" placeholder="grace-community-church" className="h-11 pl-[72px]" {...register("churchSlug")} />
                  </div>
                  {errors.churchSlug && <p className="text-sm text-red-500">{errors.churchSlug.message}</p>}
                  {churchSlug && (
                    <p className="text-xs text-muted-foreground">
                      Your login URL: <span className="font-medium">cdms.app/{churchSlug}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Church Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="office@gracechurch.org" className="h-11 pl-10" {...register("email")} />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input id="city" placeholder="Springfield" className="h-11" {...register("city")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Input id="state" placeholder="IL" className="h-11" {...register("state")} />
                  </div>
                </div>

                <Button type="button" className="h-11 w-full" onClick={() => setStep(2)}>
                  <div className="flex items-center gap-2">Next <ArrowRight className="h-4 w-4" /></div>
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="firstName" placeholder="John" className="h-11 pl-10" {...register("firstName")} />
                    </div>
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="h-11" {...register("lastName")} />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Admin Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="h-11 pl-10 pr-10" {...register("password")} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => setStep(1)}>
                    <div className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</div>
                  </Button>
                  <Button type="submit" className="h-11 flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Church"}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
