import { describe, it, expect } from "vitest";
import { templatesByPhase, type PhaseTemplate } from "../index";

describe("templatesByPhase", () => {
  it("has entries for phases 0 through 6", () => {
    for (let i = 0; i <= 6; i++) {
      expect(templatesByPhase[i]).toBeDefined();
      expect(Array.isArray(templatesByPhase[i])).toBe(true);
    }
  });

  it("has at least one template per phase", () => {
    for (let i = 0; i <= 6; i++) {
      expect(templatesByPhase[i]!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has unique template ids within each phase", () => {
    for (let i = 0; i <= 6; i++) {
      const ids = templatesByPhase[i]!.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  const allTemplates: [number, PhaseTemplate][] = [];
  for (let i = 0; i <= 6; i++) {
    if (templatesByPhase[i]) {
      for (const t of templatesByPhase[i]!) {
        allTemplates.push([i, t]);
      }
    }
  }

  it.each(allTemplates)(
    "phase %i template '%s' has required fields",
    (_phase, template) => {
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("description");
      expect(template).toHaveProperty("promptTemplate");
    },
  );

  it("invariant: no promptTemplate is empty", () => {
    for (let i = 0; i <= 6; i++) {
      for (const t of templatesByPhase[i]!) {
        expect(t.promptTemplate.length).toBeGreaterThan(0);
      }
    }
  });

  it("invariant: all ids are non-empty strings", () => {
    for (let i = 0; i <= 6; i++) {
      for (const t of templatesByPhase[i]!) {
        expect(typeof t.id).toBe("string");
        expect(t.id.length).toBeGreaterThan(0);
      }
    }
  });
});
