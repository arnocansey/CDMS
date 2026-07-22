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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Transfer {
  id: number;
  memberName: string;
  fromChurch: string;
  toChurch: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
}

export default function ChurchTransferPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [targetChurch, setTargetChurch] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchTransfers = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        api.get("/church-transfers"),
        api.get("/church-transfers/pending"),
      ]);
      setTransfers(allRes.data?.content ?? allRes.data ?? []);
      setPendingTransfers(pendingRes.data?.content ?? pendingRes.data ?? []);
    } catch {
      toast.error("Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get("/members", { params: { size: 1000 } });
      setMembers(res.data?.content ?? res.data ?? []);
    } catch {
      toast.error("Failed to load members");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransfers();
      fetchMembers();
    }
  }, [isAuthenticated]);

  const handleRequest = async () => {
    if (!selectedMember || !targetChurch) {
      toast.error("Please select a member and target church");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/church-transfers", {
        memberId: Number(selectedMember),
        targetChurch,
        reason,
      });
      toast.success("Transfer request submitted");
      setDialogOpen(false);
      setSelectedMember("");
      setTargetChurch("");
      setReason("");
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/church-transfers/${id}/approve`);
      toast.success("Transfer approved");
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve transfer");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/church-transfers/${id}/reject`, { reason: "Rejected by admin" });
      toast.success("Transfer rejected");
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject transfer");
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const renderTable = (data: Transfer[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left font-medium">Member</th>
            <th className="p-4 text-left font-medium">From Church</th>
            <th className="p-4 text-left font-medium">To Church</th>
            <th className="p-4 text-left font-medium">Date</th>
            <th className="p-4 text-left font-medium">Status</th>
            <th className="p-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id} className="border-b hover:bg-muted/50">
              <td className="p-4 font-medium">{t.memberName}</td>
              <td className="p-4">{t.fromChurch}</td>
              <td className="p-4">{t.toChurch}</td>
              <td className="p-4">{new Date(t.createdAt).toLocaleDateString()}</td>
              <td className="p-4">{statusBadge(t.status)}</td>
              <td className="p-4">
                {t.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleApprove(t.id)}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleReject(t.id)}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No transfers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Church Transfer</h2>
          <p className="text-muted-foreground">Manage member transfer requests between churches</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Request Transfer
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingTransfers.length})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({transfers.filter((t) => t.status === "APPROVED" || t.status === "COMPLETED").length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({transfers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transfers</CardTitle>
              </CardHeader>
              <CardContent>{renderTable(pendingTransfers)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(transfers.filter((t) => t.status === "APPROVED" || t.status === "COMPLETED"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Transfers</CardTitle>
              </CardHeader>
              <CardContent>{renderTable(transfers)}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Request Church Transfer</DialogTitle>
            <DialogDescription>
              Transfer a member to another church. This will require admin approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Church</Label>
              <Input
                placeholder="Enter target church name"
                value={targetChurch}
                onChange={(e) => setTargetChurch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                placeholder="Reason for transfer"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequest} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
