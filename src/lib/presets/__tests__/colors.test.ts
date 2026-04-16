import { describe, it, expect } from "vitest";
import { colorPresets, deriveColorTokens } from "../colors";

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

describe("colorPresets", () => {
  it("contains exactly 8 items", () => {
    expect(colorPresets).toHaveLength(8);
  });

  it.each(colorPresets)("preset $id has required fields", (preset) => {
    expect(preset).toHaveProperty("id");
    expect(preset).toHaveProperty("label");
    expect(preset).toHaveProperty("primaryHex");
    expect(preset).toHaveProperty("primaryOklch");
    expect(typeof preset.id).toBe("string");
    expect(typeof preset.label).toBe("string");
    expect(preset.primaryHex).toMatch(HEX_REGEX);
  });
});

describe("deriveColorTokens", () => {
  const preset = colorPresets[0]!;

  it("returns exactly 8 tokens", () => {
    const tokens = deriveColorTokens(preset);
    expect(tokens).toHaveLength(8);
  });

  it("returns tokens with expected names", () => {
    const tokens = deriveColorTokens(preset);
    const names = tokens.map((t) => t.name);

    expect(names).toEqual([
      "Primary",
      "Background",
      "Surface",
      "Text",
      "Secondary",
      "Error",
      "Success",
      "Warning",
    ]);
  });

  it("light vs dark mode produces different Background/Surface/Text/Secondary", () => {
    const light = deriveColorTokens(preset, false);
    const dark = deriveColorTokens(preset, true);

    const diffKeys = ["Background", "Surface", "Text", "Secondary"];
    for (const name of diffKeys) {
      const lightToken = light.find((t) => t.name === name)!;
      const darkToken = dark.find((t) => t.name === name)!;
      expect(lightToken.hex).not.toBe(darkToken.hex);
    }
  });

  it("invariant: all hex values match #RRGGBB format", () => {
    const tokens = deriveColorTokens(preset);
    for (const token of tokens) {
      expect(token.hex).toMatch(HEX_REGEX);
    }
  });

  it("property: all 8 presets produce identical token structure", () => {
    const referenceNames = deriveColorTokens(colorPresets[0]!).map((t) => t.name);

    for (const p of colorPresets) {
      const tokens = deriveColorTokens(p);
      expect(tokens).toHaveLength(8);
      expect(tokens.map((t) => t.name)).toEqual(referenceNames);

      for (const token of tokens) {
        expect(token.hex).toMatch(HEX_REGEX);
        expect(typeof token.role).toBe("string");
      }
    }
  });
});
