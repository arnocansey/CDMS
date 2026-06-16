"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface AuditLogEntry {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  oldValue: string;
  newValue: string;
  ipAddress: string;
}

interface AuditLogPage {
  content: AuditLogEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
}

const ENTITY_TYPES = [
  "ALL",
  "MEMBER",
  "DONATION",
  "TITHE",
  "OFFERING",
  "EXPENSE",
  "BUDGET",
  "FUND",
  "PLEDGE",
  "USER",
];

const ACTION_BADGES: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800",
};

export default function AuditLogPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [entityType, setEntityType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size };
      if (entityType !== "ALL") {
        params.entity = entityType;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const queryString = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      const res = await api.get(`/audit-logs?${queryString}`);
      setLogs(res.data);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated, page, entityType, startDate, endDate]);

  const truncate = (str: string | null, maxLen = 60) => {
    if (!str) return "—";
    return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
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
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6" />
        <h2 className="text-3xl font-bold tracking-tight">Audit Log</h2>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Entity Type</Label>
          <Select
            value={entityType}
            onValueChange={(v) => { setEntityType(v); setPage(0); }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(startDate || endDate || entityType !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setEntityType("ALL");
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : logs && logs.content.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Timestamp</th>
                    <th className="p-4 text-left font-medium">User</th>
                    <th className="p-4 text-left font-medium">Action</th>
                    <th className="p-4 text-left font-medium">Entity</th>
                    <th className="p-4 text-left font-medium">Entity ID</th>
                    <th className="p-4 text-left font-medium">Old Value</th>
                    <th className="p-4 text-left font-medium">New Value</th>
                    <th className="p-4 text-left font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.content.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 text-sm whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4">{log.userName || "System"}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_BADGES[log.action] || "bg-gray-100 text-gray-800"}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">{log.entityType}</td>
                      <td className="p-4 text-muted-foreground">{log.entityId}</td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate" title={log.oldValue || ""}>
                        {truncate(log.oldValue)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate" title={log.newValue || ""}>
                        {truncate(log.newValue)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{log.ipAddress || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No audit logs found.
            </div>
          )}
        </CardContent>
      </Card>

      {logs && logs.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {logs.number + 1} of {logs.totalPages} ({logs.totalElements} entries)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= logs.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
