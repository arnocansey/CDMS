"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  Crown,
  UserCheck,
  Repeat,
  CheckCircle,
  Settings,
  Download,
  GitCompare,
  CalendarDays,
  Calendar,
  MapPin,
  UsersRound,
  ArrowLeftRight,
  FileUp,
  Key,
  Palette,
  ShieldCheck,
  Megaphone,
  Heart,
  ChevronDown,
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
  { name: "Departments", href: "/dashboard/departments", icon: Building2, roles: ["ADMIN", "PASTOR", "SECRETARY"] },
  { name: "Prayer Requests", href: "/dashboard/prayer-requests", icon: Heart, roles: ["ADMIN", "PASTOR", "SECRETARY", "MEMBER"] },
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
  { name: "Events", href: "/dashboard/events", icon: Calendar, roles: ["ADMIN", "PASTOR", "SECRETARY", "MEMBER"] },
  { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone, roles: ["ADMIN", "PASTOR", "SECRETARY", "MEMBER"] },
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

function groupHasActive(items: NavItem[], pathname: string) {
  return items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];

  const hasAccess = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => userRoles.includes(role));
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Core: true,
    Finance: true,
    Insights: true,
    Calendar: true,
    Settings: true,
    Notifications: true,
    Administration: true,
  });

  useEffect(() => {
    const groups: { label: string; items: NavItem[] }[] = [
      { label: "Core", items: coreNav },
      { label: "Finance", items: financeNav },
      { label: "Insights", items: insightsNav },
      { label: "Calendar", items: calendarNav },
      { label: "Settings", items: settingsNav },
      { label: "Notifications", items: notificationsNav },
      { label: "Administration", items: adminNav },
    ];
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        if (groupHasActive(group.items.filter(hasAccess), pathname)) {
          next[group.label] = true;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavGroup = (items: NavItem[], label: string, collapsible = false) => {
    const filtered = items.filter(hasAccess);
    if (filtered.length === 0) return null;

    const isOpenGroup = openGroups[label] ?? true;

    return (
      <div className="mb-3">
        {collapsible ? (
          <button
            type="button"
            onClick={() => toggleGroup(label)}
            className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <span>{label}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                isOpenGroup ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
        ) : (
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        )}
        {(!collapsible || isOpenGroup) && (
          <div className="space-y-0.5">
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
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
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
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
                <Image src="/logo.png" alt="CDMS Logo" width={36} height={36} className="object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight">{branding.shortName}</span>
            </Link>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {renderNavGroup(coreNav, "Core")}
            {renderNavGroup(financeNav, "Finance", true)}
            {renderNavGroup(insightsNav, "Insights", true)}
            {renderNavGroup(calendarNav, "Calendar")}
            {renderNavGroup(settingsNav, "Settings", true)}
            {renderNavGroup(notificationsNav, "Notifications")}
            {renderNavGroup(adminNav, "Administration")}
          </nav>
        </div>
      </div>
    </>
  );
}
