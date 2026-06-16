"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFinancialHealth, useDecisionSupport } from "@/hooks/use-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  RefreshCw,
  Wallet,
  Target,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

function getScoreStatus(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export default function HealthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useFinancialHealth();
  const {
    data: decisionData,
    isLoading: isDecisionLoading,
    refetch: refetchDecision,
  } = useDecisionSupport();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleRefresh = () => {
    refetchHealth();
    refetchDecision();
    toast.success("Refreshing analysis...");
  };

  const score = healthData?.score ?? 0;
  const recommendations = healthData?.recommendations ?? [];

  const factors = [
    {
      label: "Income Growth Rate",
      value: healthData?.incomeGrowthRate ?? 0,
      icon: TrendingUp,
      suffix: "%",
      positive: (healthData?.incomeGrowthRate ?? 0) >= 0,
    },
    {
      label: "Expense Control Rate",
      value: healthData?.expenseControlRate ?? 0,
      icon: TrendingDown,
      suffix: "%",
      positive: (healthData?.expenseControlRate ?? 0) >= 0,
    },
    {
      label: "Cash Flow Stability",
      value: healthData?.cashFlowStability ?? 0,
      icon: Activity,
      suffix: "",
      positive: (healthData?.cashFlowStability ?? 0) >= 50,
    },
    {
      label: "Budget Efficiency",
      value: healthData?.budgetEfficiency ?? 0,
      icon: Target,
      suffix: "%",
      positive: (healthData?.budgetEfficiency ?? 0) >= 50,
    },
  ];

  const hasData = healthData || decisionData;
  const isDataLoading = isHealthLoading || isDecisionLoading;

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isDataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Financial Health</h2>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Analyzing financial health...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Financial Health</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Analysis
          </Button>
        </div>
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Health Data Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Financial health analysis requires transaction data. Start by recording
              financial transactions and budgets to see your health analysis here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financial Health</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Analysis
        </Button>
      </div>

      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${(score / 100) * 314.16} 314.16`}
                  strokeLinecap="round"
                  className={getScoreColor(score)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                <span className="text-sm text-muted-foreground">out of 100</span>
              </div>
            </div>
            <h3 className={`text-2xl font-semibold ${getScoreColor(score)}`}>
              {getScoreStatus(score)}
            </h3>
            <p className="text-muted-foreground mt-1">Overall Financial Health Score</p>

            {recommendations.length > 0 && (
              <div className="mt-6 w-full max-w-lg">
                <h4 className="font-medium mb-3 text-center">Recommendations</h4>
                <ul className="space-y-2">
                  {recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <Card key={factor.label} className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{factor.label}</CardTitle>
                <Icon
                  className={`h-4 w-4 ${
                    factor.positive ? "text-green-500" : "text-red-500"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-2xl font-bold ${
                      factor.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {typeof factor.value === "number" ? factor.value.toFixed(1) : factor.value}
                    {factor.suffix}
                  </div>
                  {factor.label === "Income Growth Rate" && (
                    factor.positive ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {decisionData && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Decision Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Highest Income Source
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {decisionData.highestIncomeSource?.name || "—"}
                  </p>
                  <p className="text-sm text-green-600">
                    ${(decisionData.highestIncomeSource?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Highest Expense Category
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {decisionData.highestExpenseCategory?.name || "—"}
                  </p>
                  <p className="text-sm text-red-600">
                    ${(decisionData.highestExpenseCategory?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Wallet className="h-4 w-4 text-blue-500" />
                  Best Performing Fund
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">
                    {decisionData.bestPerformingFund?.name || "—"}
                  </p>
                  <p className="text-sm text-blue-600">
                    ${(decisionData.bestPerformingFund?.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Underfunded Projects
                </div>
                <div className="rounded-lg border p-3">
                  {(decisionData.underfundedProjects ?? []).length > 0 ? (
                    <ul className="space-y-1">
                      {(decisionData.underfundedProjects ?? []).map(
                        (p: any, i: number) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium">{p.name}</span>
                            {p.shortfall != null && (
                              <span className="ml-2 text-red-600">
                                (${p.shortfall.toLocaleString()} short)
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None identified</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Budget Risks
                </div>
                <div className="rounded-lg border p-3">
                  {(decisionData.budgetRisks ?? []).length > 0 ? (
                    <ul className="space-y-1">
                      {(decisionData.budgetRisks ?? []).map((r: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium">{r.name || r.category}</span>
                          {r.amount != null && (
                            <span className="ml-2 text-orange-600">
                              (${r.amount.toLocaleString()})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None identified</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Cash Flow Warnings
                </div>
                <div className="rounded-lg border p-3">
                  {(decisionData.cashFlowWarnings ?? []).length > 0 ? (
                    <ul className="space-y-1">
                      {(decisionData.cashFlowWarnings ?? []).map((w: any, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium">{w.message || w.description}</span>
                          {w.severity && (
                            <span className="ml-2 text-red-600">({w.severity})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">None identified</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
