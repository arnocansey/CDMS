"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEvents } from "@/hooks/use-queries";
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
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageSpinner } from "@/components/page-spinner";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface EventForm {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  recurring: boolean;
}

const emptyForm: EventForm = {
  title: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  recurring: false,
};

function toTimeInput(value?: string | null) {
  if (!value) return "";
  // Accept "HH:mm:ss", ISO datetime, or "HH:mm"
  if (value.includes("T")) {
    return value.split("T")[1]?.slice(0, 5) ?? "";
  }
  return value.slice(0, 5);
}

function toDateTime(date: string, time: string) {
  if (!date || !time) return null;
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

export default function EventsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading: isDataLoading, isError } = useEvents();
  const events = Array.isArray(data) ? data : data?.content ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const canWrite =
    user?.roles?.includes("ADMIN") ||
    user?.roles?.includes("PASTOR") ||
    user?.roles?.includes("SECRETARY");
  const canDelete = user?.roles?.includes("ADMIN");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (event: any) => {
    setEditing(event);
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      eventDate: event.eventDate ?? "",
      startTime: toTimeInput(event.startTime),
      endTime: toTimeInput(event.endTime),
      location: event.location ?? "",
      recurring: !!event.recurring,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.eventDate) {
      toast.error("Title and event date are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        eventDate: form.eventDate,
        startTime: toDateTime(form.eventDate, form.startTime),
        endTime: toDateTime(form.eventDate, form.endTime),
        location: form.location || null,
        recurring: form.recurring,
      };
      if (editing) {
        await api.put(`/events/${editing.id}`, payload);
        toast.success("Event updated");
      } else {
        await api.post("/events", payload);
        toast.success("Event created");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save event");
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
      await api.delete(`/events/${pendingDeleteId}`);
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch {
      toast.error("Failed to delete event");
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
        <h2 className="text-3xl font-bold tracking-tight">Events</h2>
        <p className="text-destructive">Failed to load events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Events</h2>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Title</th>
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Time</th>
                  <th className="p-4 text-left font-medium">Location</th>
                  <th className="p-4 text-left font-medium">Recurring</th>
                  {(canWrite || canDelete) && (
                    <th className="p-4 text-left font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{event.eventDate || "—"}</td>
                    <td className="p-4">
                      {toTimeInput(event.startTime) || "—"}
                      {event.endTime ? ` – ${toTimeInput(event.endTime)}` : ""}
                    </td>
                    <td className="p-4">{event.location || "—"}</td>
                    <td className="p-4">
                      <StatusBadge
                        status={event.recurring ? "active" : "inactive"}
                        label={event.recurring ? "Yes" : "No"}
                        tone={event.recurring ? "info" : "neutral"}
                      />
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {canWrite && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => requestDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={canWrite || canDelete ? 6 : 5}>
                      <EmptyState
                        icon={Calendar}
                        title="No events found"
                        description="Create an event to see it listed here."
                        actionLabel={canWrite ? "Add Event" : undefined}
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
            <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update event details below."
                : "Fill in the details to create a new event."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Sunday Service"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Main Sanctuary"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.recurring}
                onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              />
              <Label htmlFor="recurring" className="text-sm font-medium">
                Recurring event
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Update Event" : "Add Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete event?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
