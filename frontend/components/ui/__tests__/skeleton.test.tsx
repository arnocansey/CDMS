import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton Component", () => {
  it("renders correctly with default classes", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("animate-pulse");
    expect(element).toHaveClass("rounded-md");
    expect(element).toHaveClass("bg-muted/60");
  });

  it("merges custom classes", () => {
    const { container } = render(<Skeleton className="h-10 w-10 rounded-full" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("h-10");
    expect(element).toHaveClass("w-10");
    expect(element).toHaveClass("rounded-full");
    expect(element).toHaveClass("animate-pulse");
  });
});
