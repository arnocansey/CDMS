"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { usePrayerRequests } from "@/hooks/use-queries";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Check, Heart } from "lucide-react";
import { toast } from "sonner";

interface PrayerForm {
  title: string;
  description: string;
  anonymous: boolean;
}

const emptyForm: PrayerForm = {
  title: "",
  description: "",
  anonymous: false,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  ANSWERED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function PrayerRequestsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading: isDataLoading, isError } = usePrayerRequests();
  const requests = Array.isArray(data) ? data : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PrayerForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const canModerate =
    user?.roles?.includes("ADMIN") || user?.roles?.includes("PASTOR");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/prayer-requests", {
        title: form.title.trim(),
        description: form.description.trim(),
        anonymous: form.anonymous,
      });
      toast.success("Prayer request submitted");
      setDialogOpen(false);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit prayer request");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/prayer-requests/${id}/approve`);
      toast.success("Prayer request approved");
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    } catch {
      toast.error("Failed to approve prayer request");
    }
  };

  const handleAnswered = async (id: number) => {
    try {
      await api.put(`/prayer-requests/${id}/answered`);
      toast.success("Marked as answered");
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    } catch {
      toast.error("Failed to mark as answered");
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Prayer Requests</h2>
        <p className="text-destructive">Failed to load prayer requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Prayer Requests</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Title</th>
                  <th className="p-4 text-left font-medium">From</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Prayed By</th>
                  {canModerate && (
                    <th className="p-4 text-left font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {requests.map((req: any) => {
                  const isPending = req.status === "PENDING";
                  return (
                    <tr key={req.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{req.title}</p>
                          {req.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {req.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {req.anonymous ? "Anonymous" : req.memberName || "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[req.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {req.status?.replace(/_/g, " ") || "—"}
                        </span>
                      </td>
                      <td className="p-4">{req.prayedBy || "—"}</td>
                      {canModerate && (
                        <td className="p-4">
                          {isPending && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(req.id)}
                              >
                                <Check className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAnswered(req.id)}
                              >
                                <Heart className="mr-1 h-3 w-3" />
                                Mark Answered
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={canModerate ? 5 : 4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No prayer requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Prayer Request</DialogTitle>
            <DialogDescription>
              Submit a prayer request for the church community.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Prayer for healing"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Share details of your request..."
                rows={4}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.anonymous}
                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
              />
              <Label htmlFor="anonymous" className="text-sm font-medium">
                Submit anonymously
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
