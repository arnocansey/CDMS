"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useCashFlowStatement, useCashFlowEntries } from "@/hooks/use-queries";
import api from "@/lib/api";
import { cashFlowEntrySchema, type CashFlowEntryFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const INCOME_CATEGORIES = [
  "Tithes", "Offerings", "Donations", "Building Fund", "Special Events",
  "Rental Income", "Investment Returns", "Other Income",
];
const EXPENSE_CATEGORIES = [
  "Utilities", "Salaries", "Evangelism", "Maintenance", "Equipment",
  "Transportation", "Welfare", "Miscellaneous",
];

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getFirstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getFirstOfYear() {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}

function threeMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return toISODate(d);
}

export default function CashFlowPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasDateRange = !!startDate && !!endDate;
  const { data: statement, isLoading: isStatementLoading } = useCashFlowStatement(
    startDate,
    endDate
  );
  const { data: entriesData, isLoading: isEntriesLoading } = useCashFlowEntries(
    hasDateRange ? { startDate, endDate } : undefined
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const entries = Array.isArray(entriesData) ? entriesData : entriesData?.content ?? [];

  const income = statement?.income ?? statement?.totalIncome ?? 0;
  const expenses = statement?.expenses ?? statement?.totalExpenses ?? 0;
  const openingBalance = statement?.openingBalance ?? 0;
  const closingBalance = statement?.closingBalance ?? (openingBalance + income - expenses);
  const incomeBreakdown = statement?.incomeBreakdown ?? [];
  const expenseBreakdown = statement?.expenseBreakdown ?? [];

  const chartData = [
    { name: "Income", amount: income },
    { name: "Expenses", amount: expenses },
  ];

  const applyQuickPeriod = (period: string) => {
    const today = new Date();
    switch (period) {
      case "this-month":
        setStartDate(getFirstOfMonth());
        setEndDate(toISODate(today));
        break;
      case "last-3-months":
        setStartDate(threeMonthsAgo());
        setEndDate(toISODate(today));
        break;
      case "this-year":
        setStartDate(getFirstOfYear());
        setEndDate(toISODate(today));
        break;
    }
  };

  const handleGenerateStatement = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    toast.success("Statement generated");
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Cash Flow</h2>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleGenerateStatement}>
          Generate Statement
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={() => applyQuickPeriod("this-month")}>
            This Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyQuickPeriod("last-3-months")}>
            Last 3 Months
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyQuickPeriod("this-year")}>
            This Year
          </Button>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {hasDateRange && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Cash Flow Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStatementLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Opening Balance</span>
                      <span className="font-medium">${openingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">Total Income</span>
                      <span className="font-medium text-green-600">+${income.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-600 font-medium">Total Expenses</span>
                      <span className="font-medium text-red-600">-${expenses.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">Closing Balance</span>
                      <span className="text-lg font-bold">${closingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {incomeBreakdown.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-2">Income Breakdown</p>
                        {incomeBreakdown.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.category || item.name}</span>
                            <span>${(item.amount || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {expenseBreakdown.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-2">Expense Breakdown</p>
                        {expenseBreakdown.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.category || item.name}</span>
                            <span>${(item.amount || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {hasDateRange && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Category</th>
                  <th className="p-4 text-left font-medium">Description</th>
                  <th className="p-4 text-left font-medium">Amount</th>
                  <th className="p-4 text-left font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{entry.entryDate || entry.date || "—"}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          entry.entryType === "INCOME" || entry.type === "INCOME"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.entryType || entry.type}
                      </span>
                    </td>
                    <td className="p-4">{entry.category || "—"}</td>
                    <td className="p-4 text-muted-foreground">{entry.description || "—"}</td>
                    <td
                      className={`p-4 font-medium ${
                        (entry.entryType === "INCOME" || entry.type === "INCOME")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${(entry.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-muted-foreground">{entry.source || "—"}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {isEntriesLoading ? "Loading entries..." : "No cash flow entries found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddEntryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function AddEntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CashFlowEntryFormData>({
    resolver: zodResolver(cashFlowEntrySchema),
    defaultValues: {
      entryDate: new Date().toISOString().split("T")[0],
      entryType: "INCOME",
      amount: 0,
    },
  });

  const entryType = watch("entryType");

  const categories = entryType === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const onSubmit = async (data: CashFlowEntryFormData) => {
    try {
      await api.post("/cash-flow", data);
      toast.success("Cash flow entry added");
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cash Flow Entry</DialogTitle>
          <DialogDescription>Record a new income or expense entry.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Entry Date *</Label>
            <Input type="date" {...register("entryDate")} />
            {errors.entryDate && (
              <p className="text-sm text-red-500">{errors.entryDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              defaultValue="INCOME"
              onValueChange={(v) =>
                setValue("entryType", v as "INCOME" | "EXPENSE", { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">INCOME</SelectItem>
                <SelectItem value="EXPENSE">EXPENSE</SelectItem>
              </SelectContent>
            </Select>
            {errors.entryType && (
              <p className="text-sm text-red-500">{errors.entryType.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Input
              placeholder="e.g. Tithes, Utilities"
              list="category-list"
              {...register("category")}
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Optional description" {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label>Amount ($) *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Input placeholder="Optional source" {...register("source")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
