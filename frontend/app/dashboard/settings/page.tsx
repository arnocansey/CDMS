"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Save, Upload, Settings, Church } from "lucide-react";

const currencies = ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR", "INR", "CAD", "AUD"];

export default function ChurchSettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    currency: "USD",
    currencySymbol: "$",
    fiscalYearStartMonth: 1,
    emailFromName: "",
    emailFromAddress: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/church-settings");
      const data = response.data;
      setForm({
        name: data.name || "",
        slug: data.slug || "",
        phone: data.phone || "",
        website: data.website || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
        currency: data.currency || "USD",
        currencySymbol: data.currencySymbol || "$",
        fiscalYearStartMonth: data.fiscalYearStartMonth || 1,
        emailFromName: data.emailFromName || "",
        emailFromAddress: data.emailFromAddress || "",
      });
      if (data.logoUrl) {
        setLogoPreview(data.logoUrl);
      }
    } catch (error) {
      console.log("No existing settings found");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/church-settings", form);
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await api.post("/church-settings/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoPreview(response.data.logoUrl || URL.createObjectURL(file));
      toast.success("Logo uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Church Settings</h2>
          <p className="text-muted-foreground">Configure your church information and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/settings/branches">
              <Church className="mr-2 h-4 w-4" />
              Branches & Districts
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic details about your church</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Church Name</Label>
              <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Church name" />
            </div>
            <div className="space-y-2">
              <Label>Church Slug</Label>
              <div className="flex items-center gap-2">
                <Input value={form.slug || ""} disabled className="bg-muted font-mono text-sm" />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  asChild
                >
                  <a href={`/${form.slug}`} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/${form.slug}`);
                    toast.success("Public page URL copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Public page: <a href={`/${form.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">/{form.slug || "..."}</a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://www.church.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="ST" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" value={form.zip} onChange={(e) => updateField("zip", e.target.value)} placeholder="12345" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Settings</CardTitle>
            <CardDescription>Configure currency and fiscal year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input id="currencySymbol" value={form.currencySymbol} onChange={(e) => updateField("currencySymbol", e.target.value)} placeholder="$" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year Start Month</Label>
              <select
                id="fiscalYear"
                value={form.fiscalYearStartMonth}
                onChange={(e) => updateField("fiscalYearStartMonth", parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Upload your church logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                </div>
              )}
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure outgoing email settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailFromName">From Name</Label>
              <Input id="emailFromName" value={form.emailFromName} onChange={(e) => updateField("emailFromName", e.target.value)} placeholder="Church Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailFromAddress">From Address</Label>
              <Input id="emailFromAddress" type="email" value={form.emailFromAddress} onChange={(e) => updateField("emailFromAddress", e.target.value)} placeholder="noreply@church.com" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
