"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useForecasts } from "@/hooks/use-queries";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const FORECAST_TYPES = ["MONTHLY", "QUARTERLY", "ANNUAL"];

function getConfidenceColor(level: number): string {
  if (level > 80) return "text-green-600 bg-green-50";
  if (level >= 50) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

export default function ForecastsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { data: forecasts = [], isLoading: isForecastsLoading, refetch } = useForecasts();
  const [forecastType, setForecastType] = useState("MONTHLY");
  const [periods, setPeriods] = useState(12);
  const [generating, setGenerating] = useState(false);
  const [actualsDialogOpen, setActualsDialogOpen] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post("/forecasts/generate", null, {
        params: { type: forecastType, periods },
      });
      toast.success("Forecast generated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate forecast");
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateActuals = (forecast: any) => {
    setSelectedForecast(forecast);
    setActualsDialogOpen(true);
  };

  const totalPredictedIncome = forecasts.reduce(
    (sum: number, f: any) => sum + (f.predictedIncome || 0),
    0
  );
  const totalPredictedExpenses = forecasts.reduce(
    (sum: number, f: any) => sum + (f.predictedExpenses || 0),
    0
  );
  const avgConfidence =
    forecasts.length > 0
      ? forecasts.reduce((sum: number, f: any) => sum + (f.confidenceLevel || 0), 0) /
        forecasts.length
      : 0;

  const chartData = forecasts.map((f: any) => ({
    name: f.forecastName || f.name || "—",
    income: f.predictedIncome || 0,
    expenses: f.predictedExpenses || 0,
    net: (f.predictedIncome || 0) - (f.predictedExpenses || 0),
  }));

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financial Forecasts</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Generate New Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Forecast Type</Label>
              <Select value={forecastType} onValueChange={setForecastType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FORECAST_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Periods</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={periods}
                onChange={(e) => setPeriods(parseInt(e.target.value) || 12)}
                className="w-[140px]"
              />
            </div>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Forecast"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predicted Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalPredictedIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predicted Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalPredictedExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConfidenceColor(avgConfidence).split(" ")[0]}`}>
              {avgConfidence.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Forecast Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Predicted Income"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Predicted Expenses"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Net"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Forecast Name</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Predicted Income</th>
                  <th className="p-4 text-left font-medium">Predicted Expenses</th>
                  <th className="p-4 text-left font-medium">Predicted Net</th>
                  <th className="p-4 text-left font-medium">Confidence</th>
                  <th className="p-4 text-left font-medium">Methodology</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f: any) => {
                  const net = (f.predictedIncome || 0) - (f.predictedExpenses || 0);
                  return (
                    <tr key={f.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{f.forecastName || f.name || "—"}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {f.forecastType || f.type || "—"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{f.forecastDate || f.date || f.createdAt || "—"}</td>
                      <td className="p-4 font-medium text-green-600">
                        ${(f.predictedIncome || 0).toLocaleString()}
                      </td>
                      <td className="p-4 font-medium text-red-600">
                        ${(f.predictedExpenses || 0).toLocaleString()}
                      </td>
                      <td className={`p-4 font-medium ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${net.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getConfidenceColor(
                            f.confidenceLevel || 0
                          )}`}
                        >
                          {(f.confidenceLevel || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{f.methodology || "—"}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateActuals(f)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {forecasts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      {isForecastsLoading
                        ? "Loading forecasts..."
                        : "No forecasts generated yet. Use the form above to generate your first forecast."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UpdateActualsDialog
        open={actualsDialogOpen}
        onOpenChange={setActualsDialogOpen}
        forecast={selectedForecast}
        onSuccess={() => {
          setActualsDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

function UpdateActualsDialog({
  open,
  onOpenChange,
  forecast,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forecast: any;
  onSuccess: () => void;
}) {
  const [actualIncome, setActualIncome] = useState("");
  const [actualExpenses, setActualExpenses] = useState("");
  const [period, setPeriod] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (forecast) {
      setActualIncome("");
      setActualExpenses("");
      setPeriod("");
    }
  }, [forecast]);

  const handleSubmit = async () => {
    if (!forecast) return;
    setSubmitting(true);
    try {
      await api.put(`/forecasts/${forecast.id}/actuals`, {
        actualIncome: actualIncome ? parseFloat(actualIncome) : null,
        actualExpenses: actualExpenses ? parseFloat(actualExpenses) : null,
        period,
      });
      toast.success("Actuals updated successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update actuals");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Actuals</DialogTitle>
          <DialogDescription>
            Enter actual income and expenses for &quot;{forecast?.forecastName || forecast?.name || "—"}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Period</Label>
            <Input
              placeholder="e.g. 2026-01"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Actual Income ($)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={actualIncome}
              onChange={(e) => setActualIncome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Actual Expenses ($)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={actualExpenses}
              onChange={(e) => setActualExpenses(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Update Actuals"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
