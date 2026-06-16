"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, Upload, Save, Eye } from "lucide-react";
import { toast } from "sonner";

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  darkLogoUrl: string;
  customCss: string;
}

export default function BrandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<BrandingConfig>({
    primaryColor: "#4f46e5",
    secondaryColor: "#0ea5e9",
    logoUrl: "",
    darkLogoUrl: "",
    customCss: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<"light" | "dark" | null>(null);
  const lightLogoRef = useRef<HTMLInputElement>(null);
  const darkLogoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/white-label");
      if (res.data) {
        setConfig((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      toast.error("Failed to load branding config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchConfig();
  }, [isAuthenticated]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/white-label", {
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        customCss: config.customCss,
      });
      toast.success("Branding saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (mode: "light" | "dark", file: File) => {
    setUploadingLogo(mode);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const endpoint = mode === "dark" ? "/white-label/logo-dark" : "/white-label/logo";
      const res = await api.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (mode === "dark") {
        setConfig((prev) => ({ ...prev, darkLogoUrl: res.data.url }));
      } else {
        setConfig((prev) => ({ ...prev, logoUrl: res.data.url }));
      }
      toast.success(`${mode === "dark" ? "Dark" : "Light"} logo uploaded`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">White-label Branding</h2>
          <p className="text-muted-foreground">Customize the look and feel of your church portal</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Set your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#4f46e5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <Input
                    value={config.secondaryColor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#0ea5e9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Upload your church logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Light Mode Logo</Label>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => lightLogoRef.current?.click()}
                >
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Light logo"
                      className="max-h-16 object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </>
                  )}
                </div>
                <input
                  ref={lightLogoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload("light", file);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Dark Mode Logo</Label>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => darkLogoRef.current?.click()}
                >
                  {config.darkLogoUrl ? (
                    <img
                      src={config.darkLogoUrl}
                      alt="Dark logo"
                      className="max-h-16 object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </>
                  )}
                </div>
                <input
                  ref={darkLogoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload("dark", file);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom styles to override defaults</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder=":root { --primary: #4f46e5; }"
                value={config.customCss}
                onChange={(e) => setConfig((prev) => ({ ...prev, customCss: e.target.value }))}
                className="font-mono text-sm min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border p-6 space-y-4"
                style={{
                  // @ts-ignore
                  "--preview-primary": config.primaryColor,
                  // @ts-ignore
                  "--preview-secondary": config.secondaryColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    C
                  </div>
                  <div>
                    <p className="font-bold">Church Name</p>
                    <p className="text-sm text-muted-foreground">Community Church</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-md px-4 py-2 text-white text-sm font-medium"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="rounded-md px-4 py-2 text-white text-sm font-medium"
                    style={{ backgroundColor: config.secondaryColor }}
                  >
                    Secondary Button
                  </button>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <p className="font-medium">Card Title</p>
                  <p className="text-sm text-muted-foreground">
                    This is a preview of how your branding will look across the application.
                  </p>
                  <div
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Badge Preview
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <span className="text-sm">Primary</span>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: config.secondaryColor }}
                  />
                  <span className="text-sm">Secondary</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
