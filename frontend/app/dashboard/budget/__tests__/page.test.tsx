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
  useBudgets: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useBudgetSummary: jest.fn().mockReturnValue({
    data: {},
    isLoading: false,
  }),
}));

jest.mock("recharts", () => ({
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
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

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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

it("renders the Budget Management heading", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { name: /budget management/i })).toBeInTheDocument();
});
