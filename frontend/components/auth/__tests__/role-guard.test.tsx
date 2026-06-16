import { render, screen } from "@testing-library/react";
import { RoleGuard } from "../role-guard";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/members",
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/hooks/use-auth");

import { useAuth } from "@/hooks/use-auth";

beforeEach(() => {
  mockPush.mockClear();
});

it("renders children when user has required role", async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { roles: ["ADMIN"] },
    isLoading: false,
    isAuthenticated: true,
  });

  render(
    <RoleGuard>
      <div>Protected Content</div>
    </RoleGuard>
  );

  expect(screen.getByText("Protected Content")).toBeInTheDocument();
});

it("redirects when user lacks required role", async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { roles: ["MEMBER"] },
    isLoading: false,
    isAuthenticated: true,
  });

  render(
    <RoleGuard>
      <div>Protected Content</div>
    </RoleGuard>
  );

  expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  expect(mockPush).toHaveBeenCalledWith("/dashboard");
});

it("redirects to login when not authenticated", async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });

  render(
    <RoleGuard>
      <div>Protected Content</div>
    </RoleGuard>
  );

  expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  expect(mockPush).toHaveBeenCalledWith("/login");
});

it("shows loading spinner while auth is loading", async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const { container } = render(
    <RoleGuard>
      <div>Protected Content</div>
    </RoleGuard>
  );

  expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  expect(container.querySelector(".animate-spin")).toBeInTheDocument();
});

it("allows PASTOR access to members page", async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { roles: ["PASTOR"] },
    isLoading: false,
    isAuthenticated: true,
  });

  render(
    <RoleGuard>
      <div>Members Page</div>
    </RoleGuard>
  );

  expect(screen.getByText("Members Page")).toBeInTheDocument();
});

it("denies TREASURER access to members page", async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { roles: ["TREASURER"] },
    isLoading: false,
    isAuthenticated: true,
  });

  render(
    <RoleGuard>
      <div>Members Page</div>
    </RoleGuard>
  );

  expect(screen.queryByText("Members Page")).not.toBeInTheDocument();
  expect(mockPush).toHaveBeenCalledWith("/dashboard");
});
