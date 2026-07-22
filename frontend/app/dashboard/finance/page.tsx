"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useFinancialData, useFinanceSummary, useMembers, useBranches } from "@/hooks/use-queries";
import api from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
import {
  donationSchema,
  titheSchema,
  offeringSchema,
  expenseSchema,
  type DonationFormData,
  type TitheFormData,
  type OfferingFormData,
  type ExpenseFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingDown, Wallet, Plus, Download } from "lucide-react";
import { toast } from "sonner";

type TransactionTab = "donation" | "tithe" | "offering" | "expense";
type ListTab = "donations" | "tithes" | "offerings" | "expenses";

const PAGE_SIZE = 20;

function FinancePagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages} ({totalElements} total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionTab>("donation");
  const [listTab, setListTab] = useState<ListTab>("donations");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pages, setPages] = useState({
    donations: 0,
    tithes: 0,
    offerings: 0,
    expenses: 0,
  });

  const dateParams =
    startDate && endDate ? { startDate, endDate } : undefined;
  const { data: financialData, isLoading: isDataLoading, isError: isFinanceError } = useFinancialData({
    ...dateParams,
    size: PAGE_SIZE,
    pages,
  });
  const { data: financeSummary } = useFinanceSummary();
  const { data: membersData } = useMembers({ size: 1000 });
  const members = membersData?.content ?? [];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setPages({ donations: 0, tithes: 0, offerings: 0, expenses: 0 });
  }, [startDate, endDate]);

  const donations = financialData?.donations ?? [];
  const tithes = financialData?.tithes ?? [];
  const offerings = financialData?.offerings ?? [];
  const expenses = financialData?.expenses ?? [];
  const meta = financialData?.meta;

  const totalIncome = Number(financeSummary?.totalDonations ?? 0);
  const totalExpenses = Number(financeSummary?.totalExpenses ?? 0);
  const netBalance = Number(financeSummary?.netBalance ?? totalIncome - totalExpenses);

  const setPageFor = (tab: ListTab, page: number) => {
    setPages((prev) => ({ ...prev, [tab]: page }));
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
        <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`${API_BASE}/reports/financial/pdf` + (dateParams ? `?startDate=${startDate}&endDate=${endDate}` : ""), "_blank")}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`${API_BASE}/reports/financial/excel` + (dateParams ? `?startDate=${startDate}&endDate=${endDate}` : ""), "_blank")}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Transaction
          </Button>
        </div>
      </div>

      {isFinanceError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load financial data. Please refresh and try again.
        </div>
      )}

      <div className="flex items-center gap-4">
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={listTab}
        onValueChange={(v) => setListTab(v as ListTab)}
      >
        <TabsList>
          <TabsTrigger value="donations">
            Donations ({meta?.donations?.totalElements ?? donations.length})
          </TabsTrigger>
          <TabsTrigger value="tithes">
            Tithes ({meta?.tithes?.totalElements ?? tithes.length})
          </TabsTrigger>
          <TabsTrigger value="offerings">
            Offerings ({meta?.offerings?.totalElements ?? offerings.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses ({meta?.expenses?.totalElements ?? expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Member</th>
                      <th className="p-4 text-left font-medium">Category</th>
                      <th className="p-4 text-left font-medium">Amount</th>
                      <th className="p-4 text-left font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d: any) => (
                      <tr key={d.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{d.donationDate}</td>
                        <td className="p-4">{d.memberName || "—"}</td>
                        <td className="p-4">{d.category}</td>
                        <td className="p-4 font-medium">${d.amount?.toLocaleString()}</td>
                        <td className="p-4">{d.paymentMethod || "—"}</td>
                      </tr>
                    ))}
                    {donations.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{isDataLoading ? "Loading..." : "No donations found"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FinancePagination
                page={pages.donations}
                totalPages={meta?.donations?.totalPages ?? 0}
                totalElements={meta?.donations?.totalElements ?? 0}
                onPageChange={(page) => setPageFor("donations", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tithes">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Member</th>
                      <th className="p-4 text-left font-medium">Amount</th>
                      <th className="p-4 text-left font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tithes.map((t: any) => (
                      <tr key={t.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{t.titheDate}</td>
                        <td className="p-4">{t.memberName || "—"}</td>
                        <td className="p-4 font-medium">${t.amount?.toLocaleString()}</td>
                        <td className="p-4">{t.paymentMethod || "—"}</td>
                      </tr>
                    ))}
                    {tithes.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">{isDataLoading ? "Loading..." : "No tithes found"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FinancePagination
                page={pages.tithes}
                totalPages={meta?.tithes?.totalPages ?? 0}
                totalElements={meta?.tithes?.totalElements ?? 0}
                onPageChange={(page) => setPageFor("tithes", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offerings">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Service</th>
                      <th className="p-4 text-left font-medium">Type</th>
                      <th className="p-4 text-left font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerings.map((o: any) => (
                      <tr key={o.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{o.serviceDate}</td>
                        <td className="p-4">{o.serviceType}</td>
                        <td className="p-4">{o.offeringType || "—"}</td>
                        <td className="p-4 font-medium">${o.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {offerings.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">{isDataLoading ? "Loading..." : "No offerings found"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FinancePagination
                page={pages.offerings}
                totalPages={meta?.offerings?.totalPages ?? 0}
                totalElements={meta?.offerings?.totalElements ?? 0}
                onPageChange={(page) => setPageFor("offerings", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Category</th>
                      <th className="p-4 text-left font-medium">Description</th>
                      <th className="p-4 text-left font-medium">Amount</th>
                      <th className="p-4 text-left font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e: any) => (
                      <tr key={e.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{e.expenseDate}</td>
                        <td className="p-4">{e.category}</td>
                        <td className="p-4">{e.description || "—"}</td>
                        <td className="p-4 font-medium text-red-600">${e.amount?.toLocaleString()}</td>
                        <td className="p-4">{e.paymentMethod || "—"}</td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{isDataLoading ? "Loading..." : "No expenses found"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FinancePagination
                page={pages.expenses}
                totalPages={meta?.expenses?.totalPages ?? 0}
                totalElements={meta?.expenses?.totalElements ?? 0}
                onPageChange={(page) => setPageFor("expenses", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        members={members}
      />
    </div>
  );
}

function TransactionDialog({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  members,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  members: any[];
}) {
  const { data: branches = [] } = useBranches();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>Select a transaction type and fill in the details.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={activeTab} onValueChange={(v) => onTabChange(v as TransactionTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="donation">Donation</TabsTrigger>
            <TabsTrigger value="tithe">Tithe</TabsTrigger>
            <TabsTrigger value="offering">Offering</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
          </TabsList>

          <TabsContent value="donation">
            <DonationForm onSuccess={() => onOpenChange(false)} members={members} branches={branches} />
          </TabsContent>
          <TabsContent value="tithe">
            <TitheForm onSuccess={() => onOpenChange(false)} members={members} branches={branches} />
          </TabsContent>
          <TabsContent value="offering">
            <OfferingForm onSuccess={() => onOpenChange(false)} branches={branches} />
          </TabsContent>
          <TabsContent value="expense">
            <ExpenseForm onSuccess={() => onOpenChange(false)} branches={branches} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DonationForm({ onSuccess, members, branches }: { onSuccess: () => void; members: any[]; branches: any[] }) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: { donationDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: DonationFormData) => {
    try {
      await api.post("/finance/donations", data);
      toast.success("Donation recorded");
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record donation");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Amount ($)</Label>
        <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("category", v as any, { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="BUILDING_FUND">Building Fund</SelectItem>
              <SelectItem value="WELFARE">Welfare</SelectItem>
              <SelectItem value="SPECIAL">Special</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select onValueChange={(v) => setValue("branchId", parseInt(v), { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register("donationDate")} />
        {errors.donationDate && <p className="text-sm text-red-500">{errors.donationDate.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select onValueChange={(v) => setValue("paymentMethod", v as any)}>
          <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CHECK">Check</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="MOBILE">Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Optional note" {...register("description")} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Record Donation"}
      </Button>
    </form>
  );
}

function TitheForm({ onSuccess, members, branches }: { onSuccess: () => void; members: any[]; branches: any[] }) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<TitheFormData>({
    resolver: zodResolver(titheSchema),
    defaultValues: { titheDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: TitheFormData) => {
    try {
      await api.post("/finance/tithes", data);
      toast.success("Tithe recorded");
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record tithe");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Member</Label>
          <Select onValueChange={(v) => setValue("memberId", parseInt(v), { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              {members.map((m: any) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.firstName} {m.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.memberId && <p className="text-sm text-red-500">{errors.memberId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select onValueChange={(v) => setValue("branchId", parseInt(v), { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Amount ($)</Label>
        <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register("titheDate")} />
        {errors.titheDate && <p className="text-sm text-red-500">{errors.titheDate.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select onValueChange={(v) => setValue("paymentMethod", v as any)}>
          <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CHECK">Check</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="MOBILE">Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Record Tithe"}
      </Button>
    </form>
  );
}

function OfferingForm({ onSuccess, branches }: { onSuccess: () => void; branches: any[] }) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<OfferingFormData>({
    resolver: zodResolver(offeringSchema),
    defaultValues: { serviceDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: OfferingFormData) => {
    try {
      await api.post("/finance/offerings", data);
      toast.success("Offering recorded");
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record offering");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select onValueChange={(v) => setValue("serviceType", v as any, { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SUNDAY">Sunday</SelectItem>
              <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
              <SelectItem value="FRIDAY">Friday</SelectItem>
              <SelectItem value="SPECIAL">Special</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.serviceType && <p className="text-sm text-red-500">{errors.serviceType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select onValueChange={(v) => setValue("branchId", parseInt(v), { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Amount ($)</Label>
        <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register("serviceDate")} />
        {errors.serviceDate && <p className="text-sm text-red-500">{errors.serviceDate.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Offering Type</Label>
        <Select onValueChange={(v) => setValue("offeringType", v as any)}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="THANKSGIVING">Thanksgiving</SelectItem>
            <SelectItem value="SEED">Seed</SelectItem>
            <SelectItem value="MISCELLANEOUS">Miscellaneous</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Optional note" {...register("description")} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Record Offering"}
      </Button>
    </form>
  );
}

function ExpenseForm({ onSuccess, branches }: { onSuccess: () => void; branches: any[] }) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expenseDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await api.post("/finance/expenses", data);
      toast.success("Expense recorded");
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record expense");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue("category", v as any, { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="UTILITIES">Utilities</SelectItem>
              <SelectItem value="SALARIES">Salaries</SelectItem>
              <SelectItem value="EVANGELISM">Evangelism</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
              <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
              <SelectItem value="WELFARE">Welfare</SelectItem>
              <SelectItem value="MISCELLANEOUS">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select onValueChange={(v) => setValue("branchId", parseInt(v), { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Amount ($)</Label>
        <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register("expenseDate")} />
        {errors.expenseDate && <p className="text-sm text-red-500">{errors.expenseDate.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select onValueChange={(v) => setValue("paymentMethod", v as any)}>
          <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CHECK">Check</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="MOBILE">Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Optional note" {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label>Approved By</Label>
        <Input placeholder="Approver name" {...register("approvedBy")} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Record Expense"}
      </Button>
    </form>
  );
}
