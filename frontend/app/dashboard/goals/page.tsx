"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useFinancialGoals, useGoalSummary, useMembers } from "@/hooks/use-queries";
import api from "@/lib/api";
import { QueryError } from "@/components/query-error";
import {
  financialGoalSchema,
  goalContributionSchema,
  type FinancialGoalFormData,
  type GoalContributionFormData,
} from "@/lib/validations";
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
import {
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  HandCoins,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";

export default function GoalsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: goals = [], isLoading: isGoalsLoading, isError: isGoalsError, refetch } = useFinancialGoals();
  const { data: summary, isError: isSummaryError } = useGoalSummary();
  const { data: membersData, isError: isMembersError } = useMembers({ size: 1000 });
  const isError = isGoalsError || isSummaryError || isMembersError;
  const members = membersData?.content ?? [];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const totalGoals = summary?.totalGoals ?? goals.length;
  const activeGoals = summary?.activeGoals ?? goals.filter((g: any) => g.status === "ACTIVE").length;
  const totalTarget = summary?.totalTarget ?? goals.reduce((s: number, g: any) => s + (g.targetAmount || 0), 0);
  const totalRaised = summary?.totalRaised ?? goals.reduce((s: number, g: any) => s + (g.amountRaised || 0), 0);

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await api.delete(`/financial-goals/${pendingDeleteId}`);
      toast.success("Goal deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete goal");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const openContributionDialog = (goal: any) => {
    setSelectedGoal(goal);
    setContributionDialogOpen(true);
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal(goal);
    setAddDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingGoal(null);
    setAddDialogOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isGoalsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financial Goals</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {isError && <QueryError />}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeGoals}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTarget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRaised.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No financial goals found. Click &quot;Add Goal&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal: any) => {
            const percentage =
              goal.targetAmount > 0
                ? Math.min(((goal.amountRaised || 0) / goal.targetAmount) * 100, 100)
                : 0;
            const remaining = (goal.targetAmount || 0) - (goal.amountRaised || 0);

            return (
              <Card key={goal.id} className="glass">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {goal.category && (
                          <StatusBadge status={goal.category} tone="primary" label={goal.category} />
                        )}
                        <StatusBadge status={goal.status || "active"} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">
                        ${(goal.amountRaised || 0).toLocaleString()} raised
                      </span>
                      <span className="text-muted-foreground">
                        of ${goal.targetAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {remaining > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Remaining: </span>
                      <span className="font-medium text-red-600">
                        ${remaining.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {(goal.startDate || goal.endDate) && (
                    <div className="text-sm text-muted-foreground">
                      {goal.startDate || "—"} — {goal.endDate || "Present"}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    {goal.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openContributionDialog(goal)}
                      >
                        <HandCoins className="mr-2 h-4 w-4" />
                        Contribute
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => requestDelete(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddGoalDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        editingGoal={editingGoal}
        onSuccess={() => {
          setAddDialogOpen(false);
          setEditingGoal(null);
          refetch();
        }}
      />

      <RecordContributionDialog
        open={contributionDialogOpen}
        onOpenChange={setContributionDialogOpen}
        goal={selectedGoal}
        members={members}
        onSuccess={() => {
          setContributionDialogOpen(false);
          setSelectedGoal(null);
          refetch();
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete goal?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function AddGoalDialog({
  open,
  onOpenChange,
  editingGoal,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGoal: any | null;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FinancialGoalFormData>({
    resolver: zodResolver(financialGoalSchema),
  });

  useEffect(() => {
    if (editingGoal) {
      reset({
        name: editingGoal.name,
        description: editingGoal.description ?? "",
        targetAmount: editingGoal.targetAmount,
        startDate: editingGoal.startDate,
        endDate: editingGoal.endDate ?? "",
        category: editingGoal.category,
      });
    } else {
      reset({
        name: "",
        description: "",
        targetAmount: 0,
        startDate: "",
        endDate: "",
        category: undefined,
      });
    }
  }, [editingGoal, reset]);

  const onSubmit = async (data: FinancialGoalFormData) => {
    try {
      if (editingGoal) {
        await api.put(`/financial-goals/${editingGoal.id}`, data);
        toast.success("Goal updated");
      } else {
        await api.post("/financial-goals", data);
        toast.success("Goal created");
      }
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save goal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingGoal ? "Edit Goal" : "Add Goal"}</DialogTitle>
          <DialogDescription>
            {editingGoal
              ? "Update goal details below."
              : "Fill in the details to create a new financial goal."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Goal Name *</Label>
            <Input placeholder="e.g. Building Renovation" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Optional description" {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label>Target Amount ($) *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("targetAmount", { valueAsNumber: true })}
            />
            {errors.targetAmount && (
              <p className="text-sm text-red-500">{errors.targetAmount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              onValueChange={(v) =>
                setValue("category", v as any, { shouldValidate: true })
              }
              defaultValue={editingGoal?.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUILDING">Building</SelectItem>
                <SelectItem value="VEHICLE">Vehicle</SelectItem>
                <SelectItem value="MISSION">Mission</SelectItem>
                <SelectItem value="WELFARE">Welfare</SelectItem>
                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingGoal
                  ? "Update Goal"
                  : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordContributionDialog({
  open,
  onOpenChange,
  goal,
  members,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: any | null;
  members: any[];
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalContributionFormData>({
    resolver: zodResolver(goalContributionSchema),
    defaultValues: {
      goalId: goal?.id,
      contributionDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (goal) {
      reset({
        goalId: goal.id,
        memberId: undefined,
        amount: 0,
        contributionDate: new Date().toISOString().split("T")[0],
        paymentMethod: undefined,
        referenceNumber: "",
        notes: "",
      });
    }
  }, [goal, reset]);

  const onSubmit = async (data: GoalContributionFormData) => {
    try {
      await api.post("/financial-goals/contributions", data);
      toast.success("Contribution recorded");
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record contribution");
    }
  };

  if (!goal) return null;

  const percentage =
    goal.targetAmount > 0
      ? Math.min(((goal.amountRaised || 0) / goal.targetAmount) * 100, 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Contribution</DialogTitle>
          <DialogDescription>Record a contribution toward this goal.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Goal</span>
            <span className="font-medium">{goal.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">${goal.targetAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-medium text-green-600">
              ${(goal.amountRaised || 0).toLocaleString()} ({percentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label>Contribution Date *</Label>
            <Input type="date" {...register("contributionDate")} />
            {errors.contributionDate && (
              <p className="text-sm text-red-500">{errors.contributionDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Member (Optional)</Label>
            <Select
              onValueChange={(v) =>
                setValue("memberId", parseInt(v), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              onValueChange={(v) =>
                setValue("paymentMethod", v as any, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="MOBILE">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input placeholder="Optional reference" {...register("referenceNumber")} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Optional notes" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Record Contribution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
