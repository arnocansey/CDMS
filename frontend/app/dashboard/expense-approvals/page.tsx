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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ExpenseApprovalsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get("/expenses/pending"),
        api.get("/expenses", { params: { size: 1000 } }),
      ]);
      setPendingExpenses(pendingRes.data?.content ?? pendingRes.data ?? []);
      setAllExpenses(allRes.data?.content ?? allRes.data ?? []);
    } catch (error: any) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/expenses/${id}/approve`);
      toast.success("Expense approved");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve expense");
    }
  };

  const openRejectDialog = (id: number) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await api.post(`/expenses/${rejectingId}/reject`, { reason: rejectReason });
      toast.success("Expense rejected");
      setRejectDialogOpen(false);
      setRejectingId(null);
      setRejectReason("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject expense");
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
      <h2 className="text-3xl font-bold tracking-tight">Expense Approvals</h2>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Expenses ({allExpenses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left font-medium">Date</th>
                        <th className="p-4 text-left font-medium">Category</th>
                        <th className="p-4 text-left font-medium">Description</th>
                        <th className="p-4 text-left font-medium">Amount</th>
                        <th className="p-4 text-left font-medium">Requested By</th>
                        <th className="p-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingExpenses.map((e: any) => (
                        <tr key={e.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">{e.expenseDate}</td>
                          <td className="p-4">{e.category}</td>
                          <td className="p-4">{e.description || "—"}</td>
                          <td className="p-4 font-medium text-red-600">
                            ${e.amount?.toLocaleString()}
                          </td>
                          <td className="p-4">{e.requestedBy || e.approvedBy || "—"}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(e.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openRejectDialog(e.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingExpenses.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No expenses pending approval
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left font-medium">Date</th>
                        <th className="p-4 text-left font-medium">Category</th>
                        <th className="p-4 text-left font-medium">Description</th>
                        <th className="p-4 text-left font-medium">Amount</th>
                        <th className="p-4 text-left font-medium">Method</th>
                        <th className="p-4 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allExpenses.map((e: any) => (
                        <tr key={e.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">{e.expenseDate}</td>
                          <td className="p-4">{e.category}</td>
                          <td className="p-4">{e.description || "—"}</td>
                          <td className="p-4 font-medium text-red-600">
                            ${e.amount?.toLocaleString()}
                          </td>
                          <td className="p-4">{e.paymentMethod || "—"}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                e.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : e.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {e.status || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {allExpenses.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No expenses found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this expense.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for Rejection</Label>
              <Input
                placeholder="Enter reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
