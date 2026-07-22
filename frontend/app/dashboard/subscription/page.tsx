"use client";

import { useEffect, useState, useCallback, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSpinner } from "@/components/page-spinner";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import { subscriptionApi } from "@/lib/api-functions";
import { Check, Crown, Zap, Building2, Users, CreditCard, ExternalLink, Loader2 } from "lucide-react";

const planIcons: Record<string, ComponentType<{ className?: string }>> = {
  Free: Building2,
  Basic: Users,
  Pro: Zap,
  Enterprise: Crown,
};

const planIconTone: Record<string, string> = {
  Free: "bg-muted text-muted-foreground",
  Basic: "bg-primary/10 text-primary",
  Pro: "bg-primary/15 text-primary",
  Enterprise: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

export default function SubscriptionPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);
  const [paying, setPaying] = useState<number | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setPlansError(false);
    try {
      const [plansRes, subRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrentSubscription().catch(() => null),
      ]);
      const nextPlans = plansRes.data || [];
      setPlans(nextPlans);
      if (nextPlans.length === 0) {
        toast.info("No subscription plans are available right now.");
      }
      if (subRes?.data) {
        setCurrentSubscription(subRes.data.subscription);
        setCurrentPlan(subRes.data.plan);
      }
    } catch {
      setPlansError(true);
      setPlans([]);
      toast.error("Failed to load subscription plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadPaymentHistory = async () => {
    try {
      const res = await subscriptionApi.getHistory();
      const history = res.data || [];
      setPaymentHistory(history);
      setShowHistory(true);
      if (history.length === 0) {
        toast.info("No payment history yet.");
      }
    } catch {
      toast.error("Failed to load payment history. Please try again.");
    }
  };

  const handleUpgrade = async (planId: number, planName: string) => {
    if (planName === "Free") return;

    const email = user?.email?.trim();
    if (!email) {
      toast.error("Your account email is required to start payment. Please re-login and try again.");
      return;
    }

    setPaying(planId);

    try {
      const res = await subscriptionApi.initialize(planId, billingCycle);
      const { authorization_url, reference } = res.data;

      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop?.setup) {
        if (authorization_url) {
          window.location.href = authorization_url;
          return;
        }
        toast.error("Payment checkout is unavailable. Please refresh and try again.");
        setPaying(null);
        return;
      }

      const publicKeyRes = await subscriptionApi.getPublicKey();
      const handler = PaystackPop.setup({
        key: publicKeyRes.data.publicKey,
        email,
        amount: 0,
        ref: reference,
        onClose: () => {
          setPaying(null);
          toast.info("Payment cancelled");
        },
        callback: async (response: { reference: string }) => {
          try {
            await subscriptionApi.verify(response.reference);
            toast.success(`Successfully upgraded to ${planName}!`);
            fetchData();
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment verification failed. Contact support if you were charged.");
          } finally {
            setPaying(null);
          }
        },
      });
      handler.openIframe();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initialize payment. Please try again.");
      setPaying(null);
    }
  };

  if (isLoading || loading) {
    return <PageSpinner className="min-h-[50vh]" label="Loading subscription…" />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Subscription Plans</h2>
          <p className="text-muted-foreground">Choose the plan that fits your church&apos;s needs</p>
        </div>
        <Button variant="outline" onClick={loadPaymentHistory} className="w-fit">
          <CreditCard className="mr-2 h-4 w-4" />
          Payment History
        </Button>
      </div>

      {plansError && (
        <QueryError message="Failed to load subscription plans. Please refresh or try again later." />
      )}

      {currentSubscription && currentPlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {(() => {
                  const Icon = planIcons[currentPlan.name] || Building2;
                  return <Icon className="h-6 w-6 text-primary" />;
                })()}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-lg font-semibold">{currentPlan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentSubscription.billingCycle} billing
                  {currentSubscription.endDate && ` · Renews ${new Date(currentSubscription.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={currentSubscription.status || "active"} />
              <span className="text-sm font-medium">
                {currentPlan.name === "Free" ? "$0" : `$${billingCycle === "ANNUAL" ? currentPlan.priceAnnual : currentPlan.priceMonthly}`}
                <span className="text-muted-foreground">/{billingCycle === "ANNUAL" ? "yr" : "mo"}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "MONTHLY" | "ANNUAL")}>
          <TabsList>
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="ANNUAL">Annual (Save 17%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{tx.paystackReference}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : "Pending"}
                        {tx.paymentMethod && ` · ${tx.paymentMethod}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{tx.currency} {tx.amount?.toFixed(2)}</p>
                      <StatusBadge status={tx.status || "pending"} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowHistory(false)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {!plansError && plans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No subscription plans are available at the moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name] || Building2;
            const isCurrent = currentPlan?.id === plan.id;
            const price = billingCycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly;
            const features = plan.features ? (typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features) : [];
            const isPopular = plan.name === "Basic";

            return (
              <Card key={plan.id} className={`relative flex flex-col ${isPopular ? "border-primary shadow-md" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${
                      planIconTone[plan.name] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${price?.toFixed(2) || "0.00"}</span>
                    <span className="text-sm text-muted-foreground">
                      /{billingCycle === "ANNUAL" ? "yr" : "mo"}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature: string) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.name === "Free" ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Forever
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      className="w-full"
                      disabled={paying !== null}
                      onClick={() => handleUpgrade(plan.id, plan.name)}
                    >
                      {paying === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upgrade Now
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        Payments processed securely via Paystack · All prices in USD
      </div>
    </div>
  );
}
