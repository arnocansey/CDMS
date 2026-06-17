import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

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
    get: jest.fn().mockResolvedValue({
      data: [{ id: 1, name: "Test Church", city: "Springfield", state: "IL" }],
    }),
  },
}));

import { useAuth } from "@/hooks/use-auth";
import Page from "../page";

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({
    user: null,
    isLoading: false,
    register: jest.fn(),
  });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it("renders without crashing", () => {
  render(<Page />);
  expect(screen.getAllByText("Create an account").length).toBeGreaterThanOrEqual(1);
});

it("renders the Create Account options initially", () => {
  render(<Page />);
  expect(screen.getByText("Register as Member")).toBeInTheDocument();
  expect(screen.getByText("Register Church")).toBeInTheDocument();
});

it("navigates through steps and renders form fields and submit button", async () => {
  render(<Page />);

  // Step 1: Click "Register as Member"
  fireEvent.click(screen.getByText("Register as Member"));
  expect(screen.getByText("Find your church")).toBeInTheDocument();

  // Step 2: Search for church
  const searchInput = screen.getByPlaceholderText("Search by church name...");
  fireEvent.change(searchInput, { target: { value: "Test" } });

  // Advance timer for debounce
  act(() => {
    jest.advanceTimersByTime(300);
  });

  // Wait for results
  const churchOption = await screen.findByText("Test Church");
  expect(churchOption).toBeInTheDocument();

  // Click on church option to go to Form step
  fireEvent.click(churchOption);

  // Step 3: Verify Form step is visible and elements are rendered
  expect(screen.getByText(/joining/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Create a strong password")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Re-enter your password")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
});
