import { describe, it, expect } from "vitest";
import { diagnoseInfoArchitecture } from "../info-arch-diagnostics";
import type { InfoArchitecturePhase, SitemapNode, UserFlow } from "@/types/phases";

function ia(overrides?: Partial<InfoArchitecturePhase>): InfoArchitecturePhase {
  return {
    sitemap: [],
    userFlows: [],
    globalNavRules: [],
    ...overrides,
  };
}

function node(
  id: string,
  patch?: Partial<SitemapNode>,
  children: SitemapNode[] = [],
): SitemapNode {
  return {
    id,
    label: id,
    path: `/${id}`,
    purpose: `${id} 존재 이유`,
    children,
    ...patch,
  };
}

function flow(id: string, steps: UserFlow["steps"] = []): UserFlow {
  return {
    id,
    name: `flow-${id}`,
    goal: `${id} 완료`,
    successEndings: steps.length > 0 ? [steps[steps.length - 1].id] : [],
    steps,
  };
}

describe("diagnoseInfoArchitecture", () => {
  it("완벽한 입력은 경고를 만들지 않는다", () => {
    const input = ia({
      sitemap: [node("home"), node("dashboard")],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "home cta", screenRef: "home", next: ["s2"] },
          {
            id: "s2",
            action: "see dashboard",
            screenRef: "dashboard",
            next: [],
          },
        ]),
      ],
    });
    expect(diagnoseInfoArchitecture(input)).toEqual([]);
  });

  it("플로우에 쓰이지 않는 노드는 orphan-sitemap-node로 감지된다", () => {
    const input = ia({
      sitemap: [node("home"), node("hidden")],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: [] },
        ]),
      ],
    });
    const out = diagnoseInfoArchitecture(input);
    expect(out.some((d) => d.kind === "orphan-sitemap-node")).toBe(true);
    const orphan = out.find((d) => d.kind === "orphan-sitemap-node");
    expect(orphan && "nodeId" in orphan ? orphan.nodeId : "").toBe("hidden");
  });

  it("빈 screenRef는 missing-screen-ref로 감지된다", () => {
    const input = ia({
      sitemap: [node("home")],
      userFlows: [flow("f1", [{ id: "s1", action: "a", screenRef: "", next: [] }])],
    });
    expect(
      diagnoseInfoArchitecture(input).some((d) => d.kind === "missing-screen-ref"),
    ).toBe(true);
  });

  it("사이트맵에 없는 ref는 unknown-screen-ref로 감지된다", () => {
    const input = ia({
      sitemap: [node("home")],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "ghost", next: [] },
        ]),
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some((d) => d.kind === "unknown-screen-ref"),
    ).toBe(true);
  });

  it("같은 플로우에 없는 next 타겟은 dangling-next로 감지된다", () => {
    const input = ia({
      sitemap: [node("home")],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: ["ghost"] },
        ]),
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some((d) => d.kind === "dangling-next"),
    ).toBe(true);
  });

  it("스텝 없는 플로우는 flow-without-steps를 만든다", () => {
    const input = ia({ userFlows: [flow("f1", [])] });
    expect(
      diagnoseInfoArchitecture(input).some((d) => d.kind === "flow-without-steps"),
    ).toBe(true);
  });

  it("어떤 next에도 등장하지 않는 스텝은 unreachable-step으로 감지된다", () => {
    const input = ia({
      sitemap: [node("home")],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: [] },
          { id: "s2", action: "b", screenRef: "home", next: [] },
        ]),
      ],
    });
    const out = diagnoseInfoArchitecture(input);
    const unreach = out.filter((d) => d.kind === "unreachable-step");
    expect(unreach).toHaveLength(1);
    expect(
      unreach[0] && "stepId" in unreach[0] ? unreach[0].stepId : "",
    ).toBe("s2");
  });

  it("purpose 비어있는 노드는 node-missing-purpose로 감지된다", () => {
    const input = ia({
      sitemap: [node("home", { purpose: "" })],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: [] },
        ]),
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "node-missing-purpose",
      ),
    ).toBe(true);
  });

  it("2차: goal 없는 플로우는 flow-missing-goal로 감지된다", () => {
    const input = ia({
      sitemap: [node("home")],
      userFlows: [
        {
          id: "f1",
          name: "x",
          goal: "",
          steps: [{ id: "s1", action: "a", screenRef: "home", next: [] }],
        },
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some((d) => d.kind === "flow-missing-goal"),
    ).toBe(true);
  });

  it("2차: success/failure 둘 다 없는 플로우는 flow-no-endings-marked", () => {
    const input = ia({
      sitemap: [node("home")],
      userFlows: [
        {
          id: "f1",
          name: "x",
          goal: "완료",
          steps: [{ id: "s1", action: "a", screenRef: "home", next: [] }],
        },
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "flow-no-endings-marked",
      ),
    ).toBe(true);
  });

  it("2차: review 타입 + audience 빈값은 review-screen-unassigned", () => {
    const input = ia({
      sitemap: [
        node("approve", {
          screenType: "review",
          audience: [],
        }),
      ],
      userFlows: [
        {
          id: "f1",
          name: "x",
          goal: "완료",
          successEndings: ["s1"],
          steps: [{ id: "s1", action: "a", screenRef: "approve", next: [] }],
        },
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "review-screen-unassigned",
      ),
    ).toBe(true);
  });

  it("2차: 본문 없는 네비 규칙은 nav-rule-missing-body", () => {
    const input = ia({
      globalNavRules: [
        {
          id: "r1",
          title: "빈 규칙",
          rule: "",
        },
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "nav-rule-missing-body",
      ),
    ).toBe(true);
  });

  it("3차: roles 목록이 있고 audience가 등록되지 않은 이름이면 unknown-role-ref", () => {
    const input = ia({
      sitemap: [node("home", { audience: ["ghost"] })],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: [] },
        ]),
      ],
      roles: [{ id: "r1", name: "member" }],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "unknown-role-ref",
      ),
    ).toBe(true);
  });

  it("3차: primaryEntity가 entities에 없으면 unknown-entity-ref", () => {
    const input = ia({
      sitemap: [node("home", { primaryEntity: "Unknown" })],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: [] },
        ]),
      ],
      entities: [{ id: "e1", name: "Project" }],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "unknown-entity-ref",
      ),
    ).toBe(true);
  });

  it("3차: roles가 비었으면 audience 검증을 건너뛴다", () => {
    const input = ia({
      sitemap: [node("home", { audience: ["anyone"] })],
      userFlows: [
        flow("f1", [
          { id: "s1", action: "a", screenRef: "home", next: [] },
        ]),
      ],
    });
    expect(
      diagnoseInfoArchitecture(input).some(
        (d) => d.kind === "unknown-role-ref",
      ),
    ).toBe(false);
  });
});
