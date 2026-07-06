import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";

jest.mock("@/hooks/use-auth");
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: 0 }),
  },
}));

describe("Header Component", () => {
  const mockUser = {
    id: 1,
    email: "test@church.com",
    firstName: "John",
    lastName: "Doe",
    roles: ["Administrator"],
  };
  const mockLogout = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
    mockLogout.mockClear();
  });

  it("renders header element", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders system title", () => {
    render(<Header />);
    expect(screen.getByText("Church Database Management System")).toBeInTheDocument();
  });

  it("renders user initials in avatar", () => {
    render(<Header />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders at least 3 buttons (theme, bell, avatar)", () => {
    render(<Header />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders avatar button with aria-haspopup menu", () => {
    render(<Header />);
    const avatarBtn = screen.getByRole("button", { name: /JD/i });
    expect(avatarBtn).toHaveAttribute("aria-haspopup", "menu");
  });

  it("has data-state attribute on avatar trigger", () => {
    render(<Header />);
    const trigger = screen.getByRole("button", { name: /JD/i });
    expect(trigger).toHaveAttribute("data-state");
  });
});
