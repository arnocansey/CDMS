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
import { ArrowRightLeft, CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";

export default function BankReconciliationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [currentReconciliation, setCurrentReconciliation] = useState<any>(null);
  const [unmatched, setUnmatched] = useState<any[]>([]);
  const [matched, setMatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    statementDate: "",
    bankBalance: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/bank-reconciliation/history");
      const data = res.data?.content ?? res.data ?? [];
      setHistory(data);

      const active = data.find((r: any) => r.status === "PENDING" || r.status === "IN_PROGRESS");
      if (active) {
        setCurrentReconciliation(active);
        await fetchReconciliation(active.id);
      }
    } catch (error: any) {
      toast.error("Failed to load reconciliation history");
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliation = async (id: number) => {
    try {
      const res = await api.get(`/bank-reconciliation/${id}`);
      const data = res.data;
      setCurrentReconciliation(data);
      setUnmatched(data.unmatchedEntries ?? []);
      setMatched(data.matchedEntries ?? []);
    } catch (error: any) {
      toast.error("Failed to load reconciliation details");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/bank-reconciliation/start", {
        statementDate: formData.statementDate,
        bankBalance: parseFloat(formData.bankBalance),
      });
      toast.success("Reconciliation started");
      setStartDialogOpen(false);
      setFormData({ statementDate: "", bankBalance: "" });
      setCurrentReconciliation(res.data);
      await fetchReconciliation(res.data.id);
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start reconciliation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMatch = async (entryId: number) => {
    if (!currentReconciliation) return;
    try {
      await api.post(`/bank-reconciliation/${currentReconciliation.id}/entries/${entryId}/match`);
      toast.success("Entry matched");
      await fetchReconciliation(currentReconciliation.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to match entry");
    }
  };

  const handleComplete = async () => {
    if (!currentReconciliation) return;
    try {
      const res = await api.post(`/bank-reconciliation/${currentReconciliation.id}/complete`);
      toast.success("Reconciliation completed");
      setCompleteDialogOpen(false);
      setCurrentReconciliation(null);
      setUnmatched([]);
      setMatched([]);
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete reconciliation");
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const bankBalance = currentReconciliation?.bankBalance ?? 0;
  const bookBalance = matched.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const difference = bankBalance - bookBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h2>
        {!currentReconciliation && (
          <Button onClick={() => setStartDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Start New Reconciliation
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : currentReconciliation ? (
        <div className="space-y-6">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Statement Date</p>
                  <p className="font-medium">{currentReconciliation.statementDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Balance</p>
                  <p className="font-medium">${bankBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matched Total</p>
                  <p className="font-medium">${bookBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Unmatched Entries ({unmatched.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left text-sm font-medium">Date</th>
                        <th className="p-3 text-left text-sm font-medium">Description</th>
                        <th className="p-3 text-left text-sm font-medium">Amount</th>
                        <th className="p-3 text-left text-sm font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unmatched.map((e: any) => (
                        <tr key={e.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">{e.date}</td>
                          <td className="p-3 text-sm">{e.description || "—"}</td>
                          <td className="p-3 text-sm font-medium">
                            ${e.amount?.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMatch(e.id)}
                            >
                              <ArrowRightLeft className="mr-1 h-3 w-3" />
                              Match
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {unmatched.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-sm text-muted-foreground">
                            All entries matched
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matched Entries ({matched.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left text-sm font-medium">Date</th>
                        <th className="p-3 text-left text-sm font-medium">Description</th>
                        <th className="p-3 text-left text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matched.map((e: any) => (
                        <tr key={e.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">{e.date}</td>
                          <td className="p-3 text-sm">{e.description || "—"}</td>
                          <td className="p-3 text-sm font-medium">
                            ${e.amount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {matched.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-sm text-muted-foreground">
                            No matched entries yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setCompleteDialogOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Reconciliation
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No active reconciliation. Start a new one to begin.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">History</h3>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Statement Date</th>
                    <th className="p-4 text-left font-medium">Bank Balance</th>
                    <th className="p-4 text-left font-medium">Book Balance</th>
                    <th className="p-4 text-left font-medium">Difference</th>
                    <th className="p-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h: any) => (
                    <tr key={h.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{h.statementDate}</td>
                      <td className="p-4">${h.bankBalance?.toLocaleString()}</td>
                      <td className="p-4">${h.bookBalance?.toLocaleString()}</td>
                      <td className="p-4">
                        ${(h.bankBalance - h.bookBalance)?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={h.status || "pending"} />
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No reconciliation history
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Start New Reconciliation</DialogTitle>
            <DialogDescription>Enter the bank statement details to begin.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-2">
              <Label>Statement Date *</Label>
              <Input
                type="date"
                value={formData.statementDate}
                onChange={(e) => setFormData({ ...formData, statementDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Balance ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.bankBalance}
                onChange={(e) => setFormData({ ...formData, bankBalance: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStartDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Starting..." : "Start Reconciliation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Reconciliation</DialogTitle>
            <DialogDescription>Review the difference before completing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bank Balance</span>
                <span className="font-medium">${bankBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Book Balance</span>
                <span className="font-medium">${bookBalance.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="font-medium">Difference</span>
                <span className={`font-bold ${difference === 0 ? "text-green-600" : "text-red-600"}`}>
                  ${difference.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
