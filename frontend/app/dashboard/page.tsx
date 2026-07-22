"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  useDashboardStats,
  useFinancialData,
  useFinancialHealth,
  useFundSummary,
  useFinancialGoals,
} from "@/hooks/use-queries";
import { QueryError } from "@/components/query-error";
import { PageSpinner } from "@/components/page-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingDown,
  Wallet,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Heart,
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

const PRIMARY = "hsl(var(--primary))";
const PIE_COLORS = [
  "hsl(var(--primary))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#64748b",
];

type MoneyRow = {
  type?: string;
  date?: string;
  amount?: number;
  description?: string;
  category?: string;
  expenseDate?: string;
  donationDate?: string;
  titheDate?: string;
  serviceDate?: string;
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useDashboardStats();
  const { data: financialData, isError: isFinancialError } = useFinancialData({
    size: 1000,
  });
  const { data: healthData, isError: isHealthError } = useFinancialHealth();
  const { data: fundSummary, isError: isFundError } = useFundSummary();
  const { data: goalsData, isError: isGoalsError } = useFinancialGoals();
  const isError =
    isDashboardError ||
    isFinancialError ||
    isHealthError ||
    isFundError ||
    isGoalsError;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const donations = financialData?.donations ?? [];
  const tithes = financialData?.tithes ?? [];
  const offerings = financialData?.offerings ?? [];
  const expenses = financialData?.expenses ?? [];

  const totalIncome = useMemo(
    () =>
      [...donations, ...tithes, ...offerings].reduce(
        (s: number, row: MoneyRow) => s + (row.amount || 0),
        0
      ),
    [donations, tithes, offerings]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s: number, e: MoneyRow) => s + (e.amount || 0), 0),
    [expenses]
  );
  const netBalance = totalIncome - totalExpenses;

  const recentContributions = useMemo(() => {
    const rows: MoneyRow[] = [
      ...donations.map((d: MoneyRow) => ({
        ...d,
        type: "Donation",
        date: d.donationDate,
      })),
      ...tithes.map((t: MoneyRow) => ({
        ...t,
        type: "Tithe",
        date: t.titheDate,
      })),
      ...offerings.map((o: MoneyRow) => ({
        ...o,
        type: "Offering",
        date: o.serviceDate,
      })),
    ];
    return rows
      .sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      )
      .slice(0, 5);
  }, [donations, tithes, offerings]);

  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort(
          (a: MoneyRow, b: MoneyRow) =>
            new Date(b.expenseDate || 0).getTime() -
            new Date(a.expenseDate || 0).getTime()
        )
        .slice(0, 5),
    [expenses]
  );

  const expensePieData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    for (const e of expenses as MoneyRow[]) {
      const cat = e.category || "OTHER";
      byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
    }
    return Object.entries(byCategory).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
    }));
  }, [expenses]);

  const incomeByType = useMemo(
    () =>
      [
        {
          name: "Donations",
          value: donations.reduce(
            (s: number, d: MoneyRow) => s + (d.amount || 0),
            0
          ),
        },
        {
          name: "Tithes",
          value: tithes.reduce(
            (s: number, t: MoneyRow) => s + (t.amount || 0),
            0
          ),
        },
        {
          name: "Offerings",
          value: offerings.reduce(
            (s: number, o: MoneyRow) => s + (o.amount || 0),
            0
          ),
        },
      ].filter((i) => i.value > 0),
    [donations, tithes, offerings]
  );

  const funds = useMemo(() => {
    const summary = fundSummary as { funds?: unknown } | unknown;
    if (Array.isArray(summary)) return summary;
    if (summary && typeof summary === "object" && Array.isArray((summary as { funds?: unknown }).funds)) {
      return (summary as { funds: unknown[] }).funds;
    }
    return [];
  }, [fundSummary]);

  const fundTotalBalance = funds.reduce(
    (s: number, f: { currentBalance?: number; current_balance?: number }) =>
      s + (f.currentBalance || f.current_balance || 0),
    0
  );
  const fundBarData = funds.map(
    (f: {
      name?: string;
      currentBalance?: number;
      current_balance?: number;
    }) => ({
      name: (f.name || "").substring(0, 12),
      balance: f.currentBalance || f.current_balance || 0,
    })
  );

  const activeGoals = Array.isArray(goalsData)
    ? goalsData.filter(
        (g: { status?: string }) => g.status === "ACTIVE"
      )
    : [];

  const healthScore =
    (healthData as { healthScore?: number; health_score?: number } | undefined)
      ?.healthScore ??
    (healthData as { health_score?: number } | undefined)?.health_score ??
    null;

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (isLoading || !isAuthenticated) {
    return <PageSpinner className="min-h-[50vh]" />;
  }

  if (isDashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
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
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const healthTone =
    healthScore == null
      ? "text-muted-foreground"
      : healthScore >= 80
        ? "text-emerald-600 dark:text-emerald-400"
        : healthScore >= 60
          ? "text-amber-600 dark:text-amber-400"
          : "text-destructive";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
      </div>

      {isError && <QueryError />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalMembers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <UserCheck className="mr-1 inline h-3 w-3" />
              {dashboardData?.activeMembers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.attendanceToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">Members present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-muted-foreground">
              {netBalance >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
              )}
              ${Math.abs(netBalance).toLocaleString()} net
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Finances</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <BarChart data={dashboardData?.monthlyFinancials || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" fill={PRIMARY} name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentContributions.slice(0, 3).map((item, i) => (
                <div
                  key={`c-${i}`}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +${item.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
              {recentExpenses.slice(0, 2).map((item: MoneyRow, i: number) => (
                <div
                  key={`e-${i}`}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15">
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {item.description || item.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.expenseDate
                          ? new Date(item.expenseDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-destructive">
                    -${item.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
              {recentContributions.length === 0 && recentExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="funds">Funds & Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={280} minWidth={250}>
                <LineChart data={dashboardData?.attendanceTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={PRIMARY}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-4 md:grid-cols-2">
            {incomeByType.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Income Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
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
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {expensePieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
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
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
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
        </TabsContent>

        <TabsContent value="funds">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fund Balances</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    ${fundTotalBalance.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {funds.length} funds
                  </p>
                </div>
                {fundBarData.length > 0 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={fundBarData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v: number) => `$${v.toLocaleString()}`}
                      />
                      <Bar
                        dataKey="balance"
                        fill={PRIMARY}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                {activeGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active goals</p>
                )}
                {activeGoals.map(
                  (goal: {
                    id: number;
                    name?: string;
                    percentageCompletion?: number;
                    percentage_completion?: number;
                    amountRaised?: number;
                    amount_raised?: number;
                    targetAmount?: number;
                    target_amount?: number;
                  }) => {
                    const percentage =
                      goal.percentageCompletion ??
                      goal.percentage_completion ??
                      0;
                    const raised =
                      goal.amountRaised ?? goal.amount_raised ?? 0;
                    const target =
                      goal.targetAmount ?? goal.target_amount ?? 0;
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{goal.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ${raised.toLocaleString()} raised of $
                          {target.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Financial Health
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                {healthScore !== null ? (
                  <div className="text-center">
                    <div
                      className={`inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted text-3xl font-bold ${healthTone}`}
                    >
                      {healthScore}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      out of 100
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
