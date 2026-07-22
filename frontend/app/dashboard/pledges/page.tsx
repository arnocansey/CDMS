"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { usePledges, usePledgeSummary, useMembers } from "@/hooks/use-queries";
import api from "@/lib/api";
import { QueryError } from "@/components/query-error";
import {
  pledgeSchema,
  pledgePaymentSchema,
  type PledgeFormData,
  type PledgePaymentFormData,
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
  DollarSign,
  TrendingDown,
  Wallet,
  Plus,
  Edit,
  Trash2,
  HandCoins,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";

export default function PledgesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPledge, setEditingPledge] = useState<any>(null);
  const [selectedPledge, setSelectedPledge] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: pledges = [], isLoading: isPledgesLoading, isError: isPledgesError, refetch } = usePledges();
  const { data: summary, isError: isSummaryError } = usePledgeSummary();
  const { data: membersData, isError: isMembersError } = useMembers({ size: 1000 });
  const isError = isPledgesError || isSummaryError || isMembersError;
  const members = membersData?.content ?? [];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const totalPledged = summary?.totalPledged ?? pledges.reduce((s: number, p: any) => s + (p.pledgeAmount || 0), 0);
  const totalPaid = summary?.totalPaid ?? pledges.reduce((s: number, p: any) => s + (p.amountPaid || 0), 0);
  const outstanding = summary?.outstanding ?? pledges.reduce((s: number, p: any) => s + (p.outstanding || 0), 0);
  const activeCount = summary?.activeCount ?? pledges.filter((p: any) => p.status === "ACTIVE").length;

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await api.delete(`/pledges/${pendingDeleteId}`);
      toast.success("Pledge deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete pledge");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const openPaymentDialog = (pledge: any) => {
    setSelectedPledge(pledge);
    setPaymentDialogOpen(true);
  };

  const openEditDialog = (pledge: any) => {
    setEditingPledge(pledge);
    setAddDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPledge(null);
    setAddDialogOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPledgesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pledges</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pledge
        </Button>
      </div>

      {isError && <QueryError />}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPledged.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${outstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pledges</CardTitle>
            <HandCoins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pledges ({pledges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Member</th>
                  <th className="p-4 text-left font-medium">Type</th>
                  <th className="p-4 text-left font-medium">Amount</th>
                  <th className="p-4 text-left font-medium">Paid</th>
                  <th className="p-4 text-left font-medium">Outstanding</th>
                  <th className="p-4 text-left font-medium">Due Date</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Frequency</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pledges.map((pledge: any) => (
                  <tr key={pledge.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{pledge.memberName || "—"}</td>
                    <td className="p-4">{pledge.pledgeType}</td>
                    <td className="p-4">${pledge.pledgeAmount?.toLocaleString()}</td>
                    <td className="p-4 text-green-600">${(pledge.amountPaid || 0).toLocaleString()}</td>
                    <td className="p-4 text-red-600">${(pledge.outstanding || 0).toLocaleString()}</td>
                    <td className="p-4">{pledge.dueDate || "—"}</td>
                    <td className="p-4">
                      <StatusBadge status={pledge.status || "active"} />
                    </td>
                    <td className="p-4">{pledge.frequency || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {pledge.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPaymentDialog(pledge)}
                          >
                            <HandCoins className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(pledge)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => requestDelete(pledge.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pledges.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No pledges found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddPledgeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        editingPledge={editingPledge}
        members={members}
        onSuccess={() => {
          setAddDialogOpen(false);
          setEditingPledge(null);
          refetch();
        }}
      />

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        pledge={selectedPledge}
        onSuccess={() => {
          setPaymentDialogOpen(false);
          setSelectedPledge(null);
          refetch();
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete pledge?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function AddPledgeDialog({
  open,
  onOpenChange,
  editingPledge,
  members,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPledge: any | null;
  members: any[];
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PledgeFormData>({
    resolver: zodResolver(pledgeSchema),
  });

  useEffect(() => {
    if (editingPledge) {
      reset({
        memberId: editingPledge.memberId,
        pledgeType: editingPledge.pledgeType,
        description: editingPledge.description ?? "",
        pledgeAmount: editingPledge.pledgeAmount,
        dueDate: editingPledge.dueDate,
        frequency: editingPledge.frequency,
      });
    } else {
      reset({
        memberId: undefined,
        pledgeType: "",
        description: "",
        pledgeAmount: 0,
        dueDate: "",
        frequency: undefined,
      });
    }
  }, [editingPledge, reset]);

  const onSubmit = async (data: PledgeFormData) => {
    try {
      if (editingPledge) {
        await api.put(`/pledges/${editingPledge.id}`, data);
        toast.success("Pledge updated");
      } else {
        await api.post("/pledges", data);
        toast.success("Pledge created");
      }
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save pledge");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPledge ? "Edit Pledge" : "Add Pledge"}</DialogTitle>
          <DialogDescription>
            {editingPledge
              ? "Update pledge details below."
              : "Fill in the details to create a new pledge."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Member *</Label>
            <Select
              onValueChange={(v) =>
                setValue("memberId", parseInt(v), { shouldValidate: true })
              }
              defaultValue={editingPledge?.memberId?.toString()}
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
            {errors.memberId && (
              <p className="text-sm text-red-500">{errors.memberId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pledge Type *</Label>
            <Input
              placeholder="e.g. Building Fund, Missions"
              {...register("pledgeType")}
            />
            {errors.pledgeType && (
              <p className="text-sm text-red-500">{errors.pledgeType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Optional description" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("pledgeAmount", { valueAsNumber: true })}
              />
              {errors.pledgeAmount && (
                <p className="text-sm text-red-500">{errors.pledgeAmount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              onValueChange={(v) =>
                setValue("frequency", v as any, { shouldValidate: true })
              }
              defaultValue={editingPledge?.frequency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONE_TIME">One Time</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
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
                : editingPledge
                  ? "Update Pledge"
                  : "Create Pledge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({
  open,
  onOpenChange,
  pledge,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pledge: any | null;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PledgePaymentFormData>({
    resolver: zodResolver(pledgePaymentSchema),
    defaultValues: {
      pledgeId: pledge?.id,
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (pledge) {
      reset({
        pledgeId: pledge.id,
        amount: 0,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: undefined,
        referenceNumber: "",
        notes: "",
      });
    }
  }, [pledge, reset]);

  const onSubmit = async (data: PledgePaymentFormData) => {
    try {
      await api.post("/pledges/payments", data);
      toast.success("Payment recorded");
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  };

  if (!pledge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Record a payment for this pledge.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member</span>
            <span className="font-medium">{pledge.memberName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{pledge.pledgeType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium">${pledge.pledgeAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Already Paid</span>
            <span className="font-medium text-green-600">
              ${(pledge.amountPaid || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Outstanding</span>
            <span className="font-medium text-red-600">
              ${(pledge.outstanding || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Amount ($) *</Label>
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
            <Label>Payment Date *</Label>
            <Input type="date" {...register("paymentDate")} />
            {errors.paymentDate && (
              <p className="text-sm text-red-500">{errors.paymentDate.message}</p>
            )}
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
              {isSubmitting ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
