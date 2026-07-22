import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";

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
  useMembers: jest.fn().mockReturnValue({
    data: { content: [], totalElements: 0, totalPages: 0 },
    isLoading: false,
    isError: false,
  }),
  useDepartments: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useBranches: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}));

jest.mock("@/lib/api", () => ({
  default: {
    delete: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({}),
    post: jest.fn().mockResolvedValue({}),
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

it("renders without crashing", async () => {
  await act(async () => {
    render(<Page />);
  });
});

it("renders the Members heading", async () => {
  await act(async () => {
    render(<Page />);
  });
  await waitFor(() => {
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
