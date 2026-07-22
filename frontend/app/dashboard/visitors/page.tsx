"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Users,
  UserPlus,
  UserCheck,
  RefreshCw,
  Plus,
  Phone,
  Mail,
  Calendar,
  Search,
  UsersRound,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageSpinner } from "@/components/page-spinner";
import { StatusBadge } from "@/components/status-badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Visitor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  visitDate: string;
  firstVisitDate: string;
  visitCount: number;
  status: string;
  referredBy: string;
  notes: string;
  interestedInMembership: boolean;
  followUpStatus: string;
  followUpDate: string;
  followUpNotes: string;
}

export default function VisitorsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [notesText, setNotesText] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [referredBy, setReferredBy] = useState("");
  const [notes, setNotes] = useState("");
  const [interestedInMembership, setInterestedInMembership] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterTab, setFilterTab] = useState("ALL");

  const [stats, setStats] = useState<any>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendRes] = await Promise.all([
        api.get("/visitors/stats"),
        api.get("/visitors/trend?months=6"),
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data);

      let visitorsUrl = "/visitors";
      const params: string[] = [];
      if (dateFrom) params.push(`from=${dateFrom}`);
      if (dateTo) params.push(`to=${dateTo}`);
      if (params.length) visitorsUrl += `?${params.join("&")}`;

      const visitorsRes = await api.get(visitorsUrl);
      setVisitors(visitorsRes.data);
    } catch {
      toast.error("Failed to load visitor data");
    } finally {
      setLoading(false);
    }
  };

  const filterVisitors = () => {
    loadData();
  };

  const filteredVisitors = visitors.filter((v) => {
    if (filterTab === "ALL") return true;
    if (filterTab === "PENDING_FOLLOW_UP")
      return v.followUpStatus !== "NONE" && v.followUpStatus !== "COMPLETED";
    return v.followUpStatus === filterTab;
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setVisitDate(new Date().toISOString().split("T")[0]);
    setReferredBy("");
    setNotes("");
    setInterestedInMembership(false);
  };

  const handleAddVisitor = async () => {
    if (!firstName || !lastName) {
      toast.error("First name and last name are required");
      return;
    }
    try {
      await api.post("/visitors", {
        firstName,
        lastName,
        email,
        phone,
        address,
        visitDate,
        referredBy,
        notes,
        interestedInMembership,
      });
      toast.success("Visitor recorded successfully");
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record visitor");
    }
  };

  const handleFollowUp = async (id: number, status: string) => {
    try {
      await api.put(`/visitors/${id}/follow-up`, { status });
      toast.success("Follow-up updated");
      loadData();
    } catch {
      toast.error("Failed to update follow-up");
    }
  };

  const handleAddNotes = async () => {
    if (!selectedVisitor) return;
    try {
      await api.put(`/visitors/${selectedVisitor.id}/follow-up`, {
        status: selectedVisitor.followUpStatus,
        notes: notesText,
      });
      toast.success("Notes added");
      setNotesDialogOpen(false);
      setSelectedVisitor(null);
      setNotesText("");
      loadData();
    } catch {
      toast.error("Failed to add notes");
    }
  };

  const openNotesDialog = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setNotesText(visitor.followUpNotes || "");
    setNotesDialogOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return <PageSpinner className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Visitor Tracking</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Visitor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold">{stats?.totalVisitors ?? 0}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First-Time</p>
                <p className="text-2xl font-bold">{stats?.firstTime ?? 0}</p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3 text-green-600">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Returning</p>
                <p className="text-2xl font-bold">{stats?.returning ?? 0}</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-600">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold">{stats?.converted ?? 0}</p>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-3 text-purple-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No trend data available</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-auto"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-auto"
        />
        <Button variant="outline" onClick={filterVisitors}>
          <Search className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="flex gap-2">
        {["ALL", "PENDING_FOLLOW_UP", "CONTACTED", "COMPLETED"].map((tab) => (
          <Button
            key={tab}
            variant={filterTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab(tab)}
          >
            {tab === "ALL"
              ? "All"
              : tab === "PENDING_FOLLOW_UP"
              ? "Pending Follow-Up"
              : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors ({filteredVisitors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PageSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Email</th>
                    <th className="p-4 text-left font-medium">Phone</th>
                    <th className="p-4 text-left font-medium">Visit Date</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Visits</th>
                    <th className="p-4 text-left font-medium">Follow-Up</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <EmptyState
                          icon={UsersRound}
                          title="No visitors found"
                          description="Record a visitor to start tracking follow-ups."
                          actionLabel="Add Visitor"
                          onAction={() => setDialogOpen(true)}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((visitor) => (
                      <tr key={visitor.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {visitor.firstName} {visitor.lastName}
                            </p>
                            {visitor.interestedInMembership && (
                              <span className="text-xs text-purple-600">Interested in membership</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {visitor.email ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {visitor.email}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4">
                          {visitor.phone ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {visitor.phone}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {visitor.visitDate}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={visitor.status || "none"} />
                        </td>
                        <td className="p-4 text-center">{visitor.visitCount}</td>
                        <td className="p-4">
                          <StatusBadge status={visitor.followUpStatus || "none"} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {visitor.followUpStatus !== "COMPLETED" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFollowUp(visitor.id, "CONTACTED")}
                                >
                                  Contacted
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFollowUp(visitor.id, "COMPLETED")}
                                >
                                  Completed
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openNotesDialog(visitor)}
                            >
                              Notes
                            </Button>
                          </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Visitor</DialogTitle>
            <DialogDescription>Record a new visitor or update an existing visitor's visit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referredBy">Referred By</Label>
              <Input
                id="referredBy"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="Who referred this visitor?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="interested"
                className="h-4 w-4 rounded border-gray-300"
                checked={interestedInMembership}
                onChange={(e) => setInterestedInMembership(e.target.checked)}
              />
              <Label htmlFor="interested" className="text-sm font-medium">
                Interested in membership
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVisitor}>Record Visit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Follow-Up Notes</DialogTitle>
            <DialogDescription>
              {selectedVisitor
                ? `Notes for ${selectedVisitor.firstName} ${selectedVisitor.lastName}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Notes</Label>
              <textarea
                id="followUpNotes"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add follow-up notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
