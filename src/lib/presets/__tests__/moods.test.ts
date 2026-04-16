import { describe, it, expect } from "vitest";
import { moodPresets } from "../moods";

const VALID_DENSITIES = ["compact", "comfortable", "spacious"] as const;
const REQUIRED_FIELDS = [
  "id",
  "name",
  "mood",
  "density",
  "borderRadius",
  "shadowLevel",
  "fontFamily",
  "philosophy",
] as const;

describe("moodPresets", () => {
  it("contains exactly 6 items", () => {
    expect(moodPresets).toHaveLength(6);
  });

  it.each(moodPresets)("preset $id has all required fields", (preset) => {
    for (const field of REQUIRED_FIELDS) {
      expect(preset).toHaveProperty(field);
      expect(typeof preset[field]).toBe("string");
    }
  });

  it("invariant: density is always a valid enum value", () => {
    for (const preset of moodPresets) {
      expect(VALID_DENSITIES).toContain(preset.density);
    }
  });
});
