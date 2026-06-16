import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../dialog"

function DialogTestComponent() {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Test Title</DialogTitle>
        <DialogDescription>Test Description</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  )
}

describe("Dialog", () => {
  it("renders trigger button", () => {
    render(<DialogTestComponent />)
    expect(screen.getByText("Open Dialog")).toBeInTheDocument()
  })

  it("renders dialog content when opened", async () => {
    const user = userEvent.setup()
    render(<DialogTestComponent />)
    await user.click(screen.getByText("Open Dialog"))
    expect(screen.getByText("Test Title")).toBeInTheDocument()
    expect(screen.getByText("Test Description")).toBeInTheDocument()
  })

  it("does not render dialog content when closed", () => {
    render(<DialogTestComponent />)
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument()
    expect(screen.queryByText("Test Description")).not.toBeInTheDocument()
  })

  it("closes when close button is clicked", async () => {
    const user = userEvent.setup()
    render(<DialogTestComponent />)
    await user.click(screen.getByText("Open Dialog"))
    expect(screen.getByText("Test Title")).toBeInTheDocument()
    await user.click(screen.getAllByText("Close")[0])
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument()
  })
})