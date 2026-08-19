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
import { Smartphone, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface PaystackGivingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GHANA_PRESETS = ["20", "50", "100", "200", "500"];

export function PaystackGivingDialog({
  open,
  onOpenChange,
}: PaystackGivingDialogProps) {
  const [amount, setAmount] = useState<string>("50");
  const [category, setCategory] = useState<string>("TITHE");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGive = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid GH₵ amount");
      return;
    }
    if (!email) {
      toast.error("Please enter your email address for the MoMo receipt");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/finance/paystack/initialize-giving", {
        amount: parseFloat(amount),
        category,
        email,
        callbackUrl: window.location.href,
      });

      if (response.data?.authorization_url) {
        toast.success("Opening Paystack MoMo Checkout...");
        window.location.href = response.data.authorization_url;
      } else {
        toast.error("Failed to get payment checkout link.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">Online Giving (MoMo & Card)</DialogTitle>
              <DialogDescription className="text-xs">
                Pay Tithes, Seed & Offerings via MTN Mobile Money, Telecel Cash, AT Money or Card.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* MoMo Provider Badge Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-medium">
            <span>📱 Supported Networks:</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded text-[10px]">MTN MoMo</span>
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px]">Telecel</span>
            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">AT Money</span>
          </div>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Giving Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TITHE">✉️ Tithe</SelectItem>
                <SelectItem value="OFFERING">🪙 Sunday Offering</SelectItem>
                <SelectItem value="GENERAL_DONATION">🎁 General Donation / Thanksgiving</SelectItem>
                <SelectItem value="BUILDING_FUND">🏗️ Building & Project Fund</SelectItem>
                <SelectItem value="WELFARE">🤝 Welfare & Benevolence</SelectItem>
                <SelectItem value="MISSIONS">🌍 Missions & Evangelism</SelectItem>
                <SelectItem value="PLEDGE_PAYMENT">📜 Harvest & Pledge Seed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Quick Amount (GH₵)</Label>
            <div className="flex items-center gap-2">
              {GHANA_PRESETS.map((val) => (
                <Button
                  key={val}
                  type="button"
                  size="sm"
                  variant={amount === val ? "default" : "outline"}
                  className={amount === val ? "bg-amber-600 hover:bg-amber-700 text-white font-bold" : ""}
                  onClick={() => setAmount(val)}
                >
                  GH₵ {val}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Custom Amount (GH₵)</Label>
            <Input
              type="number"
              step="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Donor Email (For MoMo Electronic Receipt)</Label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 text-base flex items-center justify-center gap-2 mt-2"
            disabled={loading}
            onClick={handleGive}
          >
            <Smartphone className="h-5 w-5" />
            {loading ? "Initializing..." : `Pay GH₵ ${amount || "0.00"} via MoMo / Card`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
