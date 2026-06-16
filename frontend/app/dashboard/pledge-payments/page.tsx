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
import { Plus, HandCoins } from "lucide-react";
import { toast } from "sonner";

export default function PledgePaymentsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [pledges, setPledges] = useState<any[]>([]);
  const [selectedPledgeId, setSelectedPledgeId] = useState<string>("");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    reference: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchPledges = async () => {
    try {
      const res = await api.get("/pledges", { params: { size: 1000 } });
      setPledges(res.data?.content ?? res.data ?? []);
    } catch (error: any) {
      toast.error("Failed to load pledges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPledges();
  }, [isAuthenticated]);

  const fetchPayments = async (pledgeId: string) => {
    if (!pledgeId) {
      setPayments([]);
      return;
    }
    setPaymentsLoading(true);
    try {
      const res = await api.get(`/pledge-payments/by-pledge/${pledgeId}`);
      setPayments(res.data?.content ?? res.data ?? []);
    } catch (error: any) {
      toast.error("Failed to load payment history");
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPledgeId) fetchPayments(selectedPledgeId);
  }, [selectedPledgeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPledgeId) {
      toast.error("Please select a pledge first");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/pledge-payments", {
        pledgeId: parseInt(selectedPledgeId),
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
      });
      toast.success("Payment recorded");
      setDialogOpen(false);
      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "",
        reference: "",
        notes: "",
      });
      fetchPayments(selectedPledgeId);
      fetchPledges();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const selectedPledge = pledges.find((p: any) => String(p.id) === selectedPledgeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pledge Payments</h2>
        <Button onClick={() => setDialogOpen(true)} disabled={!selectedPledgeId}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Pledge</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Select value={selectedPledgeId} onValueChange={setSelectedPledgeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pledge to view payment history" />
              </SelectTrigger>
              <SelectContent>
                {pledges.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.memberName} - {p.pledgeType} (${p.pledgeAmount?.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedPledge && (
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Member</p>
                <p className="font-medium">{selectedPledge.memberName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pledged</p>
                <p className="font-medium">${selectedPledge.pledgeAmount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="font-medium text-green-600">
                  ${(selectedPledge.amountPaid || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="font-medium text-red-600">
                  ${(selectedPledge.outstanding || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPledgeId && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Amount</th>
                      <th className="p-4 text-left font-medium">Payment Method</th>
                      <th className="p-4 text-left font-medium">Reference</th>
                      <th className="p-4 text-left font-medium">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{p.paymentDate}</td>
                        <td className="p-4 font-medium text-green-600">
                          ${p.amount?.toLocaleString()}
                        </td>
                        <td className="p-4">{p.paymentMethod || "—"}</td>
                        <td className="p-4">{p.reference || "—"}</td>
                        <td className="p-4">{p.recordedBy || "—"}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No payments found for this pledge
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for the selected pledge.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
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
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                placeholder="Optional reference number"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
