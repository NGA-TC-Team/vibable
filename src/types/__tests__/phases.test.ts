import { describe, it, expect } from "vitest";
import { PHASE_KEYS, PHASE_LABELS } from "../phases";

describe("PHASE_KEYS", () => {
  it("contains exactly 7 items", () => {
    expect(PHASE_KEYS).toHaveLength(7);
  });

  it("has the correct order", () => {
    expect(PHASE_KEYS).toEqual([
      "overview",
      "userScenario",
      "requirements",
      "infoArchitecture",
      "screenDesign",
      "dataModel",
      "designSystem",
    ]);
  });
});

describe("PHASE_LABELS", () => {
  it("has labels for indices 0 through 6", () => {
    for (let i = 0; i <= 6; i++) {
      expect(PHASE_LABELS[i]).toBeDefined();
      expect(typeof PHASE_LABELS[i]).toBe("string");
      expect(PHASE_LABELS[i]!.length).toBeGreaterThan(0);
    }
  });

  it("contains Korean labels", () => {
    expect(PHASE_LABELS[0]).toBe("기획 개요");
    expect(PHASE_LABELS[6]).toBe("디자인 시스템");
  });
});

describe("PHASE_KEYS / PHASE_LABELS invariant", () => {
  it("PHASE_KEYS.length === Object.keys(PHASE_LABELS).length === 7", () => {
    expect(PHASE_KEYS.length).toBe(7);
    expect(Object.keys(PHASE_LABELS).length).toBe(7);
    expect(PHASE_KEYS.length).toBe(Object.keys(PHASE_LABELS).length);
  });
});
