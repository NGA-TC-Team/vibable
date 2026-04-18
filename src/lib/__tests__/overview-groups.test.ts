import { describe, it, expect } from "vitest";
import {
  flattenOverviewSuccessMetrics,
  flattenOverviewTimeline,
  overviewHasSuccessMetricContent,
  overviewHasTimelineContent,
} from "../overview-groups";
import type { OverviewPhase } from "@/types/phases";

function makeOverview(overrides?: Partial<OverviewPhase>): OverviewPhase {
  return {
    projectName: "",
    elevatorPitch: "",
    background: "",
    coreValueProposition: "",
    businessGoals: [],
    targetUsers: "",
    scope: { type: "mvp", details: "" },
    competitors: [],
    constraints: [],
    successMetrics: [],
    successMetricGroups: [],
    timeline: [],
    milestoneGroups: [],
    references: [],
    techStack: "",
    ...overrides,
  };
}

function makeMetric(id: string) {
  return { id, metric: `metric-${id}`, target: "100", measurement: "analytics" };
}

function makeMilestone(id: string) {
  return { id, milestone: `milestone-${id}`, date: "Q1", description: "출시" };
}

describe("flattenOverviewSuccessMetrics", () => {
  it("정상: successMetricGroups가 있으면 parent+children 순으로 펼침", () => {
    const parent = makeMetric("p1");
    const child1 = makeMetric("c1");
    const child2 = makeMetric("c2");
    const overview = makeOverview({
      successMetricGroups: [
        { id: "grp-p1", parent, children: [child1, child2] },
      ],
    });

    const result = flattenOverviewSuccessMetrics(overview);

    expect(result).toEqual([parent, child1, child2]);
  });

  it("레거시: groups가 없고 successMetrics만 있으면 평면 배열 반환", () => {
    const m1 = makeMetric("m1");
    const m2 = makeMetric("m2");
    const overview = makeOverview({ successMetrics: [m1, m2] });

    const result = flattenOverviewSuccessMetrics(overview);

    expect(result).toEqual([m1, m2]);
  });

  it("엣지: 둘 다 비어 있으면 빈 배열 반환", () => {
    const overview = makeOverview();

    const result = flattenOverviewSuccessMetrics(overview);

    expect(result).toEqual([]);
  });

  it("그룹이 있으면 평면 successMetrics를 무시함", () => {
    const parent = makeMetric("p1");
    const legacyMetric = makeMetric("legacy");
    const overview = makeOverview({
      successMetrics: [legacyMetric],
      successMetricGroups: [{ id: "grp-p1", parent, children: [] }],
    });

    const result = flattenOverviewSuccessMetrics(overview);

    expect(result).toEqual([parent]);
    expect(result).not.toContainEqual(legacyMetric);
  });

  it("불변성: 원본 데이터를 변경하지 않음", () => {
    const original = makeOverview({
      successMetricGroups: [{ id: "grp-1", parent: makeMetric("p1"), children: [] }],
    });
    const originalGroups = [...original.successMetricGroups];

    flattenOverviewSuccessMetrics(original);

    expect(original.successMetricGroups).toEqual(originalGroups);
  });
});

describe("flattenOverviewTimeline", () => {
  it("정상: milestoneGroups가 있으면 parent+children 순으로 펼침", () => {
    const parent = makeMilestone("m1");
    const child = makeMilestone("m2");
    const overview = makeOverview({
      milestoneGroups: [{ id: "grp-m1", parent, children: [child] }],
    });

    const result = flattenOverviewTimeline(overview);

    expect(result).toEqual([parent, child]);
  });

  it("레거시: groups가 없고 timeline만 있으면 평면 배열 반환", () => {
    const ms = makeMilestone("m1");
    const overview = makeOverview({ timeline: [ms] });

    const result = flattenOverviewTimeline(overview);

    expect(result).toEqual([ms]);
  });

  it("엣지: 둘 다 비어 있으면 빈 배열 반환", () => {
    const overview = makeOverview();

    const result = flattenOverviewTimeline(overview);

    expect(result).toEqual([]);
  });

  it("그룹이 있으면 레거시 timeline을 무시함", () => {
    const parent = makeMilestone("m1");
    const legacyMs = makeMilestone("legacy");
    const overview = makeOverview({
      timeline: [legacyMs],
      milestoneGroups: [{ id: "grp-m1", parent, children: [] }],
    });

    const result = flattenOverviewTimeline(overview);

    expect(result).toContainEqual(parent);
    expect(result).not.toContainEqual(legacyMs);
  });
});

describe("overviewHasSuccessMetricContent", () => {
  it("정상: groups에 항목이 있으면 true 반환", () => {
    const overview = makeOverview({
      successMetricGroups: [
        { id: "grp-1", parent: makeMetric("p1"), children: [] },
      ],
    });

    expect(overviewHasSuccessMetricContent(overview)).toBe(true);
  });

  it("레거시: successMetrics에 항목이 있으면 true 반환", () => {
    const overview = makeOverview({ successMetrics: [makeMetric("m1")] });

    expect(overviewHasSuccessMetricContent(overview)).toBe(true);
  });

  it("엣지: 둘 다 비어 있으면 false 반환", () => {
    expect(overviewHasSuccessMetricContent(makeOverview())).toBe(false);
  });
});

describe("overviewHasTimelineContent", () => {
  it("정상: milestoneGroups에 항목이 있으면 true 반환", () => {
    const overview = makeOverview({
      milestoneGroups: [
        { id: "grp-1", parent: makeMilestone("m1"), children: [] },
      ],
    });

    expect(overviewHasTimelineContent(overview)).toBe(true);
  });

  it("레거시: timeline에 항목이 있으면 true 반환", () => {
    const overview = makeOverview({ timeline: [makeMilestone("m1")] });

    expect(overviewHasTimelineContent(overview)).toBe(true);
  });

  it("엣지: 둘 다 비어 있으면 false 반환", () => {
    expect(overviewHasTimelineContent(makeOverview())).toBe(false);
  });
});
