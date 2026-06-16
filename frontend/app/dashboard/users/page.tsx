"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { useUsers } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, UserCog, Trash2 } from "lucide-react";
import { toast } from "sonner";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "DEPARTMENT_LEADER", "MEMBER"], {
    required_error: "Role is required",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
}

export default function UsersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], refetch } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (editingUser) {
      reset({
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.roles[0] as UserFormData["role"],
      });
    } else {
      reset({ firstName: "", lastName: "", email: "", role: undefined });
    }
  }, [editingUser, reset]);

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const onSubmit = async (formData: UserFormData) => {
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        enabled: true,
        roles: [formData.role],
      };
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/users", payload);
        toast.success("User created");
      }
      setDialogOpen(false);
      setEditingUser(null);
      reset();
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    reset({ firstName: "", lastName: "", email: "", role: undefined });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "PASTOR":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "SECRETARY":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "TREASURER":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "DEPARTMENT_LEADER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">Roles</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role: string) => (
                          <span
                            key={role}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleColor(
                              role
                            )}`}
                          >
                            {role.replace("ROLE_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user details below."
                : "Fill in the details to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@church.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                onValueChange={(value) =>
                  setValue("role", value as UserFormData["role"], { shouldValidate: true })
                }
                defaultValue={editingUser?.roles[0]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="PASTOR">Pastor</SelectItem>
                  <SelectItem value="SECRETARY">Secretary</SelectItem>
                  <SelectItem value="TREASURER">Treasurer</SelectItem>
                  <SelectItem value="DEPARTMENT_LEADER">Department Leader</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingUser
                    ? "Update User"
                    : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
