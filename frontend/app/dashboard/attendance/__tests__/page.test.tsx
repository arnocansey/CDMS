import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";

jest.mock("@/hooks/use-auth");

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

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
  useAttendance: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useMembers: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
  useRecordAttendance: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
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

it("renders the Attendance heading", async () => {
  await act(async () => {
    render(<Page />);
  });
  await waitFor(() => {
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
