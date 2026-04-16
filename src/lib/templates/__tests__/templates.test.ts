import { describe, it, expect } from "vitest";
import { templatesByPhase, type PhaseTemplate } from "../index";

describe("templatesByPhase", () => {
  it("has entries for phases 0 through 6", () => {
    for (let i = 0; i <= 6; i++) {
      expect(templatesByPhase[i]).toBeDefined();
      expect(Array.isArray(templatesByPhase[i])).toBe(true);
    }
  });

  it("has 3 templates per phase, 21 total", () => {
    let total = 0;
    for (let i = 0; i <= 6; i++) {
      expect(templatesByPhase[i]).toHaveLength(3);
      total += templatesByPhase[i]!.length;
    }
    expect(total).toBe(21);
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
