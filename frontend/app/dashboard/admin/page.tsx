"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Building2, Users, DollarSign, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && user && !user.roles?.includes("ROLE_PLATFORM_ADMIN")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes("ROLE_PLATFORM_ADMIN")) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [churchesRes, statsRes] = await Promise.all([
        api.get("/admin/churches"),
        api.get("/admin/churches/stats"),
      ]);
      setChurches(churchesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Platform Administration</h2>
        <p className="text-muted-foreground">Overview of all churches on the platform</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Churches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalChurches || churches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Churches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Church</th>
                  <th className="p-4 text-left font-medium">Slug</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Plan</th>
                </tr>
              </thead>
              <tbody>
                {churches.map((church: any) => (
                  <tr key={church.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{church.name}</td>
                    <td className="p-4 text-muted-foreground">{church.slug}</td>
                    <td className="p-4">{church.email}</td>
                    <td className="p-4">
                      <Badge variant={church.enabled ? "default" : "secondary"}>
                        {church.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{church.subscriptionPlan || "Free"}</Badge>
                    </td>
                  </tr>
                ))}
                {churches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No churches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
