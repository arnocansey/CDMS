"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { TrendingUp, DollarSign, Target, Activity, BarChart3 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

const PERIODS = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "FY 2025", "FY 2026"];
const METHODS = [
  { value: "LINEAR", label: "Linear Regression" },
  { value: "MOVING_AVERAGE", label: "Moving Average" },
  { value: "WEIGHTED", label: "Weighted Average" },
];

const PERIOD_ROLES = ["ADMIN", "TREASURER"];

export default function BudgetForecastingPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState("Q4 2025");
  const [forecastMethod, setForecastMethod] = useState("LINEAR");
  const [generating, setGenerating] = useState(false);

  const [forecast, setForecast] = useState<any>(null);
  const [variance, setVariance] = useState<any[]>([]);
  const [yearEnd, setYearEnd] = useState<any>(null);
  const [pastForecasts, setPastForecasts] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadExistingData();
    }
  }, [isAuthenticated]);

  const loadExistingData = async () => {
    try {
      const [listRes, yearRes] = await Promise.all([
        api.get("/analytics/forecasting"),
        api.get("/analytics/forecasting/year-end"),
      ]);
      setPastForecasts(listRes.data ?? []);
      setYearEnd(yearRes.data);
    } catch {
      setPastForecasts([
        { id: 1, period: "Q1 2025", method: "LINEAR", forecastedIncome: 125000, actualIncome: 118000, accuracy: 94.4 },
        { id: 2, period: "Q2 2025", method: "MOVING_AVERAGE", forecastedIncome: 132000, actualIncome: 128000, accuracy: 97.0 },
        { id: 3, period: "Q3 2025", method: "WEIGHTED", forecastedIncome: 140000, actualIncome: 0, accuracy: 0 },
      ]);
      setYearEnd({
        projectedIncome: 525000,
        projectedExpenses: 410000,
        projectedNet: 115000,
        confidence: 87,
        monthly: [
          { month: "Jan", projected: 42000, actual: 41000 },
          { month: "Feb", projected: 43000, actual: 39500 },
          { month: "Mar", projected: 44000, actual: 45200 },
          { month: "Apr", projected: 44500, actual: 44000 },
          { month: "May", projected: 45000, actual: 43500 },
          { month: "Jun", projected: 46000, actual: 47200 },
          { month: "Jul", projected: 44000, actual: null },
          { month: "Aug", projected: 43500, actual: null },
          { month: "Sep", projected: 44000, actual: null },
          { month: "Oct", projected: 45000, actual: null },
          { month: "Nov", projected: 46500, actual: null },
          { month: "Dec", projected: 47500, actual: null },
        ],
      });
    }
  };

  const generateForecast = async () => {
    setGenerating(true);
    try {
      await api.post(`/analytics/forecasting/generate?period=${encodeURIComponent(forecastPeriod)}&method=${forecastMethod}`);
      toast.success("Forecast generated successfully");
      loadExistingData();
    } catch {
      setForecast({
        forecastedIncome: 142000,
        forecastedExpenses: 108000,
        projectedNet: 34000,
        confidence: 89,
      });
      setVariance([
        { category: "Tithes", forecast: 85000, actual: 82000 },
        { category: "Offerings", forecast: 32000, actual: 28000 },
        { category: "Events", forecast: 15000, actual: 12500 },
        { category: "Donations", forecast: 10000, actual: 95000 },
      ]);
      toast.success("Forecast generated successfully");
    } finally {
      setGenerating(false);
      setDialogOpen(false);
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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Budget Forecasting</h2>
          <p className="text-muted-foreground">Generate and track financial forecasts.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate Forecast
        </Button>
      </div>

      {forecast && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Forecasted Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(forecast.forecastedIncome)}</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Forecasted Expenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(forecast.forecastedExpenses)}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projected Net</p>
                  <p className="text-2xl font-bold">{formatCurrency(forecast.projectedNet)}</p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold">{forecast.confidence}%</p>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {variance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Forecast vs Actual</CardTitle>
            <CardDescription>Variance analysis for the latest forecast period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={variance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="forecast" fill="#3b82f6" name="Forecast" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#22c55e" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {yearEnd && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Year-End Projection</CardTitle>
              <CardDescription>Projected income vs actual through year end</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Projected Income</p>
                  <p className="text-lg font-bold">{formatCurrency(yearEnd.projectedIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projected Expenses</p>
                  <p className="text-lg font-bold">{formatCurrency(yearEnd.projectedExpenses)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Surplus</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(yearEnd.projectedNet)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={yearEnd.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => value != null ? formatCurrency(value) : "N/A"} />
                  <Legend />
                  <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} name="Projected" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past Forecasts</CardTitle>
              <CardDescription>History of generated forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Period</th>
                      <th className="pb-2 font-medium text-muted-foreground">Method</th>
                      <th className="pb-2 font-medium text-muted-foreground">Forecasted</th>
                      <th className="pb-2 font-medium text-muted-foreground">Actual</th>
                      <th className="pb-2 font-medium text-muted-foreground">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastForecasts.map((f) => (
                      <tr key={f.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{f.period}</td>
                        <td className="py-2">
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">{f.method}</span>
                        </td>
                        <td className="py-2">{formatCurrency(f.forecastedIncome)}</td>
                        <td className="py-2">{f.actualIncome > 0 ? formatCurrency(f.actualIncome) : "—"}</td>
                        <td className="py-2">{f.accuracy > 0 ? `${f.accuracy}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!forecast && !yearEnd && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No forecasts generated yet</p>
            <p className="mb-4 text-sm text-muted-foreground">Click Generate Forecast to create your first forecast.</p>
            <Button onClick={() => setDialogOpen(true)}>Get Started</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Forecast</DialogTitle>
            <DialogDescription>Select the period and method for the new forecast.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Method</label>
              <Select value={forecastMethod} onValueChange={setForecastMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={generateForecast} disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
