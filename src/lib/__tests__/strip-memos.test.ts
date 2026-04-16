import { describe, it, expect } from "vitest";
import { stripMemos } from "../strip-memos";
import { createDefaultPhaseData } from "../schemas/phase-data";

const PHASE_KEYS = [
  "overview",
  "userScenario",
  "requirements",
  "infoArchitecture",
  "screenDesign",
  "dataModel",
  "designSystem",
] as const;

describe("stripMemos", () => {
  it("removes the memos key from phase data", () => {
    const data = createDefaultPhaseData();
    const result = stripMemos(data);

    expect(result).not.toHaveProperty("memos");
  });

  it("does not mutate the original object", () => {
    const data = createDefaultPhaseData();
    stripMemos(data);

    expect(data).toHaveProperty("memos");
  });

  it("invariant: result keys never contain 'memos'", () => {
    const data = createDefaultPhaseData();
    const result = stripMemos(data);

    expect(Object.keys(result)).not.toContain("memos");
  });

  it("preserves all 7 phase keys", () => {
    const data = createDefaultPhaseData();
    const result = stripMemos(data);
    const keys = Object.keys(result);

    for (const key of PHASE_KEYS) {
      expect(keys).toContain(key);
    }
    expect(keys).toHaveLength(7);
  });
});
