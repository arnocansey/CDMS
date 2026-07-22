"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useMembers, useDepartments, useBranches } from "@/hooks/use-queries";
import api from "@/lib/api";
import { memberSchema, type MemberFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { PageSpinner } from "@/components/page-spinner";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function MembersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState<{
    page?: number;
    size?: number;
    search?: string;
  }>({ page: 0, size: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data, isLoading: isDataLoading, isError } = useMembers(searchParams);
  const { data: departments = [] } = useDepartments();
  const { data: branches = [] } = useBranches();
  const members = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = searchParams.page ?? 0;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: { active: true },
  });

  const activeValue = watch("active");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (editingMember) {
      reset({
        firstName: editingMember.firstName,
        lastName: editingMember.lastName,
        email: editingMember.email,
        phone: editingMember.phone ?? "",
        gender: editingMember.gender,
        dateOfBirth: editingMember.dateOfBirth ?? "",
        address: editingMember.address ?? "",
        city: editingMember.city ?? "",
        state: editingMember.state ?? "",
        zipCode: editingMember.zipCode ?? "",
        membershipDate: editingMember.membershipDate ?? "",
        baptismDate: editingMember.baptismDate ?? "",
        photoUrl: editingMember.photoUrl ?? "",
        active: editingMember.active ?? true,
        departmentId: editingMember.departmentId ?? undefined,
        branchId: editingMember.branchId ?? undefined,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: undefined,
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        membershipDate: "",
        baptismDate: "",
        photoUrl: "",
        active: true,
        departmentId: undefined,
        branchId: undefined,
      });
    }
  }, [editingMember, reset]);

  const searchMembers = () => {
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      search: searchQuery.trim() || undefined,
    }));
  };

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await api.delete(`/members/${pendingDeleteId}`);
      toast.success("Member deleted");
      setSearchParams((prev) => ({ ...prev }));
    } catch (error) {
      toast.error("Failed to delete member");
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const onSubmit = async (formData: MemberFormData) => {
    try {
      const payload = { ...formData, phone: formData.phone || "" };
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, payload);
        toast.success("Member updated");
      } else {
        await api.post("/members", payload);
        toast.success("Member added");
      }
      setDialogOpen(false);
      setEditingMember(null);
      reset();
      setSearchParams((prev) => ({ ...prev }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save member");
    }
  };

  const openCreateDialog = () => {
    setEditingMember(null);
    reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: undefined,
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      membershipDate: "",
      baptismDate: "",
      photoUrl: "",
      active: true,
      departmentId: undefined,
      branchId: undefined,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (member: any) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return <PageSpinner className="min-h-[50vh]" />;
  }

  if (isDataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-9 max-w-sm flex-1" />
          <Skeleton className="h-9 w-20" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        <p className="text-destructive">Failed to load members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMembers()}
          />
        </div>
        <Button variant="outline" onClick={searchMembers}>
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">Phone</th>
                  <th className="p-4 text-left font-medium">Gender</th>
                  <th className="p-4 text-left font-medium">Department</th>
                  <th className="p-4 text-left font-medium">Branch</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member: any) => (
                  <tr key={member.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Link
                        href={`/dashboard/members/${member.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                    </td>
                    <td className="p-4">{member.email}</td>
                    <td className="p-4">{member.phone || "—"}</td>
                    <td className="p-4">{member.gender?.replace("_", " ") || "—"}</td>
                    <td className="p-4">{member.departmentName || "—"}</td>
                    <td className="p-4">{member.branchName || "—"}</td>
                    <td className="p-4">
                      <StatusBadge status={member.active ? "active" : "inactive"} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/members/${member.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => requestDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={Users}
                        title="No members found"
                        description="Add your first member to get started."
                        actionLabel="Add Member"
                        onAction={openCreateDialog}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 0}
                  onClick={() =>
                    setSearchParams((prev) => ({
                      ...prev,
                      page: Math.max(0, (prev.page ?? 0) - 1),
                    }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() =>
                    setSearchParams((prev) => ({
                      ...prev,
                      page: (prev.page ?? 0) + 1,
                    }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update member information below."
                : "Fill in the details to add a new member."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="John" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Doe" {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 123-4567" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })} defaultValue={editingMember?.gender}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select onValueChange={(v) => setValue("departmentId", parseInt(v), { shouldValidate: true })} defaultValue={editingMember?.departmentId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {(departments as any[]).map((d: any) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select onValueChange={(v) => setValue("branchId", parseInt(v), { shouldValidate: true })} defaultValue={editingMember?.branchId?.toString()}>
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {(branches as any[]).map((b: any) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St" {...register("address")} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Springfield" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="IL" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input id="zipCode" placeholder="62701" {...register("zipCode")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="membershipDate">Membership Date</Label>
                <Input id="membershipDate" type="date" {...register("membershipDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baptismDate">Baptism Date</Label>
                <Input id="baptismDate" type="date" {...register("baptismDate")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input id="photoUrl" placeholder="https://example.com/photo.jpg" {...register("photoUrl")} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                className="h-4 w-4 rounded border-gray-300"
                checked={activeValue ?? true}
                onChange={(e) => setValue("active", e.target.checked)}
              />
              <Label htmlFor="active" className="text-sm font-medium">Active Member</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingMember ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete member?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
