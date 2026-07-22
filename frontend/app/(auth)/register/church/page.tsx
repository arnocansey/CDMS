"use client";

import { useEffect, useRef, useState } from "react";
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
import { Church, ArrowLeft, ArrowRight, Mail, Lock, User, Check, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel";
import { siteImages } from "@/lib/site-images";

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

function slugifyChurchName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function ChurchRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const slugManuallyEdited = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChurchRegistrationData>({
    resolver: zodResolver(churchRegistrationSchema),
  });

  const churchName = watch("churchName", "");
  const churchSlug = watch("churchSlug", "");

  useEffect(() => {
    if (slugManuallyEdited.current) return;
    const nextSlug = slugifyChurchName(churchName || "");
    setValue("churchSlug", nextSlug, { shouldValidate: nextSlug.length > 0 });
  }, [churchName, setValue]);

  const churchSlugRegister = register("churchSlug");

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
      toast.success("Registration submitted! A platform admin will review your church.");
      router.push("/pending-approval");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const progress = step === 1 ? 50 : 100;

  return (
    <div className="flex min-h-screen">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <AuthBrandPanel imageSrc={siteImages.hero} imageAlt="Church exterior">
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
      </AuthBrandPanel>

      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-7">
          <div className="text-center lg:hidden">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Church className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                Step {step} of 2
              </p>
              <p className="text-xs text-muted-foreground">
                {step === 1 ? "Church details" : "Admin account"}
              </p>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Registration progress: step ${step} of 2`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Register your church</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step === 1
                  ? "Tell us about your church to create its workspace."
                  : "Create the admin account that will manage your church."}
              </p>
            </div>
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
                  {errors.churchName && <p className="text-sm text-destructive">{errors.churchName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churchSlug" className="text-sm font-medium">Church URL Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">cdms.app/</span>
                    <Input
                      id="churchSlug"
                      placeholder="grace-community-church"
                      className="h-11 pl-[72px]"
                      {...churchSlugRegister}
                      onChange={(e) => {
                        slugManuallyEdited.current = true;
                        churchSlugRegister.onChange(e);
                      }}
                    />
                  </div>
                  {errors.churchSlug && <p className="text-sm text-destructive">{errors.churchSlug.message}</p>}
                  {churchSlug && (
                    <p className="text-xs text-muted-foreground">
                      Your login URL: <span className="font-medium text-foreground">cdms.app/{churchSlug}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Church Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="office@gracechurch.org" className="h-11 pl-10" {...register("email")} />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
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
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="h-11" {...register("lastName")} />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
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
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
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
