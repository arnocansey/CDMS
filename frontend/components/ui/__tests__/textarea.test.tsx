import { render, screen } from "@testing-library/react"
import { Textarea } from "../textarea"

describe("Textarea", () => {
  it("renders with default props", () => {
    render(<Textarea />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("accepts value prop", () => {
    render(<Textarea value="test value" readOnly />)
    expect(screen.getByRole("textbox")).toHaveValue("test value")
  })

  it("applies className", () => {
    render(<Textarea className="custom-class" />)
    expect(screen.getByRole("textbox")).toHaveClass("custom-class")
  })

  it("has placeholder text", () => {
    render(<Textarea placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument()
  })

  it("can be disabled", () => {
    render(<Textarea disabled />)
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("has proper aria attributes", () => {
    render(<Textarea aria-label="Message input" aria-required="true" />)
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("aria-label", "Message input")
    expect(textarea).toHaveAttribute("aria-required", "true")
  })
})