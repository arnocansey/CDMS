"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { branding } from "@/lib/branding";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  DollarSign,
  PiggyBank,
  BarChart3,
  FileText,
  UserCog,
  X,
  Building2,
  HandCoins,
  Target,
  Receipt,
  Shield,
  Bell,
  ArrowRightLeft,
  TrendingUp,
  HeartPulse,
  Church,
  Crown,
  UserCheck,
  Repeat,
  CheckCircle,
  Settings,
  Download,
  GitCompare,
  CalendarDays,
  MapPin,
  UsersRound,
  ArrowLeftRight,
  FileUp,
  Key,
  Palette,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const coreNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "DEPARTMENT_LEADER", "MEMBER"] },
  { name: "Members", href: "/dashboard/members", icon: Users, roles: ["ADMIN", "PASTOR", "SECRETARY"] },
  { name: "Attendance", href: "/dashboard/attendance", icon: ClipboardList, roles: ["ADMIN", "PASTOR", "SECRETARY"] },
  { name: "Visitors", href: "/dashboard/visitors", icon: UsersRound, roles: ["ADMIN", "PASTOR", "SECRETARY"] },
];

const financeNav: NavItem[] = [
  { name: "Finance", href: "/dashboard/finance", icon: DollarSign, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Funds", href: "/dashboard/funds", icon: Building2, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Budget", href: "/dashboard/budget", icon: PiggyBank, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Pledges", href: "/dashboard/pledges", icon: HandCoins, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Goals", href: "/dashboard/goals", icon: Target, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Cash Flow", href: "/dashboard/cash-flow", icon: ArrowRightLeft, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Receipts", href: "/dashboard/receipts", icon: Receipt, roles: ["ADMIN", "TREASURER"] },
  { name: "Recurring Donations", href: "/dashboard/recurring-donations", icon: Repeat, roles: ["ADMIN", "TREASURER"] },
  { name: "Recurring Expenses", href: "/dashboard/recurring-expenses", icon: Repeat, roles: ["ADMIN", "TREASURER"] },
  { name: "Pledge Payments", href: "/dashboard/pledge-payments", icon: HandCoins, roles: ["ADMIN", "TREASURER"] },
  { name: "Expense Approvals", href: "/dashboard/expense-approvals", icon: CheckCircle, roles: ["ADMIN", "TREASURER", "PASTOR"] },
  { name: "Bank Reconciliation", href: "/dashboard/bank-reconciliation", icon: ArrowRightLeft, roles: ["ADMIN", "TREASURER"] },
];

const insightsNav: NavItem[] = [
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Donor Retention", href: "/dashboard/donor-retention", icon: UserCheck, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Giving Patterns", href: "/dashboard/giving-patterns", icon: BarChart3, roles: ["ADMIN", "TREASURER"] },
  { name: "Budget Forecasting", href: "/dashboard/budget-forecasting", icon: TrendingUp, roles: ["ADMIN", "TREASURER"] },
  { name: "Reports", href: "/dashboard/reports", icon: FileText, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Forecasts", href: "/dashboard/forecasts", icon: TrendingUp, roles: ["ADMIN", "PASTOR", "TREASURER"] },
  { name: "Health", href: "/dashboard/health", icon: HeartPulse, roles: ["ADMIN", "PASTOR"] },
];

const calendarNav: NavItem[] = [
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, roles: ["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "MEMBER"] },
  { name: "Church Directory", href: "/dashboard/directory", icon: MapPin, roles: ["ADMIN", "PASTOR", "MEMBER"] },
];

const settingsNav: NavItem[] = [
  { name: "Church Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
  { name: "Permissions", href: "/dashboard/permissions", icon: Shield, roles: ["ADMIN"] },
  { name: "Data Export", href: "/dashboard/data-export", icon: Download, roles: ["ADMIN", "TREASURER", "PASTOR"] },
  { name: "Church Transfer", href: "/dashboard/church-transfer", icon: ArrowLeftRight, roles: ["ADMIN", "PASTOR"] },
  { name: "Bulk Import", href: "/dashboard/import", icon: FileUp, roles: ["ADMIN"] },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key, roles: ["ADMIN"] },
  { name: "Branding", href: "/dashboard/branding", icon: Palette, roles: ["ADMIN"] },
  { name: "Two-Factor Auth", href: "/dashboard/2fa", icon: ShieldCheck, roles: ["ADMIN", "PASTOR", "TREASURER", "SECRETARY", "MEMBER"] },
  { name: "Subscription", href: "/dashboard/subscription", icon: Crown, roles: ["ADMIN"] },
];

const adminNav: NavItem[] = [
  { name: "Users", href: "/dashboard/users", icon: UserCog, roles: ["ADMIN"] },
  { name: "Approvals", href: "/dashboard/approvals", icon: UserCheck, roles: ["ADMIN", "PASTOR"] },
  { name: "Audit", href: "/dashboard/audit", icon: Shield, roles: ["ADMIN"] },
  { name: "Platform Admin", href: "/dashboard/admin", icon: Building2, roles: ["PLATFORM_ADMIN"] },
  { name: "Church Comparison", href: "/dashboard/church-comparison", icon: GitCompare, roles: ["PLATFORM_ADMIN"] },
];

const notificationsNav: NavItem[] = [
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["ADMIN", "PASTOR", "SECRETARY", "TREASURER", "DEPARTMENT_LEADER", "MEMBER"] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const userRoles = user?.roles ?? [];

  const hasAccess = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => userRoles.includes(role));
  };

  const renderNavGroup = (items: NavItem[], label: string) => {
    const filtered = items.filter(hasAccess);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="space-y-1">
          {filtered.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full w-64 flex-col border-r bg-card">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Church className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">{branding.shortName}</span>
            </Link>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {renderNavGroup(coreNav, "Core")}
            {renderNavGroup(financeNav, "Finance")}
            {renderNavGroup(insightsNav, "Insights")}
            {renderNavGroup(calendarNav, "Calendar")}
            {renderNavGroup(settingsNav, "Settings")}
            {renderNavGroup(notificationsNav, "Notifications")}
            {renderNavGroup(adminNav, "Administration")}
          </nav>
        </div>
      </div>
    </>
  );
}
