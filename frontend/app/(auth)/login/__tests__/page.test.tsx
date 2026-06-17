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

import { useAuth } from "@/hooks/use-auth";
import Page from "../page";

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { id: 1, firstName: "Test", lastName: "User", email: "test@test.com", roles: ["Administrator"] },
    isLoading: false,
  });
});

it("renders without crashing", () => {
  render(<Page />);
});

it("renders the Sign In heading", () => {
  render(<Page />);
  expect(screen.getByText("Sign in to your account to continue")).toBeInTheDocument();
});

it("renders email input", () => {
  render(<Page />);
  expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
});

it("renders password input", () => {
  render(<Page />);
  expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
});

it("renders submit button", () => {
  render(<Page />);
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});
