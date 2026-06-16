import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("applies default variant classes", () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-primary");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-secondary");
  });

  it("applies destructive variant classes", () => {
    render(<Button variant="destructive">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("applies outline variant classes", () => {
    render(<Button variant="outline">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-input");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-accent");
  });

  it("applies link variant classes", () => {
    render(<Button variant="link">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-primary");
  });

  it("applies small size classes", () => {
    render(<Button size="sm">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-9");
  });

  it("applies large size classes", () => {
    render(<Button size="lg">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-11");
  });

  it("applies icon size classes", () => {
    render(<Button size="icon">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-10");
    expect(button).toHaveClass("w-10");
  });

  it("can be disabled", () => {
    render(<Button disabled>Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("has correct type attribute", () => {
    render(<Button type="submit">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
