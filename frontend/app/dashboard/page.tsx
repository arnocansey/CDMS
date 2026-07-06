"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats, useFinancialData, useFinancialHealth, useFundSummary, useFinancialGoals } from "@/hooks/use-queries";
import { fetchFinancialData } from "@/lib/api-functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Calendar, DollarSign, TrendingUp, TrendingDown,
  Wallet, UserCheck, UserPlus, Activity, ArrowUpRight, ArrowDownRight,
  Target, BarChart3, Heart, Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardStats();
  const { data: financialData } = useFinancialData();
  const { data: healthData } = useFinancialHealth();
  const { data: fundSummary } = useFundSummary();
  const { data: goalsData } = useFinancialGoals();
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (financialData) {
      const allContributions = [
        ...(financialData.donations || []).map((d: any) => ({
          ...d,
          type: "Donation",
          date: d.donationDate,
          amount: d.amount,
        })),
        ...(financialData.tithes || []).map((t: any) => ({
          ...t,
          type: "Tithe",
          date: t.titheDate,
          amount: t.amount,
        })),
        ...(financialData.offerings || []).map((o: any) => ({
          ...o,
          type: "Offering",
          date: o.serviceDate,
          amount: o.amount,
        })),
      ]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentContributions(allContributions);

      const sortedExpenses = (financialData.expenses || [])
        .sort((a: any, b: any) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
        .slice(0, 5);
      setRecentExpenses(sortedExpenses);
    }
  }, [financialData]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isDashboardLoading) {
    return (
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-5/6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const donations = financialData?.donations ?? [];
  const tithes = financialData?.tithes ?? [];
  const offerings = financialData?.offerings ?? [];
  const expenses = financialData?.expenses ?? [];

  const totalIncome =
    donations.reduce((s: number, d: any) => s + (d.amount || 0), 0) +
    tithes.reduce((s: number, t: any) => s + (t.amount || 0), 0) +
    offerings.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  const expenseByCategory = expenses.reduce((acc: any, e: any) => {
    const cat = e.category || "OTHER";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {});
  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }));

  const incomeByType = [
    { name: "Donations", value: donations.reduce((s: number, d: any) => s + (d.amount || 0), 0) },
    { name: "Tithes", value: tithes.reduce((s: number, t: any) => s + (t.amount || 0), 0) },
    { name: "Offerings", value: offerings.reduce((s: number, o: any) => s + (o.amount || 0), 0) },
  ].filter((i) => i.value > 0);

  const funds = (fundSummary as any)?.funds || fundSummary || [];
  const fundTotalBalance = Array.isArray(funds)
    ? funds.reduce((s: number, f: any) => s + (f.currentBalance || f.current_balance || 0), 0)
    : 0;
  const fundCount = Array.isArray(funds) ? funds.length : 0;
  const fundBarData = Array.isArray(funds)
    ? funds.map((f: any) => ({
        name: (f.name || "").substring(0, 12),
        balance: f.currentBalance || f.current_balance || 0,
      }))
    : [];

  const activeGoals = Array.isArray(goalsData) ? goalsData.filter((g: any) => g.status === "ACTIVE") : [];

  const healthScore = (healthData as any)?.healthScore ?? (healthData as any)?.health_score ?? null;

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <UserCheck className="mr-1 inline h-3 w-3" />
              {dashboardData?.activeMembers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.attendanceToday || 0}</div>
            <p className="text-xs text-muted-foreground">Members present today</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {netBalance >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              )}
              ${Math.abs(netBalance).toLocaleString()} net
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass md:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Finances</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <BarChart data={dashboardData?.monthlyFinancials || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" fill="#3b82f6" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass md:col-span-1">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <LineChart data={dashboardData?.attendanceTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {incomeByType.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomeByType.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {expensePieData.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensePieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fund Balances</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold">${fundTotalBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{fundCount} funds</p>
              </div>
            </div>
            {fundBarData.length > 0 && (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={fundBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length === 0 && (
              <p className="text-sm text-muted-foreground">No active goals</p>
            )}
            {activeGoals.map((goal: any) => {
              const percentage = goal.percentageCompletion ?? goal.percentage_completion ?? 0;
              const raised = goal.amountRaised ?? goal.amount_raised ?? 0;
              const target = goal.targetAmount ?? goal.target_amount ?? 0;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${raised.toLocaleString()} raised of ${target.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {healthScore !== null ? (
              <div className="text-center">
                <div
                  className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${getHealthBg(healthScore)} ${getHealthColor(healthScore)}`}
                >
                  {healthScore}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">out of 100</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentContributions.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +${item.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
              {recentContributions.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent contributions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.description || item.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    -${item.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
              {recentExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent expenses</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
