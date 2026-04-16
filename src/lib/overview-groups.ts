import type { Milestone, OverviewPhase, SuccessMetric } from "@/types/phases";

/** 그룹 모델이 있으면 parent+children 순서로 펼침, 없으면 레거시 평면 배열 */
export function flattenOverviewSuccessMetrics(overview: OverviewPhase): SuccessMetric[] {
  const groups = overview.successMetricGroups;
  if (groups?.length) {
    return groups.flatMap((g) => [g.parent, ...g.children]);
  }
  return overview.successMetrics ?? [];
}

export function flattenOverviewTimeline(overview: OverviewPhase): Milestone[] {
  const groups = overview.milestoneGroups;
  if (groups?.length) {
    return groups.flatMap((g) => [g.parent, ...g.children]);
  }
  return overview.timeline ?? [];
}

export function overviewHasSuccessMetricContent(overview: OverviewPhase): boolean {
  return flattenOverviewSuccessMetrics(overview).length > 0;
}

export function overviewHasTimelineContent(overview: OverviewPhase): boolean {
  return flattenOverviewTimeline(overview).length > 0;
}
