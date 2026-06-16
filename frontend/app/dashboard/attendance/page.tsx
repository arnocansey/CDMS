"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAttendance, useRecordAttendance, useMembers } from "@/hooks/use-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function AttendancePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [serviceType, setServiceType] = useState("SUNDAY_SERVICE");
  const [present, setPresent] = useState(true);

  const { data: attendance = [], isLoading: isFetching } = useAttendance(selectedDate);
  const { data: membersData } = useMembers({ page: 0, size: 200 });
  const recordMutation = useRecordAttendance();

  const membersList = membersData?.content || membersData || [];

  const filteredMembers = Array.isArray(membersList)
    ? membersList.filter((m: any) => {
        const query = memberSearch.toLowerCase();
        return (
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query)
        );
      })
    : [];

  const selectedMemberName = memberId
    ? filteredMembers.find((m: any) => String(m.id) === memberId)
    : null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const presentCount = attendance.filter((a: any) => a.present).length;
  const absentCount = attendance.filter((a: any) => !a.present).length;

  const handleRecordAttendance = () => {
    if (!memberId) {
      toast.error("Please select a member");
      return;
    }
    recordMutation.mutate(
      {
        memberId: Number(memberId),
        serviceDate: selectedDate,
        serviceType,
        present,
      },
      {
        onSuccess: () => {
          toast.success("Attendance recorded successfully");
          setDialogOpen(false);
          setMemberId("");
          setMemberSearch("");
          setMemberDropdownOpen(false);
          setServiceType("SUNDAY_SERVICE");
          setPresent(true);
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Failed to record attendance";
          toast.error(message);
        },
      }
    );
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
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Member</Label>
                <div className="relative">
                  <Input
                    placeholder="Search members by name or email..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setMemberDropdownOpen(true);
                      if (memberId) {
                        setMemberId("");
                      }
                    }}
                    onFocus={() => setMemberDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setMemberDropdownOpen(false), 200)}
                  />
                  {selectedMemberName && !memberSearch && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground">
                      {selectedMemberName.firstName} {selectedMemberName.lastName}
                    </div>
                  )}
                  {memberDropdownOpen && memberSearch && filteredMembers.length > 0 && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                      {filteredMembers.map((member: any) => (
                        <button
                          key={member.id}
                          type="button"
                          className={`flex w-full items-center px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                            memberId === String(member.id) ? "bg-accent" : ""
                          }`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setMemberId(String(member.id));
                            setMemberSearch("");
                            setMemberDropdownOpen(false);
                          }}
                        >
                          {member.firstName} {member.lastName}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {member.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {memberDropdownOpen && memberSearch && filteredMembers.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
                      No members found.
                    </div>
                  )}
                </div>
                {memberId && selectedMemberName && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedMemberName.firstName} {selectedMemberName.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Service Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUNDAY_SERVICE">Sunday Service</SelectItem>
                    <SelectItem value="WEDNESDAY_SERVICE">Wednesday Service</SelectItem>
                    <SelectItem value="FRIDAY_PRAYER">Friday Prayer</SelectItem>
                    <SelectItem value="BIBLE_STUDY">Bible Study</SelectItem>
                    <SelectItem value="SPECIAL_EVENT">Special Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={present ? "present" : "absent"} onValueChange={(v) => setPresent(v === "present")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordAttendance} disabled={recordMutation.isPending}>
                {recordMutation.isPending ? "Recording..." : "Record Attendance"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendance.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Member</th>
                    <th className="p-4 text-left font-medium">Service Type</th>
                    <th className="p-4 text-left font-medium">Check In Time</th>
                    <th className="p-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No attendance records for this date.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((record: any) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{record.memberName}</td>
                        <td className="p-4">
                          {record.serviceType?.replace(/_/g, " ")}
                        </td>
                        <td className="p-4">
                          {record.checkInTime
                            ? new Date(record.checkInTime).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td className="p-4">
                          {record.present ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <Check className="h-4 w-4" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <X className="h-4 w-4" />
                              Absent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
