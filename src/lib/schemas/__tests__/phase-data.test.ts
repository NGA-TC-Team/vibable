import { describe, it, expect } from "vitest";
import { phaseDataSchema, createDefaultPhaseData } from "../phase-data";

const PHASE_KEYS = [
  "overview",
  "userScenario",
  "requirements",
  "infoArchitecture",
  "screenDesign",
  "dataModel",
  "designSystem",
] as const;

describe("phaseDataSchema", () => {
  it("produces defaults with all 7 phase keys + memos", () => {
    const result = phaseDataSchema.parse({});
    const keys = Object.keys(result);

    for (const key of PHASE_KEYS) {
      expect(keys).toContain(key);
    }
    expect(keys).toContain("memos");
    expect(keys).toHaveLength(8);
  });

  it("memos defaults to empty record", () => {
    const result = phaseDataSchema.parse({});
    expect(result.memos).toEqual({});
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = phaseDataSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});

describe("createDefaultPhaseData", () => {
  it("returns the same structure as phaseDataSchema.parse({})", () => {
    const fromParse = phaseDataSchema.parse({});
    const fromFactory = createDefaultPhaseData();

    expect(fromFactory).toEqual(fromParse);
  });

  it("invariant: contains all 7 phase keys + memos", () => {
    const result = createDefaultPhaseData();
    const keys = Object.keys(result);

    expect(keys).toHaveLength(8);
    for (const key of PHASE_KEYS) {
      expect(keys).toContain(key);
    }
    expect(keys).toContain("memos");
  });
});
