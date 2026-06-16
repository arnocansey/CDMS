import { render, screen } from "@testing-library/react";

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

jest.mock("@/hooks/use-queries", () => ({
  useFinancialData: jest.fn().mockReturnValue({
    data: { donations: [], tithes: [], offerings: [], expenses: [] },
    isLoading: false,
  }),
  useBudgets: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useMembers: jest.fn().mockReturnValue({
    data: { content: [] },
    isLoading: false,
  }),
}));

jest.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>,
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

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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

it("renders without crashing", () => {
  render(<Page />);
});

it("renders the Analytics heading", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { name: /analytics/i })).toBeInTheDocument();
});
