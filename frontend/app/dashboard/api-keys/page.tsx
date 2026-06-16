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
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Copy, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  permissions: string[];
  usageCount: number;
  rateLimit: number;
  status: string;
  expiresAt: string;
  createdAt: string;
}

const PERMISSIONS = [
  "members:read",
  "members:write",
  "donations:read",
  "donations:write",
  "expenses:read",
  "expenses:write",
  "reports:read",
  "settings:read",
  "settings:write",
];

export default function ApiKeysPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiryDays, setExpiryDays] = useState("90");
  const [rateLimit, setRateLimit] = useState("1000");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchKeys = async () => {
    try {
      const res = await api.get("/api-keys");
      setKeys(res.data?.content ?? res.data ?? []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchKeys();
  }, [isAuthenticated]);

  const handleGenerate = async () => {
    if (!keyName) {
      toast.error("Please enter a key name");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/api-keys", {
        name: keyName,
        permissions: selectedPermissions,
        expiryDays: Number(expiryDays),
        rateLimit: Number(rateLimit),
      });
      setNewKey(res.data.key);
      toast.success("API key generated successfully");
      setKeyName("");
      setSelectedPermissions([]);
      setExpiryDays("90");
      setRateLimit("1000");
      fetchKeys();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate key");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await api.put(`/api-keys/${id}/revoke`);
      toast.success("API key revoked");
      fetchKeys();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke key");
    }
  };

  const handleRegenerate = async (id: number) => {
    try {
      const res = await api.post(`/api-keys/${id}/regenerate`);
      setNewKey(res.data.key);
      toast.success("API key regenerated");
      fetchKeys();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to regenerate key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      REVOKED: "destructive",
      EXPIRED: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for external integrations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Key
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Key Name</th>
                    <th className="p-4 text-left font-medium">API Key</th>
                    <th className="p-4 text-left font-medium">Permissions</th>
                    <th className="p-4 text-left font-medium">Usage</th>
                    <th className="p-4 text-left font-medium">Rate Limit</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{k.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 text-sm">
                            {k.keyPrefix}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(k.keyPrefix)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {k.permissions?.slice(0, 3).map((p) => (
                            <Badge key={p} variant="secondary" className="text-xs">
                              {p}
                            </Badge>
                          ))}
                          {k.permissions?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{k.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{k.usageCount?.toLocaleString() ?? 0}</td>
                      <td className="p-4">{k.rateLimit?.toLocaleString()}/hr</td>
                      <td className="p-4">{statusBadge(k.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {k.status !== "REVOKED" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRegenerate(k.id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleRevoke(k.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No API keys found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setNewKey(null);
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{newKey ? "API Key Generated" : "Generate New API Key"}</DialogTitle>
            <DialogDescription>
              {newKey
                ? "Copy this key now. It won't be shown again."
                : "Create a new API key for external access."}
            </DialogDescription>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <code className="break-all text-sm">{newKey}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(newKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => { setDialogOpen(false); setNewKey(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g., Production API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSIONS.map((perm) => (
                    <Badge
                      key={perm}
                      variant={selectedPermissions.includes(perm) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePermission(perm)}
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry (days)</Label>
                  <Input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (req/hr)</Label>
                  <Input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={submitting}>
                  {submitting ? "Generating..." : "Generate Key"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
