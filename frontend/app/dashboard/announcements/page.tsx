"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useAnnouncements } from "@/hooks/use-queries";
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
import { Plus, Edit, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageSpinner } from "@/components/page-spinner";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface AnnouncementForm {
  title: string;
  content: string;
  publishDate: string;
  expiryDate: string;
  published: boolean;
}

const emptyForm: AnnouncementForm = {
  title: "",
  content: "",
  publishDate: "",
  expiryDate: "",
  published: true,
};

export default function AnnouncementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading: isDataLoading, isError } = useAnnouncements();
  const announcements = Array.isArray(data) ? data : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const canWrite =
    user?.roles?.includes("ADMIN") || user?.roles?.includes("SECRETARY");
  const canDelete = user?.roles?.includes("ADMIN");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      publishDate: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      content: item.content ?? "",
      publishDate: item.publishDate ?? "",
      expiryDate: item.expiryDate ?? "",
      published: item.published ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        publishDate: form.publishDate || null,
        expiryDate: form.expiryDate || null,
        published: form.published,
      };
      if (editing) {
        await api.put(`/announcements/${editing.id}`, payload);
        toast.success("Announcement updated");
      } else {
        await api.post("/announcements", payload);
        toast.success("Announcement created");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await api.delete(`/announcements/${pendingDeleteId}`);
      toast.success("Announcement deleted");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    } catch {
      toast.error("Failed to delete announcement");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <PageSpinner className="min-h-[50vh]" />;
  }

  if (isDataLoading) {
    return <PageSpinner className="min-h-[50vh]" />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        <p className="text-destructive">Failed to load announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Announcement
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing ({announcements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Title</th>
                  <th className="p-4 text-left font-medium">Publish Date</th>
                  <th className="p-4 text-left font-medium">Expiry Date</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  {(canWrite || canDelete) && (
                    <th className="p-4 text-left font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {announcements.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.content && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{item.publishDate || "—"}</td>
                    <td className="p-4">{item.expiryDate || "—"}</td>
                    <td className="p-4">
                      <StatusBadge status={item.published ? "published" : "draft"} />
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {canWrite && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => requestDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan={canWrite || canDelete ? 5 : 4}>
                      <EmptyState
                        icon={Megaphone}
                        title="No announcements found"
                        description="Create an announcement to share with your congregation."
                        actionLabel={canWrite ? "Add Announcement" : undefined}
                        onAction={canWrite ? openCreate : undefined}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Announcement" : "Add Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update announcement details below."
                : "Fill in the details to create a new announcement."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Church picnic this Saturday"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Announcement details..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              <Label htmlFor="published" className="text-sm font-medium">
                Published
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Announcement"
                    : "Add Announcement"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete announcement?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
