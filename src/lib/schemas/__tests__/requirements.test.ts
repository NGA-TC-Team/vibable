import { describe, it, expect } from "vitest";
import { requirementsSchema } from "../requirements";

describe("requirementsSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = requirementsSchema.parse({});

    expect(result).toEqual({
      functional: [],
      nonFunctional: [],
      constraints: [],
      glossary: [],
      clarifications: [],
    });
  });

  it("fills missing new fields when parsing legacy JSON with only functional/nonFunctional", () => {
    const legacy = {
      functional: [
        {
          id: "f1",
          title: "Login",
          description: "User can log in",
          priority: "must" as const,
          acceptanceCriteria: ["Email + password"],
        },
      ],
      nonFunctional: [
        { id: "nf1", category: "performance" as const, description: "< 200ms response" },
      ],
    };

    const result = requirementsSchema.parse(legacy);
    expect(result.constraints).toEqual([]);
    expect(result.glossary).toEqual([]);
    expect(result.clarifications).toEqual([]);
    expect(result.functional[0].statement).toBe("");
    expect(result.functional[0].rationale).toBe("");
    expect(result.functional[0].source).toBe("");
    expect(result.functional[0].relatedGoalIds).toEqual([]);
  });

  it("parses full data with all 5 sections", () => {
    const full = {
      functional: [
        {
          id: "FR-001",
          title: "Login",
          description: "User can log in",
          priority: "must" as const,
          acceptanceCriteria: ["Email + password"],
          statement: "시스템은 사용자가 이메일과 비밀번호로 로그인할 수 있어야 한다.",
          rationale: "기본 인증 수단이 필요하다.",
          source: "이해관계자 인터뷰 2026-04-01",
          relatedGoalIds: ["goal-1"],
        },
      ],
      nonFunctional: [
        { id: "NFR-001", category: "performance" as const, description: "< 200ms" },
      ],
      constraints: [
        {
          id: "CON-001",
          category: "legal" as const,
          description: "GDPR 준수",
          source: "EU 규정",
          impact: "PII 저장 시 지역 제약",
        },
      ],
      glossary: [
        {
          id: "GLS-001",
          term: "Moderator",
          definition: "커뮤니티 게시물을 검토하는 권한 보유자",
          kind: "role" as const,
          aliases: ["관리자"],
        },
      ],
      clarifications: [
        {
          id: "CLR-001",
          question: "소셜 로그인 제공 범위는?",
          context: "FR-001 관련",
          owner: "PM",
          status: "open" as const,
          answer: "",
          blocksRequirementIds: ["FR-001"],
        },
      ],
    };

    const result = requirementsSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it("rejects invalid priority enum", () => {
    const result = requirementsSchema.safeParse({
      functional: [{ id: "f1", title: "X", priority: "critical" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid constraint category", () => {
    const result = requirementsSchema.safeParse({
      constraints: [{ id: "c1", category: "fictional" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid clarification status", () => {
    const result = requirementsSchema.safeParse({
      clarifications: [{ id: "clr1", status: "maybe" }],
    });
    expect(result.success).toBe(false);
  });

  it("defaults clarification status to 'open'", () => {
    const result = requirementsSchema.parse({
      clarifications: [{ id: "CLR-001" }],
    });
    expect(result.clarifications[0].status).toBe("open");
    expect(result.clarifications[0].blocksRequirementIds).toEqual([]);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = requirementsSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
