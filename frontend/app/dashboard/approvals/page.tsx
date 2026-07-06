"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  usePendingUsers,
  useApproveUser,
  useRejectUser,
  useChurchRequests,
  useApproveChurchRequest,
  useRejectChurchRequest,
} from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, X, Clock, Church } from "lucide-react";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ADMIN");
  const isPastor = user?.roles?.includes("PASTOR");
  const showChurchRequests = isAdmin || isPastor;

  const { data: pendingUsers, isLoading: loadingUsers } = usePendingUsers();
  const { data: churchRequests, isLoading: loadingRequests } = useChurchRequests();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const approveChurch = useApproveChurchRequest();
  const rejectChurch = useRejectChurchRequest();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
  const [rejectingChurchId, setRejectingChurchId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (userId: number) => {
    try {
      await approveUser.mutateAsync(userId);
      toast.success("User approved successfully");
    } catch {
      toast.error("Failed to approve user");
    }
  };

  const handleApproveChurch = async (requestId: number) => {
    try {
      await approveChurch.mutateAsync(requestId);
      toast.success("Church request approved successfully");
    } catch {
      toast.error("Failed to approve church request");
    }
  };

  const handleReject = async () => {
    if (rejectingUserId) {
      try {
        await rejectUser.mutateAsync({ userId: rejectingUserId, reason: rejectionReason });
        toast.success("User rejected");
        setRejectDialogOpen(false);
        setRejectingUserId(null);
        setRejectionReason("");
      } catch {
        toast.error("Failed to reject user");
      }
    } else if (rejectingChurchId) {
      try {
        await rejectChurch.mutateAsync({ requestId: rejectingChurchId, reason: rejectionReason });
        toast.success("Church request rejected");
        setRejectDialogOpen(false);
        setRejectingChurchId(null);
        setRejectionReason("");
      } catch {
        toast.error("Failed to reject church request");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review and manage registration requests.
        </p>
      </div>

      {/* Pending Users Section */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">User Registration Requests</h2>
        </div>
        <div className="p-6">
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !pendingUsers || pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No pending user requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Registered</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-3 text-muted-foreground">{u.email}</td>
                      <td className="py-3 text-muted-foreground">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(u.id)}
                            disabled={approveUser.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectingUserId(u.id);
                              setRejectDialogOpen(true);
                            }}
                            disabled={rejectUser.isPending}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Church Registration Requests (Admin/Pastor only) */}
      {showChurchRequests && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Church Registration Requests</h2>
          </div>
          <div className="p-6">
            {loadingRequests ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !churchRequests || churchRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Church className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No pending church registration requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Church Name</th>
                      <th className="pb-3 font-medium">Requester</th>
                      <th className="pb-3 font-medium">City</th>
                      <th className="pb-3 font-medium">State</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {churchRequests.map((req: any) => (
                      <tr key={req.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{req.churchName || req.name}</td>
                        <td className="py-3 text-muted-foreground">
                          {req.requesterName || "—"}
                        </td>
                        <td className="py-3 text-muted-foreground">{req.churchCity || req.city || "—"}</td>
                        <td className="py-3 text-muted-foreground">{req.churchState || req.state || "—"}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveChurch(req.id)}
                              disabled={approveChurch.isPending}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setRejectingChurchId(req.id);
                                setRejectDialogOpen(true);
                              }}
                              disabled={rejectChurch.isPending}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rejectingChurchId ? "Reject Church Request" : "Reject User"}</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this registration. This will be sent
              to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectingUserId(null);
                setRejectingChurchId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
