import { describe, it, expect } from "vitest";
import { timestamp } from "../use-export.hook";

describe("timestamp", () => {
  it("returns a 19-character string", () => {
    const ts = timestamp();
    expect(ts).toHaveLength(19);
  });

  it("does not contain colons or dots", () => {
    const ts = timestamp();
    expect(ts).not.toMatch(/[:.]/);
  });

  it("contains only digits, dashes, and T", () => {
    const ts = timestamp();
    expect(ts).toMatch(/^[\dT-]+$/);
  });

  it("starts with a valid year", () => {
    const ts = timestamp();
    const year = parseInt(ts.slice(0, 4), 10);
    expect(year).toBeGreaterThanOrEqual(2020);
    expect(year).toBeLessThanOrEqual(2100);
  });

  it("follows YYYY-MM-DDTHH-MM-SS format", () => {
    const ts = timestamp();
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
  });
});
