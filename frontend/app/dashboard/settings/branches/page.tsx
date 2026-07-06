"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, MapPin, Building, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface District {
  id: number;
  name: string;
  description?: string;
}

interface Branch {
  id: number;
  name: string;
  districtId?: number;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  enabled: boolean;
}

export default function BranchesDistrictsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"branches" | "districts">("branches");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Branch Modal State
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    districtId: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    enabled: true,
  });

  // District Modal State
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [districtForm, setDistrictForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, districtsRes] = await Promise.all([
        api.get("/branches"),
        api.get("/districts"),
      ]);
      setBranches(branchesRes.data || []);
      setDistricts(districtsRes.data || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBranchModal = (branch: Branch | null = null) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        name: branch.name,
        code: branch.code || "",
        districtId: branch.districtId?.toString() || "",
        phone: branch.phone || "",
        email: branch.email || "",
        address: branch.address || "",
        city: branch.city || "",
        state: branch.state || "",
        zipCode: branch.zipCode || "",
        enabled: branch.enabled,
      });
    } else {
      setEditingBranch(null);
      setBranchForm({
        name: "",
        code: "",
        districtId: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        enabled: true,
      });
    }
    setBranchModalOpen(true);
  };

  const handleOpenDistrictModal = (district: District | null = null) => {
    if (district) {
      setEditingDistrict(district);
      setDistrictForm({
        name: district.name,
        description: district.description || "",
      });
    } else {
      setEditingDistrict(null);
      setDistrictForm({
        name: "",
        description: "",
      });
    }
    setDistrictModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!branchForm.name) {
      toast.error("Branch Name is required");
      return;
    }
    try {
      const payload = {
        ...branchForm,
        districtId: branchForm.districtId ? parseInt(branchForm.districtId) : null,
      };
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, payload);
        toast.success("Branch updated successfully");
      } else {
        await api.post("/branches", payload);
        toast.success("Branch created successfully");
      }
      setBranchModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save branch");
    }
  };

  const handleSaveDistrict = async () => {
    if (!districtForm.name) {
      toast.error("District Name is required");
      return;
    }
    try {
      if (editingDistrict) {
        await api.put(`/districts/${editingDistrict.id}`, districtForm);
        toast.success("District updated successfully");
      } else {
        await api.post("/districts", districtForm);
        toast.success("District created successfully");
      }
      setDistrictModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save district");
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await api.delete(`/branches/${id}`);
      toast.success("Branch deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete branch");
    }
  };

  const handleDeleteDistrict = async (id: number) => {
    if (!confirm("Are you sure you want to delete this district? All branches inside will lose district references.")) return;
    try {
      await api.delete(`/districts/${id}`);
      toast.success("District deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete district");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Branches & Districts</h2>
          <p className="text-muted-foreground">Manage your denomination structure, regions, and physical locations</p>
        </div>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
            activeTab === "branches"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Branches
        </button>
        <button
          onClick={() => setActiveTab("districts")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
            activeTab === "districts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Districts
        </button>
      </div>

      {activeTab === "branches" ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Branches</CardTitle>
              <CardDescription>View and manage all local congregations</CardDescription>
            </div>
            <Button onClick={() => handleOpenBranchModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Branch Name</th>
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">District</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => {
                    const district = districts.find((d) => d.id === b.districtId);
                    return (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-medium flex items-center gap-2">
                          <Building className="h-4 w-4 text-primary" />
                          {b.name}
                        </td>
                        <td className="py-3 font-mono text-xs">{b.code || "—"}</td>
                        <td className="py-3 text-muted-foreground">{district?.name || "—"}</td>
                        <td className="py-3 text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {b.city && b.state ? `${b.city}, ${b.state}` : b.city || b.state || "—"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              b.enabled
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {b.enabled ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenBranchModal(b)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteBranch(b.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Districts</CardTitle>
              <CardDescription>Group branches into geographic regions</CardDescription>
            </div>
            <Button onClick={() => handleOpenDistrictModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add District
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">District Name</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{d.name}</td>
                      <td className="py-3 text-muted-foreground">{d.description || "—"}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDistrictModal(d)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteDistrict(d.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Modal */}
      <Dialog open={branchModalOpen} onOpenChange={setBranchModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
            <DialogDescription>Configure details for this local congregation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-name">Branch Name</Label>
                <Input
                  id="b-name"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Hope Chapel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-code">Branch Code</Label>
                <Input
                  id="b-code"
                  value={branchForm.code}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g. HC"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-district">District</Label>
              <select
                id="b-district"
                value={branchForm.districtId}
                onChange={(e) => setBranchForm((prev) => ({ ...prev, districtId: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">No District (Independent)</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-email">Email</Label>
                <Input
                  id="b-email"
                  type="email"
                  value={branchForm.email}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="branch@church.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-phone">Phone</Label>
                <Input
                  id="b-phone"
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-address">Address</Label>
              <Input
                id="b-address"
                value={branchForm.address}
                onChange={(e) => setBranchForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="123 Faith Rd"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="b-city">City</Label>
                <Input
                  id="b-city"
                  value={branchForm.city}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-state">State</Label>
                <Input
                  id="b-state"
                  value={branchForm.state}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="ST"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-zip">ZIP</Label>
                <Input
                  id="b-zip"
                  value={branchForm.zipCode}
                  onChange={(e) => setBranchForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="12345"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBranchForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {branchForm.enabled ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-red-500" />
                )}
                Enabled
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBranchModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBranch}>Save Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* District Modal */}
      <Dialog open={districtModalOpen} onOpenChange={setDistrictModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDistrict ? "Edit District" : "Add District"}</DialogTitle>
            <DialogDescription>Create geographical region grouping branches</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="d-name">District Name</Label>
              <Input
                id="d-name"
                value={districtForm.name}
                onChange={(e) => setDistrictForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. North District"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-desc">Description</Label>
              <Textarea
                id="d-desc"
                value={districtForm.description}
                onChange={(e) => setDistrictForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Regional details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDistrictModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDistrict}>Save District</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
