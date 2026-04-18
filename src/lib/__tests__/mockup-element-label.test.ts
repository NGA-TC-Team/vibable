import { describe, expect, it } from "vitest";
import { resolveElementLabel } from "../mockup-element-label";

describe("resolveElementLabel", () => {
  it("uses the provided alias when it is non-empty", () => {
    const result = resolveElementLabel(
      { type: "button", alias: "Ask AI 버튼" },
      1,
      { button: "Button" },
    );
    expect(result.label).toBe("Ask AI 버튼");
    expect(result.typeLabel).toBe("Button");
    expect(result.hasAlias).toBe(true);
  });

  it("falls back to Type N format when alias is missing", () => {
    const result = resolveElementLabel({ type: "button" }, 2, { button: "Button" });
    expect(result.label).toBe("Button 2");
    expect(result.hasAlias).toBe(false);
  });

  it("treats whitespace-only alias as absent", () => {
    const result = resolveElementLabel(
      { type: "input", alias: "   " },
      3,
      { input: "Input" },
    );
    expect(result.label).toBe("Input 3");
    expect(result.hasAlias).toBe(false);
  });

  it("falls back to the raw type string when no label map entry is provided", () => {
    const result = resolveElementLabel({ type: "custom-kind" }, 1);
    expect(result.typeLabel).toBe("custom-kind");
    expect(result.label).toBe("custom-kind 1");
  });
});
