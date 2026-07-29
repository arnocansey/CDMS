"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { GitCompare, Building2, Users, DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function ChurchComparisonPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [selectedChurches, setSelectedChurches] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [topGiving, setTopGiving] = useState<any[]>([]);
  const [topGrowth, setTopGrowth] = useState<any[]>([]);
  const [healthScores, setHealthScores] = useState<any[]>([]);
  const [allChurches, setAllChurches] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && user && !user.roles?.includes("PLATFORM_ADMIN")) {
      toast.error("You don't have permission to access this page.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes("PLATFORM_ADMIN")) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, givingRes, growthRes, healthRes] = await Promise.all([
        api.get("/admin/church-comparison/platform-overview"),
        api.get("/admin/church-comparison/top-giving?limit=10"),
        api.get("/admin/church-comparison/health-scores"),
        api.get("/admin/church-comparison/health-scores"),
      ]);
      setOverview(overviewRes.data);
      setTopGiving(Array.isArray(givingRes.data) ? givingRes.data : []);
      setHealthScores(Array.isArray(healthRes.data) ? healthRes.data : []);
      setTopGrowth([]);
    } catch {
      toast.error("Failed to load church comparison data");
      setOverview(null);
      setTopGiving([]);
      setTopGrowth([]);
      setHealthScores([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChurch = (id: number) => {
    setSelectedChurches((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const loadComparison = async () => {
    if (selectedChurches.length < 2) {
      toast.error("Select at least 2 churches to compare");
      return;
    }
    try {
      const res = await api.get(`/admin/church-comparison/compare?ids=${selectedChurches.join(",")}`);
      setComparisonData(res.data ?? []);
    } catch {
      toast.error("Failed to load comparison");
      setComparisonData([]);
    }
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-500/10";
    if (score >= 70) return "text-yellow-600 bg-yellow-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "bg-green-500/10 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    return "bg-red-500/10 text-red-700 border-red-200";
  };

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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Church Comparison</h2>
          <p className="text-muted-foreground">Compare performance across churches on the platform.</p>
        </div>
      </div>

      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Churches</p>
                  <p className="text-2xl font-bold">{overview.totalChurches}</p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{overview.totalMembers.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Giving</p>
                  <p className="text-2xl font-bold">{formatCurrency(overview.totalGiving)}</p>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(overview.totalExpenses)}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Church Selection</CardTitle>
          <CardDescription>Select churches to compare side by side</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {healthScores.map((church) => (
              <button
                key={church.id}
                onClick={() => toggleChurch(church.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedChurches.includes(church.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted"
                }`}
              >
                {church.name}
              </button>
            ))}
          </div>
          <Button onClick={loadComparison} disabled={selectedChurches.length < 2}>
            <GitCompare className="mr-2 h-4 w-4" />
            Compare Selected ({selectedChurches.length})
          </Button>
        </CardContent>
      </Card>

      {comparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>Side-by-side metrics for selected churches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Church</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Members</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Giving</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Expenses</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((c: any) => (
                    <tr key={c.churchId} className="border-b last:border-0">
                      <td className="py-2 font-medium">{c.name}</td>
                      <td className="py-2 text-right">{c.members?.toLocaleString()}</td>
                      <td className="py-2 text-right">{formatCurrency(c.giving ?? 0)}</td>
                      <td className="py-2 text-right">{formatCurrency(c.expenses ?? 0)}</td>
                      <td className="py-2 text-right">{c.retention ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Churches by Giving</CardTitle>
            <CardDescription>Highest total donations on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {topGiving.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No giving data yet.</p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGiving} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="giving" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {topGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Churches by Growth</CardTitle>
            <CardDescription>Fastest growing congregations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGrowth} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 30]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="growth" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Scores</CardTitle>
          <CardDescription>Overall church health based on key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {healthScores.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No health scores available.</p>
          ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthScores.map((church) => (
              <div key={church.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{church.name}</h4>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getScoreBadge(church.score)}`}>
                    {church.score}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Retention</span>
                    <span className={getScoreColor(church.retention)}>{church.retention}%</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="bg-primary transition-all" style={{ width: `${church.retention}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Giving</span>
                    <span className={getScoreColor(church.giving)}>{church.giving}%</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="bg-primary transition-all" style={{ width: `${church.giving}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className={getScoreColor(church.attendance)}>{church.attendance}%</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="bg-primary transition-all" style={{ width: `${church.attendance}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
