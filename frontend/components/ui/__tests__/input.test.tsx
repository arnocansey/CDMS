import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies placeholder text", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test value" },
    });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("applies default input classes", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("flex");
    expect(input).toHaveClass("h-10");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-md");
  });

  it("supports email type", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("supports password type via container query", () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
  });

  it("supports number type", () => {
    render(<Input type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("supports id attribute", () => {
    render(<Input id="test-input" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "test-input");
  });

  it("supports name attribute", () => {
    render(<Input name="test-name" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("name", "test-name");
  });

  it("supports required attribute", () => {
    render(<Input required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("supports maxLength attribute", () => {
    render(<Input maxLength={10} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
  });

  it("handles focus event", () => {
    const handleFocus = jest.fn();
    render(<Input onFocus={handleFocus} />);
    fireEvent.focus(screen.getByRole("textbox"));
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it("handles blur event", () => {
    const handleBlur = jest.fn();
    render(<Input onBlur={handleBlur} />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
