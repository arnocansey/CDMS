"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldOff, Copy, RefreshCw, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesCount: number;
}

export default function TwoFactorPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<TwoFactorStatus>({ enabled: false, backupCodesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<"idle" | "qr" | "verify">("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/2fa/status");
      setStatus(res.data);
    } catch {
      toast.error("Failed to load 2FA status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchStatus();
  }, [isAuthenticated]);

  const handleSetup = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/2fa/setup");
      const uri = res.data.qrCodeUri || res.data.qrCode || "";
      const imgSrc = uri.startsWith("otpauth://")
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`
        : uri;
      setQrCode(imgSrc);
      setSecret(res.data.secret);
      setSetupStep("qr");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start 2FA setup");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnable = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/2fa/enable", { code: verifyCode });
      setBackupCodes(res.data.backupCodes || []);
      setShowBackupCodes(true);
      setSetupStep("idle");
      toast.success("2FA enabled successfully");
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/2fa/disable", { password });
      toast.success("2FA disabled successfully");
      setDisableDialogOpen(false);
      setPassword("");
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/2fa/backup-codes");
      setBackupCodes(res.data.backupCodes || []);
      setShowBackupCodes(true);
      toast.success("New backup codes generated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to regenerate codes");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const copyAllBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("All backup codes copied");
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
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Two-Factor Authentication</h2>
        <p className="text-muted-foreground">Add an extra layer of security to your account</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status.enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
                2FA Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Two-Factor Authentication</span>
                <Badge variant={status.enabled ? "default" : "secondary"}>
                  {status.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {status.enabled && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Backup Codes Available</span>
                  <span className="font-medium">{status.backupCodesCount}</span>
                </div>
              )}

              {status.enabled ? (
                <div className="space-y-2 pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleRegenerateBackupCodes}
                    disabled={submitting}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Backup Codes
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setDisableDialogOpen(true)}
                  >
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleSetup} disabled={submitting}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {submitting ? "Setting up..." : "Enable 2FA"}
                </Button>
              )}
            </CardContent>
          </Card>

          {setupStep === "qr" && (
            <Card>
              <CardHeader>
                <CardTitle>Setup 2FA</CardTitle>
                <CardDescription>Scan this QR code with your authenticator app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-lg border bg-white p-4">
                    {qrCode ? (
                      <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center bg-muted text-muted-foreground">
                        Loading QR code...
                      </div>
                    )}
                  </div>
                </div>
                {secret && (
                  <div className="space-y-2">
                    <Label>Manual Entry Key</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                      <code className="flex-1 break-all text-sm">{secret}</code>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(secret)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <Input
                    placeholder="Enter 6-digit code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSetupStep("idle")}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleEnable} disabled={submitting}>
                    {submitting ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showBackupCodes && backupCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Backup Codes</CardTitle>
                <CardDescription>
                  Save these codes in a safe place. Each code can only be used once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <code key={i} className="text-sm font-mono">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={copyAllBackupCodes}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button className="flex-1" onClick={() => setShowBackupCodes(false)}>
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!status.enabled && setupStep === "idle" && (
            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </div>
                  <p>Click &quot;Enable 2FA&quot; to generate a QR code</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </div>
                  <p>Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    3
                  </div>
                  <p>Enter the 6-digit verification code to confirm</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    4
                  </div>
                  <p>Save your backup codes in a secure location</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling 2FA. This will reduce your account security.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisable} disabled={submitting}>
                {submitting ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
