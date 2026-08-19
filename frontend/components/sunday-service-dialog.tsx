"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Church, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface SundayServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  onSuccess?: () => void;
}

interface TitheRow {
  memberId: string;
  envelopeNumber: string;
  amount: string;
}

export function SundayServiceDialog({
  open,
  onOpenChange,
  members,
  onSuccess,
}: SundayServiceDialogProps) {
  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [serviceName, setServiceName] = useState<string>("1st Sunday Service");
  const [firstOffering, setFirstOffering] = useState<string>("");
  const [secondOffering, setSecondOffering] = useState<string>("");
  const [buildingFund, setBuildingFund] = useState<string>("");
  const [welfareFund, setWelfareFund] = useState<string>("");
  const [tithes, setTithes] = useState<TitheRow[]>([
    { memberId: "", envelopeNumber: "", amount: "" },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const addTitheRow = () => {
    setTithes([...tithes, { memberId: "", envelopeNumber: "", amount: "" }]);
  };

  const removeTitheRow = (index: number) => {
    setTithes(tithes.filter((_, i) => i !== index));
  };

  const updateTitheRow = (index: number, field: keyof TitheRow, value: string) => {
    const updated = [...tithes];
    updated[index][field] = value;
    setTithes(updated);
  };

  const handleBatchSave = async () => {
    try {
      setLoading(true);
      const payload = {
        serviceDate,
        serviceName,
        firstOffering: firstOffering ? parseFloat(firstOffering) : 0,
        secondOffering: secondOffering ? parseFloat(secondOffering) : 0,
        buildingFund: buildingFund ? parseFloat(buildingFund) : 0,
        welfareFund: welfareFund ? parseFloat(welfareFund) : 0,
        tithes: tithes
          .filter((t) => t.amount && parseFloat(t.amount) > 0)
          .map((t) => ({
            memberId: t.memberId || null,
            envelopeNumber: t.envelopeNumber || "",
            amount: parseFloat(t.amount),
          })),
      };

      const res = await api.post("/finance/sunday-batch", payload);
      toast.success(res.data?.message || "Sunday Service collection saved!");
      onOpenChange(false);
      if (onSuccess) onSuccess();

      // Reset form
      setFirstOffering("");
      setSecondOffering("");
      setBuildingFund("");
      setWelfareFund("");
      setTithes([{ memberId: "", envelopeNumber: "", amount: "" }]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save Sunday collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Church className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Record Sunday Collection (Quick Entry)</DialogTitle>
              <DialogDescription>
                Enter all offerings, seeds, and envelope tithes from today's service in one easy form.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-lg">
            <div className="space-y-1">
              <Label className="text-xs">Service Date</Label>
              <Input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Service Name</Label>
              <Select value={serviceName} onValueChange={setServiceName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Sunday Service">1st Sunday Service</SelectItem>
                  <SelectItem value="2nd Sunday Service">2nd Sunday Service</SelectItem>
                  <SelectItem value="Joint / Communion Service">Joint / Communion Service</SelectItem>
                  <SelectItem value="Mid-week Service">Mid-week Service</SelectItem>
                  <SelectItem value="All Night / Revival">All Night / Revival</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 1: Offerings & Funds */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>🪙 Church Offerings & Funds (GH₵)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">1st Offering (GH₵)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={firstOffering}
                  onChange={(e) => setFirstOffering(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">2nd Offering / Seed</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={secondOffering}
                  onChange={(e) => setSecondOffering(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Building Fund (GH₵)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={buildingFund}
                  onChange={(e) => setBuildingFund(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Welfare Contribution</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={welfareFund}
                  onChange={(e) => setWelfareFund(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Envelope Tithes */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                ✉️ Member Envelope Tithes (GH₵)
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addTitheRow}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Envelope
              </Button>
            </div>

            <div className="space-y-2">
              {tithes.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      value={row.memberId}
                      onValueChange={(val) => updateTitheRow(idx, "memberId", val)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select Member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m: any) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.firstName} {m.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28">
                    <Input
                      placeholder="Env #"
                      className="text-xs"
                      value={row.envelopeNumber}
                      onChange={(e) => updateTitheRow(idx, "envelopeNumber", e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="GH₵ Amount"
                      className="text-xs"
                      value={row.amount}
                      onChange={(e) => updateTitheRow(idx, "amount", e.target.value)}
                    />
                  </div>
                  {tithes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeTitheRow(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 mt-4"
            disabled={loading}
            onClick={handleBatchSave}
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? "Saving Service Entries..." : "Save All Sunday Collections (GH₵)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
