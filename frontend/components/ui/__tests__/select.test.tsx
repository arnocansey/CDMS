import { render, screen } from "@testing-library/react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../select"

describe("Select", () => {
  it("renders with trigger and placeholder", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByText("Select an option")).toBeInTheDocument()
  })

  it("renders select trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("renders with custom className", () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole("combobox")).toHaveClass("custom-trigger")
  })

  it("can be disabled", () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole("combobox")).toBeDisabled()
  })
})