import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";

jest.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/hooks/use-auth");

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/",
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

jest.mock("@/hooks/use-queries", () => ({
  useDashboardStats: () => ({
    data: {
      totalMembers: 0,
      activeMembers: 0,
      attendanceToday: 0,
      totalDonations: 0,
      totalExpenses: 0,
      netBalance: 0,
      upcomingEvents: 0,
      pendingPrayerRequests: 0,
      monthlyFinancials: [],
      attendanceTrends: [],
      recentMembers: [],
      announcements: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useFinancialData: () => ({
    data: { donations: [], tithes: [], offerings: [], expenses: [] },
    isLoading: false,
  }),
}));

import { useAuth } from "@/hooks/use-auth";
import Page from "../page";

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { id: 1, firstName: "Test", lastName: "User", email: "test@test.com", roles: ["Administrator"] },
    isLoading: false,
    isAuthenticated: true,
  });
});

it("renders without crashing", async () => {
  await act(async () => {
    render(<Page />);
  });
});

it("renders the Dashboard heading", async () => {
  await act(async () => {
    render(<Page />);
  });
  await waitFor(() => {
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
