"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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
import { Plus, Repeat, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";

export default function RecurringDonationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    category: "",
    frequency: "",
    paymentMethod: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = async () => {
    try {
      const [donationsRes, membersRes] = await Promise.all([
        api.get("/recurring-donations"),
        api.get("/members", { params: { size: 1000 } }),
      ]);
      setDonations(donationsRes.data?.content ?? donationsRes.data ?? []);
      setMembers(membersRes.data?.content ?? membersRes.data ?? []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/recurring-donations", {
        memberId: parseInt(formData.memberId),
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        paymentMethod: formData.paymentMethod,
      });
      toast.success("Recurring donation created");
      setDialogOpen(false);
      setFormData({ memberId: "", amount: "", category: "", frequency: "", paymentMethod: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create recurring donation");
    } finally {
      setSubmitting(false);
    }
  };

  const requestCancel = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (pendingDeleteId == null) return;
    try {
      await api.put(`/recurring-donations/${pendingDeleteId}/cancel`);
      toast.success("Recurring donation cancelled");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
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
        <h2 className="text-3xl font-bold tracking-tight">Recurring Donations</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recurring
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Recurring Donations ({donations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Member</th>
                    <th className="p-4 text-left font-medium">Amount</th>
                    <th className="p-4 text-left font-medium">Category</th>
                    <th className="p-4 text-left font-medium">Frequency</th>
                    <th className="p-4 text-left font-medium">Next Due</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d: any) => (
                    <tr key={d.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">
                        {d.memberName
                          || (d.member ? `${d.member.firstName || ""} ${d.member.lastName || ""}`.trim() : null)
                          || "—"}
                      </td>
                      <td className="p-4">${d.amount?.toLocaleString()}</td>
                      <td className="p-4">{d.category}</td>
                      <td className="p-4">{d.frequency}</td>
                      <td className="p-4">{d.nextDueDate || "—"}</td>
                      <td className="p-4">
                        <StatusBadge status={d.active === true || d.status === "ACTIVE" ? "ACTIVE" : (d.status || "CANCELLED")} />
                      </td>
                      <td className="p-4">
                        {(d.active === true || d.status === "ACTIVE") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => requestCancel(d.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No recurring donations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Recurring Donation</DialogTitle>
            <DialogDescription>Set up a new recurring donation or tithe.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <Select
                value={formData.memberId}
                onValueChange={(v) => setFormData({ ...formData, memberId: v })}
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
              <Label>Amount ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TITHE">Tithe</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="BUILDING_FUND">Building Fund</SelectItem>
                  <SelectItem value="WELFARE">Welfare</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                  <SelectItem value="MISSIONS">Missions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(v) => setFormData({ ...formData, frequency: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
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
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Recurring Donation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel recurring donation?"
        description="This will stop future charges for this subscription."
        confirmLabel="Cancel subscription"
        onConfirm={confirmCancel}
      />
    </div>
  );
}
