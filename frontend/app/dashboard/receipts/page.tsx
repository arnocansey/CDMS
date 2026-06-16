"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useReceipts } from "@/hooks/use-queries";
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
import { Receipt, FileText, Calendar, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = ["ISSUED", "SENT", "PRINTED"] as const;

const statusColors: Record<string, string> = {
  ISSUED: "bg-yellow-100 text-yellow-800",
  SENT: "bg-blue-100 text-blue-800",
  PRINTED: "bg-green-100 text-green-800",
};

export default function ReceiptsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);
  const [updatingReceipt, setUpdatingReceipt] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const dateParams =
    startDate && endDate ? { startDate, endDate } : undefined;
  const { data: receiptsData, isLoading: isDataLoading } = useReceipts(dateParams);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const receipts = Array.isArray(receiptsData) ? receiptsData : receiptsData?.content ?? [];

  const totalCount = receipts.length;
  const totalAmount = receipts.reduce((s: number, r: any) => s + (r.amount || 0), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = receipts.filter((r: any) => {
    const d = r.receiptDate || r.date || "";
    return d.startsWith(currentMonth);
  }).length;

  const handleUpdateStatus = async () => {
    if (!updatingReceipt || !newStatus) return;
    try {
      await api.put(`/receipts/${updatingReceipt.id}/status`, { status: newStatus });
      toast.success(`Receipt status updated to ${newStatus}`);
      setUpdatingReceipt(null);
      setNewStatus("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const openUpdateDialog = (receipt: any) => {
    setUpdatingReceipt(receipt);
    setNewStatus(receipt.status || "ISSUED");
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
        <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
      </div>

      <div className="flex items-center gap-4">
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
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStartDate(""); setEndDate(""); }}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Receipt Number</th>
                  <th className="p-4 text-left font-medium">Member Name</th>
                  <th className="p-4 text-left font-medium">Contribution Type</th>
                  <th className="p-4 text-left font-medium">Amount</th>
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt: any) => (
                  <tr key={receipt.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{receipt.receiptNumber || receipt.id}</td>
                    <td className="p-4">{receipt.memberName || "—"}</td>
                    <td className="p-4">{receipt.contributionType || receipt.type || "—"}</td>
                    <td className="p-4 font-medium">
                      ${(receipt.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-4">{receipt.receiptDate || receipt.date || "—"}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[receipt.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewingReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openUpdateDialog(receipt)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {isDataLoading ? "Loading receipts..." : "No receipts found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
            <DialogDescription>
              Receipt #{viewingReceipt?.receiptNumber || viewingReceipt?.id}
            </DialogDescription>
          </DialogHeader>
          {viewingReceipt && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receipt Number</p>
                  <p className="font-medium">{viewingReceipt.receiptNumber || viewingReceipt.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{viewingReceipt.receiptDate || viewingReceipt.date || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Name</p>
                <p className="font-medium">{viewingReceipt.memberName || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contribution Type</p>
                  <p className="font-medium">{viewingReceipt.contributionType || viewingReceipt.type || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-green-600">
                    ${(viewingReceipt.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Treasurer Name</p>
                  <p className="font-medium">{viewingReceipt.treasurerName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[viewingReceipt.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {viewingReceipt.status}
                  </span>
                </div>
              </div>
              {viewingReceipt.treasurerSignature && (
                <div>
                  <p className="text-sm text-muted-foreground">Treasurer Signature</p>
                  <p className="font-medium italic">{viewingReceipt.treasurerSignature}</p>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setViewingReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!updatingReceipt} onOpenChange={() => { setUpdatingReceipt(null); setNewStatus(""); }}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Update Receipt Status</DialogTitle>
            <DialogDescription>
              Receipt #{updatingReceipt?.receiptNumber || updatingReceipt?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setUpdatingReceipt(null); setNewStatus(""); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={!newStatus || newStatus === updatingReceipt?.status}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
