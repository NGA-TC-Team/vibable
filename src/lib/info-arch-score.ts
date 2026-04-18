import type { InfoArchitecturePhase } from "@/types/phases";
import {
  diagnoseInfoArchitecture,
  DIAGNOSTIC_SEVERITY,
  type IaDiagnosticKind,
} from "./info-arch-diagnostics";
import { flattenSitemap } from "./info-arch-utils";

export interface IaQualityScore {
  /** 0 (빈 IA) ~ 100 (모든 주요 필드 채워지고 경고 없음) */
  overall: number;
  breakdown: {
    structure: number;      // 사이트맵 노드 수·역할 지정률
    intent: number;         // 화면 목적·핵심 과업 채움율
    flowCoverage: number;   // 플로우 존재 + screenRef 채움율 + 종료 지정
    connectivity: number;   // 연결 무결성(경고 없을수록 높음)
    governance: number;     // 네비 규칙·roles/entities 정의율
  };
  hint: string;
}

const WEIGHT_PER_WARNING: Partial<Record<IaDiagnosticKind, number>> = {
  "missing-screen-ref": 5,
  "unknown-screen-ref": 7,
  "dangling-next": 7,
  "flow-without-steps": 10,
  "unreachable-step": 4,
  "nav-rule-missing-body": 5,
  "nav-rule-unknown-screen-type": 5,
};

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function computeIaQualityScore(
  ia: InfoArchitecturePhase,
): IaQualityScore {
  const flat = flattenSitemap(ia.sitemap);
  const nodeCount = flat.length;
  const flowCount = ia.userFlows.length;

  if (nodeCount === 0 && flowCount === 0) {
    return {
      overall: 0,
      breakdown: {
        structure: 0,
        intent: 0,
        flowCoverage: 0,
        connectivity: 0,
        governance: 0,
      },
      hint: "사이트맵과 플로우를 먼저 추가하세요",
    };
  }

  // 1. Structure: 노드 존재 + screenType 지정률
  const typedNodes = ia.sitemap.length > 0 ? countTyped(ia.sitemap) : 0;
  const structure = nodeCount === 0
    ? 0
    : clamp(50 + (typedNodes / nodeCount) * 50);

  // 2. Intent: purpose + primaryTask 채움율
  const purposeFilled = ia.sitemap.length > 0 ? countPurpose(ia.sitemap) : 0;
  const taskFilled = ia.sitemap.length > 0 ? countTask(ia.sitemap) : 0;
  const intent = nodeCount === 0
    ? 0
    : clamp(((purposeFilled + taskFilled) / (nodeCount * 2)) * 100);

  // 3. Flow coverage
  const totalSteps = ia.userFlows.reduce((s, f) => s + f.steps.length, 0);
  const refFilledSteps = ia.userFlows.reduce(
    (s, f) => s + f.steps.filter((st) => (st.screenRef ?? "").trim()).length,
    0,
  );
  const flowsWithGoal = ia.userFlows.filter((f) => (f.goal ?? "").trim()).length;
  const flowsWithEnding = ia.userFlows.filter(
    (f) =>
      (f.successEndings?.length ?? 0) > 0 ||
      (f.failureEndings?.length ?? 0) > 0,
  ).length;
  const flowCoverage =
    flowCount === 0
      ? 0
      : clamp(
          (refFilledSteps / Math.max(1, totalSteps)) * 50 +
            (flowsWithGoal / flowCount) * 25 +
            (flowsWithEnding / flowCount) * 25,
        );

  // 4. Connectivity: 경고 기반 감점
  const diagnostics = diagnoseInfoArchitecture(ia);
  const warnings = diagnostics.filter(
    (d) => DIAGNOSTIC_SEVERITY[d.kind] === "warning",
  );
  const penalty = warnings.reduce(
    (sum, d) => sum + (WEIGHT_PER_WARNING[d.kind] ?? 3),
    0,
  );
  const connectivity = clamp(100 - penalty);

  // 5. Governance: 네비 규칙 본문·중요도 + roles/entities 정의
  const ruleCount = ia.globalNavRules.length;
  const ruleFilled = ia.globalNavRules.filter(
    (r) => r.rule?.trim() && r.severity,
  ).length;
  const roleDefined = (ia.roles ?? []).filter((r) => r.name).length;
  const entityDefined = (ia.entities ?? []).filter((e) => e.name).length;
  const governance = clamp(
    (ruleCount > 0 ? (ruleFilled / ruleCount) * 40 : 0) +
      (roleDefined > 0 ? 30 : 0) +
      (entityDefined > 0 ? 30 : 0),
  );

  const overall = Math.round(
    (structure + intent + flowCoverage + connectivity + governance) / 5,
  );

  const hint =
    overall >= 80
      ? "IA가 다음 페이즈로 넘어갈 준비가 거의 됐습니다"
      : overall >= 50
        ? "경고 항목과 낮은 카테고리부터 보강하세요"
        : "기본 메타(역할·목적·플로우 연결)부터 채우세요";

  return {
    overall,
    breakdown: {
      structure: Math.round(structure),
      intent: Math.round(intent),
      flowCoverage: Math.round(flowCoverage),
      connectivity: Math.round(connectivity),
      governance: Math.round(governance),
    },
    hint,
  };
}

function countTyped(nodes: InfoArchitecturePhase["sitemap"]): number {
  return nodes.reduce(
    (sum, n) =>
      sum + (n.screenType ? 1 : 0) + countTyped(n.children),
    0,
  );
}

function countPurpose(nodes: InfoArchitecturePhase["sitemap"]): number {
  return nodes.reduce(
    (sum, n) =>
      sum + ((n.purpose ?? "").trim() ? 1 : 0) + countPurpose(n.children),
    0,
  );
}

function countTask(nodes: InfoArchitecturePhase["sitemap"]): number {
  return nodes.reduce(
    (sum, n) =>
      sum + ((n.primaryTask ?? "").trim() ? 1 : 0) + countTask(n.children),
    0,
  );
}

export const BREAKDOWN_LABELS: Record<
  keyof IaQualityScore["breakdown"],
  string
> = {
  structure: "구조",
  intent: "기획 의도",
  flowCoverage: "플로우 연결",
  connectivity: "무결성",
  governance: "거버넌스",
};
