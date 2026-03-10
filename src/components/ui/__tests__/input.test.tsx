// src/components/ui/__tests__/input.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "../input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("handles value changes", async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows error styling when error prop is set", () => {
    render(<Input error="Required field" />);
    const errorText = screen.getByText("Required field");
    expect(errorText).toBeInTheDocument();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
