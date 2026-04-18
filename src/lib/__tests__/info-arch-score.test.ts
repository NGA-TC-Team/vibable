import { describe, it, expect } from "vitest";
import { computeIaQualityScore } from "../info-arch-score";
import type { InfoArchitecturePhase } from "@/types/phases";

function ia(overrides?: Partial<InfoArchitecturePhase>): InfoArchitecturePhase {
  return {
    sitemap: [],
    userFlows: [],
    globalNavRules: [],
    ...overrides,
  };
}

describe("computeIaQualityScore", () => {
  it("빈 IA는 0점을 반환한다", () => {
    const score = computeIaQualityScore(ia());
    expect(score.overall).toBe(0);
  });

  it("기본 구조만 있는 IA는 낮은 점수가 나온다", () => {
    const score = computeIaQualityScore(
      ia({
        sitemap: [
          {
            id: "n1",
            label: "홈",
            path: "/",
            children: [],
          },
        ],
      }),
    );
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThan(50);
  });

  it("풍부한 IA는 높은 점수가 나온다", () => {
    const score = computeIaQualityScore(
      ia({
        sitemap: [
          {
            id: "home",
            label: "홈",
            path: "/",
            purpose: "진입점",
            screenType: "hub",
            primaryTask: "기능 선택",
            audience: ["member"],
            children: [],
          },
        ],
        userFlows: [
          {
            id: "f1",
            name: "온보딩",
            goal: "계정 생성 완료",
            primaryActor: "신규",
            successEndings: ["s1"],
            steps: [
              {
                id: "s1",
                action: "complete",
                screenRef: "home",
                next: [],
              },
            ],
          },
        ],
        globalNavRules: [
          {
            id: "r1",
            title: "접근 제한",
            rule: "로그인 필수",
            severity: "critical",
          },
        ],
        roles: [{ id: "role-1", name: "member" }],
        entities: [{ id: "e-1", name: "User" }],
      }),
    );
    expect(score.overall).toBeGreaterThanOrEqual(80);
  });

  it("breakdown은 5개 축을 모두 반환한다", () => {
    const score = computeIaQualityScore(ia());
    expect(Object.keys(score.breakdown)).toEqual([
      "structure",
      "intent",
      "flowCoverage",
      "connectivity",
      "governance",
    ]);
  });
});
