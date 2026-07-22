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
    data: {
      donations: [],
      tithes: [],
      offerings: [],
      expenses: [],
      meta: {
        donations: { content: [], totalPages: 0, totalElements: 0, number: 0 },
        tithes: { content: [], totalPages: 0, totalElements: 0, number: 0 },
        offerings: { content: [], totalPages: 0, totalElements: 0, number: 0 },
        expenses: { content: [], totalPages: 0, totalElements: 0, number: 0 },
      },
    },
    isLoading: false,
    isError: false,
  }),
  useFinanceSummary: jest.fn().mockReturnValue({
    data: { totalDonations: 0, totalExpenses: 0, netBalance: 0 },
    isLoading: false,
  }),
  useMembers: jest.fn().mockReturnValue({
    data: { content: [] },
    isLoading: false,
  }),
  useBranches: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}));

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  TabsContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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

it("renders the Finance heading", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { name: /finance/i })).toBeInTheDocument();
});
