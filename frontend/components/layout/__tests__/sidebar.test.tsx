import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("next/link", () => {
  return ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 1, firstName: "Test", roles: ["ADMIN"] },
    isAuthenticated: true,
  }),
}));

import { useAuth } from "@/hooks/use-auth";

describe("Sidebar Component", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, firstName: "Test", roles: ["ADMIN"] },
      isAuthenticated: true,
    });
  });

  it("renders sidebar container", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    const sidebar = screen.getByRole("navigation").closest("div");
    expect(sidebar).toHaveClass("flex", "h-full", "w-64", "flex-col");
  });

  it("renders CDMS logo text", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("CDMS")).toBeInTheDocument();
  });

  it("renders navigation links for admin", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Attendance")).toBeInTheDocument();
    expect(screen.getAllByText("Finance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("renders correct number of nav items for admin", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(39);
  });

  it("renders logo link to home", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    const logoLink = screen.getByText("CDMS").closest("a");
    expect(logoLink).toHaveAttribute("href", "/dashboard");
  });

  it("Dashboard link has correct href", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("Members link has correct href", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Members").closest("a")).toHaveAttribute("href", "/dashboard/members");
  });

  it("Finance link has correct href", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    const financeLinks = screen.getAllByText("Finance");
    const link = financeLinks.find((el) => el.closest("a"));
    expect(link?.closest("a")).toHaveAttribute("href", "/dashboard/finance");
  });

  it("Users link has correct href", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Users").closest("a")).toHaveAttribute("href", "/dashboard/users");
  });

  it("hides admin-only links for non-admin users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 2, firstName: "Member", roles: ["MEMBER"] },
      isAuthenticated: true,
    });
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Finance")).not.toBeInTheDocument();
    expect(screen.queryByText("Budget")).not.toBeInTheDocument();
  });

  it("shows finance links for treasurer", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 3, firstName: "Treasurer", roles: ["TREASURER"] },
      isAuthenticated: true,
    });
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getAllByText("Finance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("shows members and attendance for secretary but not finance", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 4, firstName: "Secretary", roles: ["SECRETARY"] },
      isAuthenticated: true,
    });
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Attendance")).toBeInTheDocument();
    expect(screen.queryByText("Finance")).not.toBeInTheDocument();
    expect(screen.queryByText("Budget")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("shows only dashboard for member role", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 5, firstName: "Member", roles: ["MEMBER"] },
      isAuthenticated: true,
    });
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Members")).not.toBeInTheDocument();
    expect(screen.queryByText("Attendance")).not.toBeInTheDocument();
    expect(screen.queryByText("Finance")).not.toBeInTheDocument();
    expect(screen.queryByText("Budget")).not.toBeInTheDocument();
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
    expect(screen.queryByText("Reports")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("shows all links for pastor", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 6, firstName: "Pastor", roles: ["PASTOR"] },
      isAuthenticated: true,
    });
    render(<Sidebar isOpen={false} onClose={jest.fn()} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Attendance")).toBeInTheDocument();
    expect(screen.getAllByText("Finance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });
});
