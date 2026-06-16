"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFinancialData, useBudgets, useMembers } from "@/hooks/use-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, TrendingUp, TrendingDown, Users, Activity,
  ArrowUpRight, ArrowDownRight, PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState("2026");

  const { data: financialData } = useFinancialData();
  const { data: budgets = [] } = useBudgets(period);
  const { data: membersData } = useMembers({ size: 1000 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const donations = financialData?.donations ?? [];
  const tithes = financialData?.tithes ?? [];
  const offerings = financialData?.offerings ?? [];
  const expenses = financialData?.expenses ?? [];
  const members = membersData?.content ?? [];

  const totalIncome =
    donations.reduce((s: number, d: any) => s + (d.amount || 0), 0) +
    tithes.reduce((s: number, t: any) => s + (t.amount || 0), 0) +
    offerings.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  const avgDonation = donations.length > 0 ? totalIncome / (donations.length + tithes.length + offerings.length) : 0;

  const expenseByCategory = expenses.reduce((acc: any, e: any) => {
    const cat = (e.category || "OTHER").replace("_", " ");
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {});
  const expensePieData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value);

  const incomeByType = [
    { name: "Donations", value: donations.reduce((s: number, d: any) => s + (d.amount || 0), 0) },
    { name: "Tithes", value: tithes.reduce((s: number, t: any) => s + (t.amount || 0), 0) },
    { name: "Offerings", value: offerings.reduce((s: number, o: any) => s + (o.amount || 0), 0) },
  ].filter((i) => i.value > 0);

  const genderDistribution = members.reduce((acc: any, m: any) => {
    const g = m.gender || "UNKNOWN";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const genderPieData = Object.entries(genderDistribution).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value,
  }));

  const monthlyIncome = donations.reduce((acc: any, d: any) => {
    const month = (d.donationDate || "").substring(0, 7);
    if (month) acc[month] = (acc[month] || 0) + (d.amount || 0);
    return acc;
  }, {});
  const monthlyIncomeData = Object.entries(monthlyIncome)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, income: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {netBalance >= 0 ? "+" : ""}${netBalance.toLocaleString()} net
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
            <p className="text-xs text-muted-foreground">{expensePieData.length} categories</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(avgDonation).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {donations.length + tithes.length + offerings.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {members.filter((m: any) => m.active !== false).length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {monthlyIncomeData.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Income Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="income" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {incomeByType.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Income by Source</CardTitle>
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
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
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

      <div className="grid gap-4 md:grid-cols-2">
        {expensePieData.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensePieData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {budgets.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgets.map((b: any) => ({
                  name: b.name,
                  budget: Number(b.amount),
                  spent: Number(b.spent),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {genderPieData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Membership Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {genderPieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <h4 className="font-medium">Gender Distribution</h4>
                {genderPieData.map((g: any) => (
                  <div key={g.name} className="flex items-center justify-between">
                    <span className="text-sm">{g.name}</span>
                    <span className="text-sm font-medium">{g.value} ({Math.round((g.value / members.length) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
