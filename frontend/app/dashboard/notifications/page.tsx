"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Check,
  Trash2,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  Info,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  FINANCE: <DollarSign className="h-5 w-5 text-green-500" />,
  MEMBER: <Users className="h-5 w-5 text-blue-500" />,
  EVENT: <Calendar className="h-5 w-5 text-purple-500" />,
  ALERT: <AlertCircle className="h-5 w-5 text-red-500" />,
  INFO: <Info className="h-5 w-5 text-cyan-500" />,
  ANNOUNCEMENT: <Megaphone className="h-5 w-5 text-yellow-500" />,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                notification.read
                  ? "bg-card"
                  : "bg-accent/50 border-primary/20"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex-shrink-0 mt-1">
                  {TYPE_ICONS[notification.type] || (
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
