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
  useDepartments: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

jest.mock("@/lib/api", () => ({
  default: {
    delete: jest.fn().mockResolvedValue({}),
  },
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

it("renders the Departments heading", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { name: /departments/i })).toBeInTheDocument();
});
