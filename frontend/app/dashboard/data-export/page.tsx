"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Users, DollarSign, Receipt, PiggyBank, FileText } from "lucide-react";

export default function DataExportPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [donationsFrom, setDonationsFrom] = useState("");
  const [donationsTo, setDonationsTo] = useState("");
  const [expensesFrom, setExpensesFrom] = useState("");
  const [expensesTo, setExpensesTo] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const downloadBlob = (response: any, filename: string) => {
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      let response;
      const date = new Date().toISOString().split("T")[0];

      switch (type) {
        case "members":
          response = await api.get("/reports/export/members", { responseType: "blob" });
          downloadBlob(response, `members-export-${date}.csv`);
          break;
        case "donations":
          if (!donationsFrom || !donationsTo) {
            toast.error("Please select both from and to dates for donations");
            setLoading(null);
            return;
          }
          response = await api.get(`/reports/export/donations?from=${donationsFrom}&to=${donationsTo}`, { responseType: "blob" });
          downloadBlob(response, `donations-export-${donationsFrom}-to-${donationsTo}.csv`);
          break;
        case "expenses":
          if (!expensesFrom || !expensesTo) {
            toast.error("Please select both from and to dates for expenses");
            setLoading(null);
            return;
          }
          response = await api.get(`/reports/export/expenses?from=${expensesFrom}&to=${expensesTo}`, { responseType: "blob" });
          downloadBlob(response, `expenses-export-${expensesFrom}-to-${expensesTo}.csv`);
          break;
        case "budgets":
          response = await api.get("/reports/export/budgets", { responseType: "blob" });
          downloadBlob(response, `budgets-export-${date}.csv`);
          break;
        case "financial-summary":
          response = await api.get("/reports/export/financial-summary/pdf", { responseType: "blob" });
          downloadBlob(response, `financial-summary-${date}.pdf`);
          break;
      }
      toast.success("Export downloaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to export data");
    } finally {
      setLoading(null);
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
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Data Export</h2>
        <p className="text-muted-foreground">Export your church data in CSV or PDF format</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Members</CardTitle>
                <CardDescription>Export all member records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleExport("members")} disabled={loading === "members"}>
              <Download className="mr-2 h-4 w-4" />
              {loading === "members" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Donations</CardTitle>
                <CardDescription>Export donation records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={donationsFrom} onChange={(e) => setDonationsFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={donationsTo} onChange={(e) => setDonationsTo(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={() => handleExport("donations")} disabled={loading === "donations"}>
              <Download className="mr-2 h-4 w-4" />
              {loading === "donations" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Expenses</CardTitle>
                <CardDescription>Export expense records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={expensesFrom} onChange={(e) => setExpensesFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={expensesTo} onChange={(e) => setExpensesTo(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={() => handleExport("expenses")} disabled={loading === "expenses"}>
              <Download className="mr-2 h-4 w-4" />
              {loading === "expenses" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Budgets</CardTitle>
                <CardDescription>Export budget data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleExport("budgets")} disabled={loading === "budgets"}>
              <Download className="mr-2 h-4 w-4" />
              {loading === "budgets" ? "Downloading..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
                <CardDescription>Full financial report as PDF</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleExport("financial-summary")} disabled={loading === "financial-summary"}>
              <Download className="mr-2 h-4 w-4" />
              {loading === "financial-summary" ? "Downloading..." : "Download PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
