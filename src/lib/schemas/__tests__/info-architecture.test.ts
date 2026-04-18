import { describe, it, expect } from "vitest";
import {
  infoArchitectureSchema,
  sitemapNodeSchema,
  flowStepSchema,
  userFlowSchema,
  globalNavRuleSchema,
} from "../info-architecture";

describe("infoArchitectureSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = infoArchitectureSchema.parse({});

    expect(result).toEqual({
      sitemap: [],
      userFlows: [],
      globalNavRules: [],
      roles: [],
      entities: [],
    });
  });

  it("parses valid data with nested sitemap nodes", () => {
    const valid = {
      sitemap: [
        {
          id: "root",
          label: "Home",
          path: "/",
          children: [
            { id: "about", label: "About", path: "/about", children: [] },
          ],
        },
      ],
      userFlows: [
        {
          id: "uf1",
          name: "Onboarding",
          steps: [{ id: "s1", screenRef: "home", action: "click", next: ["s2"] }],
        },
      ],
      globalNavRules: ["Always show back button"],
    };

    const result = infoArchitectureSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid sitemap node (missing id)", () => {
    const result = infoArchitectureSchema.safeParse({
      sitemap: [{ label: "No ID" }],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = infoArchitectureSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });

  it("sitemap node 기본값에 purpose/primaryTask가 빈 문자열로 채워진다", () => {
    const node = sitemapNodeSchema.parse({ id: "n1" });
    expect(node).toMatchObject({
      id: "n1",
      label: "",
      path: "",
      purpose: "",
      primaryTask: "",
      children: [],
    });
    expect(node.screenType).toBeUndefined();
  });

  it("유효한 screenType enum은 통과한다", () => {
    const result = sitemapNodeSchema.safeParse({
      id: "n1",
      label: "홈",
      screenType: "hub",
    });
    expect(result.success).toBe(true);
  });

  it("잘못된 screenType 값은 거부한다", () => {
    const result = sitemapNodeSchema.safeParse({
      id: "n1",
      label: "홈",
      screenType: "not-a-type",
    });
    expect(result.success).toBe(false);
  });

  it("purpose/primaryTask는 옵셔널이며 생략 가능하다", () => {
    const valid = {
      sitemap: [{ id: "n1", label: "홈", children: [] }],
    };
    const result = infoArchitectureSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("2차: audience/primaryEntity 기본값이 채워진다", () => {
    const node = sitemapNodeSchema.parse({ id: "n1" });
    expect(node.audience).toEqual([]);
    expect(node.primaryEntity).toBe("");
  });

  it("2차: FlowStep에 intent/actor/condition/outcome 옵셔널 필드가 붙는다", () => {
    const step = flowStepSchema.parse({
      id: "s1",
      action: "a",
      intent: "approve",
      actor: "admin",
      condition: "payment confirmed",
      outcome: "order created",
    });
    expect(step).toMatchObject({
      intent: "approve",
      actor: "admin",
      condition: "payment confirmed",
      outcome: "order created",
    });
  });

  it("2차: FlowStep.intent는 enum 외 값을 거부한다", () => {
    const result = flowStepSchema.safeParse({
      id: "s1",
      action: "a",
      intent: "bogus",
    });
    expect(result.success).toBe(false);
  });

  it("2차: UserFlow에 goal/successEndings/failureEndings가 붙는다", () => {
    const flow = userFlowSchema.parse({
      id: "f1",
      name: "x",
      goal: "완료",
      primaryActor: "user",
      startScreenRef: "home",
      successEndings: ["s1"],
      failureEndings: ["s2"],
      steps: [],
    });
    expect(flow.successEndings).toEqual(["s1"]);
    expect(flow.failureEndings).toEqual(["s2"]);
  });

  it("2차: legacy string이 구조화된 navRule로 자동 승격된다", () => {
    const rule = globalNavRuleSchema.parse("로그인 필수");
    expect(rule.rule).toBe("로그인 필수");
    expect(rule.id).toMatch(/^legacy-/);
    expect(rule.title).toBe("");
  });

  it("2차: 구조화된 navRule은 그대로 통과한다", () => {
    const rule = globalNavRuleSchema.parse({
      id: "r1",
      title: "t",
      rule: "본문",
      severity: "critical",
    });
    expect(rule).toMatchObject({ id: "r1", severity: "critical" });
  });

  it("2차: 전체 스키마 roundtrip — legacy navRule string + 신규 필드", () => {
    const input = {
      sitemap: [
        {
          id: "n1",
          label: "홈",
          purpose: "진입점",
          screenType: "hub",
          audience: ["admin"],
          primaryEntity: "Dashboard",
          children: [],
        },
      ],
      userFlows: [
        {
          id: "f1",
          name: "flow",
          goal: "완료",
          steps: [
            {
              id: "s1",
              action: "a",
              screenRef: "n1",
              intent: "submit",
              actor: "admin",
              condition: "c",
              outcome: "o",
              next: [],
            },
          ],
          successEndings: ["s1"],
        },
      ],
      globalNavRules: ["로그인 필수", { id: "r1", title: "", rule: "본문" }],
    };
    const result = infoArchitectureSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.globalNavRules).toHaveLength(2);
      expect(result.data.globalNavRules[0].rule).toBe("로그인 필수");
    }
  });
});
