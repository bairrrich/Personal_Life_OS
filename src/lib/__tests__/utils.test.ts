import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge classes correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("should handle conditional classes", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
  });
  it("should handle tailwind-merge conflicts", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });
});
