import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

describe("Card Components", () => {
  describe("Card", () => {
    it("renders card with children", () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Card className="custom-class">Test</Card>);
      const card = screen.getByText("Test").closest("div");
      expect(card).toHaveClass("custom-class");
    });

    it("has default card classes", () => {
      render(<Card>Test</Card>);
      const card = screen.getByText("Test").closest("div");
      expect(card).toHaveClass("rounded-lg");
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("bg-card");
    });
  });

  describe("CardHeader", () => {
    it("renders header with children", () => {
      render(
        <Card>
          <CardHeader>
            <h2>Header</h2>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <Card>
          <CardHeader className="custom-header">Test</CardHeader>
        </Card>
      );
      const header = screen.getByText("Test").closest("div");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("renders title", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>My Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("applies title classes", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test</CardTitle>
          </CardHeader>
        </Card>
      );
      const title = screen.getByText("Test");
      expect(title).toHaveClass("text-2xl");
      expect(title).toHaveClass("font-semibold");
    });
  });

  describe("CardDescription", () => {
    it("renders description", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description text</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("applies description classes", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Test</CardDescription>
          </CardHeader>
        </Card>
      );
      const desc = screen.getByText("Test");
      expect(desc).toHaveClass("text-sm");
      expect(desc).toHaveClass("text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("renders content", () => {
      render(
        <Card>
          <CardContent>
            <p>Content here</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText("Content here")).toBeInTheDocument();
    });

    it("applies content classes", () => {
      render(
        <Card>
          <CardContent>Test</CardContent>
        </Card>
      );
      const content = screen.getByText("Test").closest("div");
      expect(content).toHaveClass("p-6");
      expect(content).toHaveClass("pt-0");
    });
  });

  describe("CardFooter", () => {
    it("renders footer", () => {
      render(
        <Card>
          <CardFooter>
            <button>Save</button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("applies footer classes", () => {
      render(
        <Card>
          <CardFooter>Test</CardFooter>
        </Card>
      );
      const footer = screen.getByText("Test").closest("div");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
      expect(footer).toHaveClass("p-6");
    });
  });
});
