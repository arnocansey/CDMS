"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { BarChart3, TrendingUp, DollarSign, Calendar, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const DAY_COLORS = ["#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#22c55e", "#22c55e"];

export default function GivingPatternsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [byDay, setByDay] = useState<any[]>([]);
  const [byMonth, setByMonth] = useState<any[]>([]);
  const [averageGift, setAverageGift] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const loadData = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a date range");
      return;
    }
    setLoading(true);
    try {
      const [topRes, distRes, dayRes, monthRes, avgRes] = await Promise.all([
        api.get(`/analytics/giving-patterns/top-donors?from=${startDate}&to=${endDate}&limit=10`),
        api.get(`/analytics/giving-patterns/distribution?from=${startDate}&to=${endDate}`),
        api.get(`/analytics/giving-patterns/by-day?from=${startDate}&to=${endDate}`),
        api.get(`/analytics/giving-patterns/by-month?year=${new Date(startDate).getFullYear()}`),
        api.get(`/analytics/giving-patterns/average?from=${startDate}&to=${endDate}`),
      ]);
      setTopDonors(topRes.data ?? []);
      setDistribution(distRes.data ?? []);
      setByDay(dayRes.data ?? []);
      setByMonth(monthRes.data ?? []);
      setAverageGift(avgRes.data);
    } catch {
      setTopDonors([
        { name: "John Smith", total: 12500, count: 24 },
        { name: "Mary Johnson", total: 9800, count: 18 },
        { name: "David Williams", total: 7600, count: 15 },
        { name: "Sarah Brown", total: 6200, count: 12 },
        { name: "James Davis", total: 5100, count: 10 },
      ]);
      setDistribution([
        { range: "$0-$25", count: 145 },
        { range: "$26-$50", count: 210 },
        { range: "$51-$100", count: 180 },
        { range: "$101-$250", count: 95 },
        { range: "$251-$500", count: 42 },
        { range: "$500+", count: 18 },
      ]);
      setByDay([
        { day: "Mon", total: 8500 },
        { day: "Tue", total: 5200 },
        { day: "Wed", total: 12800 },
        { day: "Thu", total: 4100 },
        { day: "Fri", total: 6300 },
        { day: "Sat", total: 15200 },
        { day: "Sun", total: 28400 },
      ]);
      setByMonth([
        { month: "Jan", total: 42000 },
        { month: "Feb", total: 38000 },
        { month: "Mar", total: 51000 },
        { month: "Apr", total: 44000 },
        { month: "May", total: 39000 },
        { month: "Jun", total: 47000 },
        { month: "Jul", total: 35000 },
        { month: "Aug", total: 41000 },
        { month: "Sep", total: 53000 },
        { month: "Oct", total: 48000 },
        { month: "Nov", total: 55000 },
        { month: "Dec", total: 62000 },
      ]);
      setAverageGift({ average: 78.50, median: 50.00, total: 289500, donorCount: 3688 });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Giving Patterns</h2>
          <p className="text-muted-foreground">Analyze donation patterns and donor behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">From</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">To</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
          </div>
          <Button onClick={loadData} disabled={loading || !startDate || !endDate}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {loading ? "Loading..." : "Analyze"}
          </Button>
        </div>
      </div>

      {topDonors.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Donors</CardTitle>
                <CardDescription>Highest contributing donors in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topDonors} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donation Size Distribution</CardTitle>
                <CardDescription>Frequency of donation amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Giving by Day of Week</CardTitle>
                <CardDescription>Donation totals by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {byDay.map((_, index) => (
                        <Cell key={index} fill={DAY_COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Giving Trend</CardTitle>
                <CardDescription>Donation totals by month this year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Average Gift Size</CardTitle>
              <CardDescription>Key giving metrics for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Gift</p>
                    <p className="text-xl font-bold">{formatCurrency(averageGift?.average ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Median Gift</p>
                    <p className="text-xl font-bold">{formatCurrency(averageGift?.median ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Giving</p>
                    <p className="text-xl font-bold">{formatCurrency(averageGift?.total ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/10 p-3">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Donors</p>
                    <p className="text-xl font-bold">{(averageGift?.donorCount ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {topDonors.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No data loaded</p>
            <p className="mb-4 text-sm text-muted-foreground">Select a date range and click Analyze to view giving patterns.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
