// src/components/ui/__tests__/badge.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "../badge";

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default").className).toContain("bg-brand");
  });

  it("applies success variant", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK").className).toContain("bg-success");
  });

  it("applies error variant", () => {
    render(<Badge variant="error">Fail</Badge>);
    expect(screen.getByText("Fail").className).toContain("bg-error");
  });
});
