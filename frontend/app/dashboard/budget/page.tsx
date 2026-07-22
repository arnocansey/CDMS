"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useBudgets, useBudgetSummary } from "@/hooks/use-queries";
import api from "@/lib/api";
import { budgetSchema, type BudgetFormData } from "@/lib/validations";
import { QueryError } from "@/components/query-error";
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
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

const PERIODS = ["2024", "2025", "2026"];
const CATEGORIES = [
  "UTILITIES", "SALARIES", "EVANGELISM", "MAINTENANCE",
  "EQUIPMENT", "TRANSPORTATION", "WELFARE", "MISCELLANEOUS",
];

export default function BudgetPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("2026");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: budgets = [], isLoading: isBudgetsLoading, isError: isBudgetsError } = useBudgets(selectedPeriod);
  const { data: summary = {}, isError: isSummaryError } = useBudgetSummary(selectedPeriod);
  const isError = isBudgetsError || isSummaryError;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const totalBudget = Number(summary.totalBudget || 0);
  const totalSpent = Number(summary.totalSpent || 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const chartData = budgets.map((b: any) => ({
    name: b.name,
    budget: Number(b.amount || 0),
    spent: Number(b.spent || 0),
  }));

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await api.delete(`/budgets/${pendingDeleteId}`);
      toast.success("Budget deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete budget");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBudget(null);
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
        <h2 className="text-3xl font-bold tracking-tight">Budget Management</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>

      {isError && <QueryError />}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalRemaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilization}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Budget vs Actual Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Category</th>
                  <th className="p-4 text-left font-medium">Budget</th>
                  <th className="p-4 text-left font-medium">Spent</th>
                  <th className="p-4 text-left font-medium">Remaining</th>
                  <th className="p-4 text-left font-medium">Progress</th>
                  <th className="p-4 text-left font-medium">Period</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b: any) => {
                  const remaining = Number(b.amount || 0) - Number(b.spent || 0);
                  const pct = Number(b.amount) > 0 ? Math.round((Number(b.spent) / Number(b.amount)) * 100) : 0;
                  return (
                    <tr key={b.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{b.name}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {b.category}
                        </span>
                      </td>
                      <td className="p-4">${Number(b.amount).toLocaleString()}</td>
                      <td className="p-4">${Number(b.spent).toLocaleString()}</td>
                      <td className={`p-4 ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${remaining.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${pct > 100 ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{b.period || "—"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(b)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => requestDelete(b.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {budgets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No budgets found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        editingBudget={editingBudget}
        period={selectedPeriod}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete budget?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function BudgetDialog({
  open,
  onOpenChange,
  editingBudget,
  period,
}: {
  open: boolean;
  onOpenChange: () => void;
  editingBudget: any;
  period: string;
}) {
  const isEdit = !!editingBudget;
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: editingBudget
      ? {
          name: editingBudget.name,
          category: editingBudget.category,
          amount: Number(editingBudget.amount),
          period: editingBudget.period || period,
          startDate: editingBudget.startDate || "",
          endDate: editingBudget.endDate || "",
          notes: editingBudget.notes || "",
        }
      : { period, amount: 0 },
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    if (isEdit && editingBudget) {
      reset({
        name: editingBudget.name,
        category: editingBudget.category,
        amount: Number(editingBudget.amount),
        period: editingBudget.period || period,
        startDate: editingBudget.startDate || "",
        endDate: editingBudget.endDate || "",
        notes: editingBudget.notes || "",
      });
    } else {
      reset({ period, amount: 0 });
    }
  }, [editingBudget, isEdit, period, reset]);

  const onSubmit = async (data: BudgetFormData) => {
    try {
      const payload = {
        ...data,
        spent: editingBudget?.spent || 0,
      };
      if (isEdit) {
        await api.put(`/budgets/${editingBudget.id}`, payload);
        toast.success("Budget updated");
      } else {
        await api.post("/budgets", payload);
        toast.success("Budget created");
      }
      reset();
      onOpenChange();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} budget`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Budget" : "Add Budget"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update budget details." : "Create a new budget line item."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Budget Name</Label>
            <Input placeholder="e.g. Youth Ministry Q1" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select defaultValue={selectedCategory} onValueChange={(v) => setValue("category", v as any, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Period</Label>
            <Input placeholder="e.g. 2026" {...register("period")} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Optional notes" {...register("notes")} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Budget" : "Create Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
