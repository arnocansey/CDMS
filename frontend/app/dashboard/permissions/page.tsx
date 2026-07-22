"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Lock } from "lucide-react";

const ROLES = ["ADMIN", "PASTOR", "TREASURER", "DEPARTMENT_LEADER", "MEMBER", "SECRETARY"] as const;

const RESOURCES = ["donations", "expenses", "budgets", "members", "reports", "attendance", "events", "settings"] as const;

const ACTIONS = ["view", "create", "edit", "delete", "approve"] as const;

interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

/** Always build a full RESOURCES × ACTIONS grid so toggles always have rows to update. */
function buildPermissionGrid(rows: Permission[]): Permission[] {
  const map = new Map(rows.map((p) => [`${p.resource}:${p.action}`, !!p.allowed]));
  const grid: Permission[] = [];
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      grid.push({
        resource,
        action,
        allowed: map.get(`${resource}:${action}`) ?? false,
      });
    }
  }
  return grid;
}

export default function PermissionsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string>("PASTOR");
  const [permissions, setPermissions] = useState<Permission[]>(() => buildPermissionGrid([]));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && activeRole) {
      fetchPermissions(activeRole);
    }
  }, [isAuthenticated, activeRole]);

  const fetchPermissions = async (role: string) => {
    setLoading(true);
    try {
      if (role === "ADMIN") {
        setPermissions(
          buildPermissionGrid(
            RESOURCES.flatMap((resource) =>
              ACTIONS.map((action) => ({ resource, action, allowed: true }))
            )
          )
        );
        return;
      }

      const response = await api.get(`/permissions/role/${role}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setPermissions(buildPermissionGrid(data));
      } else if (data?.permissions && Array.isArray(data.permissions)) {
        setPermissions(buildPermissionGrid(data.permissions));
      } else if (data && typeof data === "object") {
        const initial: Permission[] = [];
        RESOURCES.forEach((resource) => {
          ACTIONS.forEach((action) => {
            initial.push({ resource, action, allowed: !!data[resource]?.[action] });
          });
        });
        setPermissions(buildPermissionGrid(initial));
      } else {
        setPermissions(buildPermissionGrid([]));
      }
    } catch {
      setPermissions(buildPermissionGrid([]));
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (resource: string, action: string) => {
    if (activeRole === "ADMIN") return;
    setPermissions((prev) => {
      const exists = prev.some((p) => p.resource === resource && p.action === action);
      if (!exists) {
        return buildPermissionGrid([...prev, { resource, action, allowed: true }]);
      }
      return prev.map((p) =>
        p.resource === resource && p.action === action ? { ...p, allowed: !p.allowed } : p
      );
    });
  };

  const handleSave = async () => {
    if (activeRole === "ADMIN") return;
    setSaving(true);
    try {
      await api.put("/permissions", {
        role: activeRole,
        permissions: permissions.reduce((acc, p) => {
          if (!acc[p.resource]) acc[p.resource] = {};
          acc[p.resource][p.action] = p.allowed;
          return acc;
        }, {} as Record<string, Record<string, boolean>>),
      });
      toast.success("Permissions saved successfully");
      await fetchPermissions(activeRole);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const getAllowed = (resource: string, action: string): boolean => {
    return permissions.find((p) => p.resource === resource && p.action === action)?.allowed ?? false;
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Role Permissions</h2>
          <p className="text-muted-foreground">Manage what each role can access</p>
        </div>
        <Button onClick={handleSave} disabled={saving || activeRole === "ADMIN"}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Permissions"}
        </Button>
      </div>

      <Tabs value={activeRole} onValueChange={setActiveRole}>
        <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
          {ROLES.map((role) => (
            <TabsTrigger
              key={role}
              value={role}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {role.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        {ROLES.map((role) => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {role.replace("_", " ")} Permissions
                      {role === "ADMIN" && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription>
                      {role === "ADMIN"
                        ? "Administrators have full access to all resources (locked)"
                        : `Configure what ${role.replace("_", " ").toLowerCase()}s can do`}
                    </CardDescription>
                  </div>
                  {role === "ADMIN" && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" /> All Access
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left font-medium">Resource</th>
                          {ACTIONS.map((action) => (
                            <th key={action} className="p-3 text-center font-medium capitalize">
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {RESOURCES.map((resource) => (
                          <tr key={resource} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium capitalize">{resource}</td>
                            {ACTIONS.map((action) => (
                              <td key={action} className="p-3 text-center">
                                <Switch
                                  checked={getAllowed(resource, action)}
                                  onCheckedChange={() => togglePermission(resource, action)}
                                  disabled={role === "ADMIN"}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
