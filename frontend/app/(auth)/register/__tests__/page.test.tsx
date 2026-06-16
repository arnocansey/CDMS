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

it("renders the Create Account heading", () => {
  render(<Page />);
  expect(screen.getByText("Create an Account")).toBeInTheDocument();
});

it("renders form fields", () => {
  render(<Page />);
  expect(screen.getByPlaceholderText("Enter first name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Enter last name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
});

it("renders submit button", () => {
  render(<Page />);
  expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
});
