"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CalendarEvent } from "@/components/Calendar";
import { Plus } from "lucide-react";

interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "SERVICE" | "MEETING" | "SOCIAL" | "SPECIAL";
  description: string;
}

const defaultForm: EventFormData = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "SERVICE",
  description: "",
};

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch {
      setEvents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/events", form);
      setDialogOpen(false);
      setForm(defaultForm);
      fetchEvents();
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setForm({
      ...defaultForm,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    });
    setDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Calendar</h2>
          <p className="text-muted-foreground">View and manage church events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            {(["month", "week", "day"] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(v)}
                className="rounded-none first:rounded-l-md last:rounded-r-md capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) =>
                        setForm({ ...form, type: v as EventFormData["type"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SERVICE">Service</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="SOCIAL">Social</SelectItem>
                        <SelectItem value="SPECIAL">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Calendar
            events={events}
            view={view}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Date</span>
                <p className="font-medium">
                  {new Date(selectedEvent.date).toLocaleDateString("default", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {selectedEvent.startTime && (
                <div>
                  <span className="text-sm text-muted-foreground">Time</span>
                  <p className="font-medium">
                    {selectedEvent.startTime}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Type</span>
                <p className="font-medium capitalize">
                  {selectedEvent.type.toLowerCase()}
                </p>
              </div>
              {selectedEvent.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="font-medium">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
