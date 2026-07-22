"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, FileSpreadsheet, Users, Calendar, DollarSign, TrendingDown, Gift } from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const REPORTS = [
  {
    id: "membership-pdf",
    title: "Membership Report",
    description: "Complete member directory with contact details and membership status.",
    icon: Users,
    endpoint: "/reports/membership/pdf",
    type: "pdf",
  },
  {
    id: "membership-excel",
    title: "Membership Report (Excel)",
    description: "Exportable spreadsheet of all members for analysis.",
    icon: FileSpreadsheet,
    endpoint: "/reports/membership/excel",
    type: "excel",
  },
  {
    id: "attendance-pdf",
    title: "Attendance Report",
    description: "Attendance records by date range with member participation.",
    icon: Calendar,
    endpoint: "/reports/attendance/pdf",
    type: "pdf",
  },
  {
    id: "financial-pdf",
    title: "Financial Report",
    description: "Income and expense summary with category breakdown.",
    icon: DollarSign,
    endpoint: "/reports/financial/pdf",
    type: "pdf",
  },
  {
    id: "financial-excel",
    title: "Financial Report (Excel)",
    description: "Detailed financial data in spreadsheet format.",
    icon: FileSpreadsheet,
    endpoint: "/reports/financial/excel",
    type: "excel",
  },
];

export default function ReportsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleDownload = async (report: typeof REPORTS[0]) => {
    setDownloading(report.id);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const url = `${API_BASE}${report.endpoint}${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken") || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      let filename = report.title;
      if (disposition) {
        const match = disposition.match(/filename=([^;]+)/);
        if (match) filename = match[1];
      } else {
        filename += report.type === "pdf" ? ".pdf" : ".xlsx";
      }

      const a = window.document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${report.title} downloaded`);
    } catch (error: any) {
      toast.error(error.message || "Failed to download report");
    } finally {
      setDownloading(null);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and download financial and membership reports.</p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
          <CardDescription>Optionally filter reports by date range. Leave empty for all data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(""); setEndDate(""); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="text-xs">{report.type.toUpperCase()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{report.description}</p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleDownload(report)}
                  disabled={downloading === report.id}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading === report.id ? "Downloading..." : "Download"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
