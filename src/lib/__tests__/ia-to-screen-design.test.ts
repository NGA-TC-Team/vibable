import { describe, it, expect } from "vitest";
import { seedScreenDesignFromIa } from "../ia-to-screen-design";
import type {
  InfoArchitecturePhase,
  ScreenDesignPhase,
  SitemapNode,
} from "@/types/phases";

function node(id: string, patch?: Partial<SitemapNode>): SitemapNode {
  return {
    id,
    label: id,
    path: `/${id}`,
    children: [],
    ...patch,
  };
}

function ia(overrides?: Partial<InfoArchitecturePhase>): InfoArchitecturePhase {
  return {
    sitemap: [],
    userFlows: [],
    globalNavRules: [],
    ...overrides,
  };
}

const emptyScreenDesign: ScreenDesignPhase = { pages: [] };

describe("seedScreenDesignFromIa", () => {
  it("빈 IA는 빈 결과를 반환한다", () => {
    const result = seedScreenDesignFromIa(ia(), emptyScreenDesign);
    expect(result.added).toEqual([]);
    expect(result.phase.pages).toEqual([]);
  });

  it("사이트맵 노드를 page로 변환한다", () => {
    const input = ia({
      sitemap: [
        node("home", {
          purpose: "진입점",
          primaryTask: "핵심 기능으로 이동",
        }),
      ],
    });
    const result = seedScreenDesignFromIa(input, emptyScreenDesign);
    expect(result.added).toEqual(["home"]);
    expect(result.phase.pages[0]).toMatchObject({
      id: "home",
      name: "home",
      route: "/home",
      uxIntent: {
        userGoal: "핵심 기능으로 이동",
        businessIntent: "진입점",
      },
    });
  });

  it("기존 page id는 건너뛰고 새 노드만 추가한다", () => {
    const input = ia({
      sitemap: [node("home"), node("dashboard")],
    });
    const existing: ScreenDesignPhase = {
      pages: [
        {
          id: "home",
          name: "기존 홈",
          route: "/custom",
          entityIds: [],
          uxIntent: { userGoal: "기존 목표", businessIntent: "" },
          states: { idle: "", loading: "", offline: "", errors: [] },
          interactions: [],
          inPages: [],
          outPages: [],
        },
      ],
    };
    const result = seedScreenDesignFromIa(input, existing);
    expect(result.added).toEqual(["dashboard"]);
    expect(result.skipped).toEqual(["home"]);
    expect(result.phase.pages[0].name).toBe("기존 홈"); // 기존 보존
    expect(result.phase.pages).toHaveLength(2);
  });

  it("플로우 연결을 기반으로 inPages/outPages를 유도한다", () => {
    const input = ia({
      sitemap: [node("home"), node("detail")],
      userFlows: [
        {
          id: "f1",
          name: "view",
          steps: [
            {
              id: "s1",
              action: "click",
              screenRef: "home",
              next: ["s2"],
            },
            {
              id: "s2",
              action: "see",
              screenRef: "detail",
              next: [],
            },
          ],
        },
      ],
    });
    const result = seedScreenDesignFromIa(input, emptyScreenDesign);
    const homePage = result.phase.pages.find((p) => p.id === "home");
    const detailPage = result.phase.pages.find((p) => p.id === "detail");
    expect(homePage?.outPages).toEqual(["detail"]);
    expect(detailPage?.inPages).toEqual(["home"]);
  });

  it("primaryEntity가 등록된 엔티티면 entityIds에 매핑된다", () => {
    const input = ia({
      sitemap: [node("home", { primaryEntity: "Project" })],
    });
    const entityMap = new Map([["Project", "entity-1"]]);
    const result = seedScreenDesignFromIa(
      input,
      emptyScreenDesign,
      entityMap,
    );
    expect(result.phase.pages[0].entityIds).toEqual(["entity-1"]);
  });
});
