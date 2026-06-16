"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { Plus, Wallet, TrendingUp, TrendingDown, Edit, Trash2, DollarSign } from "lucide-react";

export default function FundsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [funds, setFunds] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", fundType: "GENERAL", openingBalance: "0", targetAmount: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [fundsRes, summaryRes] = await Promise.all([
        api.get("/funds"),
        api.get("/funds/summary").catch(() => null),
      ]);
      setFunds(fundsRes.data || []);
      if (summaryRes?.data) setSummary(summaryRes.data);
    } catch {
      toast.error("Failed to load funds");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : null,
      };
      if (editingFund) {
        await api.put(`/funds/${editingFund.id}`, payload);
        toast.success("Fund updated");
      } else {
        await api.post("/funds", payload);
        toast.success("Fund created");
      }
      setDialogOpen(false);
      setEditingFund(null);
      setFormData({ name: "", description: "", fundType: "GENERAL", openingBalance: "0", targetAmount: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save fund");
    }
  };

  const handleEdit = (fund: any) => {
    setEditingFund(fund);
    setFormData({
      name: fund.name || "",
      description: fund.description || "",
      fundType: fund.fundType || "GENERAL",
      openingBalance: fund.openingBalance?.toString() || "0",
      targetAmount: fund.targetAmount?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this fund?")) return;
    try {
      await api.delete(`/funds/${id}`);
      toast.success("Fund deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete fund");
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Funds</h2>
          <p className="text-muted-foreground">Manage designated funds and their balances</p>
        </div>
        <Button onClick={() => { setEditingFund(null); setFormData({ name: "", description: "", fundType: "GENERAL", openingBalance: "0", targetAmount: "" }); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Fund
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${summary.totalBalance?.toLocaleString() || "0"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Funds</p>
                <p className="text-2xl font-bold">{summary.activeFunds || funds.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{summary.totalTransactions || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {funds.map((fund) => (
          <Card key={fund.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{fund.name}</CardTitle>
                  <CardDescription>{fund.fundType}</CardDescription>
                </div>
                <Badge variant={fund.active ? "default" : "secondary"}>
                  {fund.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fund.description && (
                <p className="text-sm text-muted-foreground">{fund.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-lg font-semibold">${fund.currentBalance?.toLocaleString() || "0"}</span>
              </div>
              {fund.targetAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Target</span>
                  <span className="text-sm">${fund.targetAmount?.toLocaleString()}</span>
                </div>
              )}
              {fund.targetAmount > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${Math.min(((fund.currentBalance || 0) / fund.targetAmount) * 100, 100)}%` }}
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(fund)}>
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(fund.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {funds.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No funds created yet</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create First Fund
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFund ? "Edit Fund" : "New Fund"}</DialogTitle>
            <DialogDescription>{editingFund ? "Update fund details" : "Create a new designated fund"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="fundType">Type</Label>
              <Select value={formData.fundType} onValueChange={(v) => setFormData({ ...formData, fundType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="BUILDING">Building</SelectItem>
                  <SelectItem value="MISSIONS">Missions</SelectItem>
                  <SelectItem value="YOUTH">Youth</SelectItem>
                  <SelectItem value="BENEVOLENCE">Benevolence</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input id="openingBalance" type="number" step="0.01" value={formData.openingBalance} onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target (optional)</Label>
                <Input id="targetAmount" type="number" step="0.01" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full">{editingFund ? "Update" : "Create"} Fund</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
