"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMember } from "@/hooks/use-queries";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User, DollarSign, TrendingUp, Clock, Hash } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface Contribution {
  id: number;
  amount: number;
  type: string;
  date: string;
  description: string;
  paymentMethod: string;
}

interface ContributionSummary {
  totalContributions: number;
  monthlyContributions: number;
  annualContributions: number;
  contributionFrequency: string;
  contributions: Contribution[];
}

export default function MemberDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const memberId = Number(params.id);
  const { data: member, isLoading: isMemberLoading, isError } = useMember(memberId);
  const [contributions, setContributions] = useState<ContributionSummary | null>(null);
  const [contributionsLoading, setContributionsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (memberId) {
      setContributionsLoading(true);
      api
        .get(`/finance/members/${memberId}/contributions`)
        .then((res) => setContributions(res.data))
        .catch(() => setContributions(null))
        .finally(() => setContributionsLoading(false));
    }
  }, [memberId]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isMemberLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/members">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Member Not Found</h2>
        </div>
        <p className="text-muted-foreground">The member could not be found.</p>
      </div>
    );
  }

  const fullName = `${member.firstName} ${member.lastName}`;
  const memberSince = member.membershipDate
    ? new Date(member.membershipDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const baptismDate = member.baptismDate
    ? new Date(member.baptismDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const dateOfBirth = member.dateOfBirth
    ? new Date(member.dateOfBirth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      TITHE: "bg-blue-100 text-blue-800",
      OFFERING: "bg-purple-100 text-purple-800",
      DONATION: "bg-green-100 text-green-800",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[type] || "bg-gray-100 text-gray-800"}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/members">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{fullName}</h2>
            <p className="text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <Link href="/dashboard/members">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Member
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{member.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium">{member.lastName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{member.gender?.replace("_", " ") || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{dateOfBirth}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  member.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {member.active ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{member.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {member.address
                    ? `${member.address}${member.city ? `, ${member.city}` : ""}${member.state ? `, ${member.state}` : ""}${member.zipCode ? ` ${member.zipCode}` : ""}`
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Membership Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{memberSince}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Baptism Date</p>
                <p className="font-medium">{baptismDate}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{member.departmentName || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={fullName}
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight">Contribution History</h3>

        {contributionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : contributions ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(contributions.totalContributions || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(contributions.monthlyContributions || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Annual Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(contributions.annualContributions || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contribution Frequency</CardTitle>
                  <Hash className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contributions.contributionFrequency}
                  </div>
                  <p className="text-xs text-muted-foreground">contributions</p>
                </CardContent>
              </Card>
            </div>

            {contributions.contributions && contributions.contributions.length > 0 && (() => {
              const monthlyData = contributions.contributions.reduce((acc: Record<string, number>, c: Contribution) => {
                const month = c.date?.substring(0, 7) || "Unknown";
                acc[month] = (acc[month] || 0) + (c.amount || 0);
                return acc;
              }, {});
              const chartData = Object.entries(monthlyData)
                .map(([month, amount]) => ({ month, amount }))
                .sort((a, b) => a.month.localeCompare(b.month));
              return chartData.length > 0 ? (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Monthly Contribution Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]} />
                          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}

            <Card>
              <CardHeader>
                <CardTitle>Contribution History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left font-medium">Date</th>
                        <th className="p-4 text-left font-medium">Type</th>
                        <th className="p-4 text-left font-medium">Amount</th>
                        <th className="p-4 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.contributions.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            {new Date(c.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="p-4">{getTypeBadge(c.type)}</td>
                          <td className="p-4 font-medium">${(c.amount || 0).toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground">{c.description || "—"}</td>
                        </tr>
                      ))}
                      {contributions.contributions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground">
                            No contributions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No contribution data available for this member.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
