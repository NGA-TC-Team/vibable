import type { InfoArchitecturePhase, ScreenType } from "@/types/phases";
import { flattenSitemap } from "./info-arch-utils";

const VALID_SCREEN_TYPES: ScreenType[] = [
  "hub",
  "list",
  "detail",
  "create",
  "edit",
  "review",
  "result",
  "settings",
];

export type IaDiagnostic =
  | { kind: "orphan-sitemap-node"; nodeId: string; label: string }
  | { kind: "missing-screen-ref"; flowId: string; flowName: string; stepId: string }
  | {
      kind: "unknown-screen-ref";
      flowId: string;
      flowName: string;
      stepId: string;
      ref: string;
    }
  | {
      kind: "dangling-next";
      flowId: string;
      flowName: string;
      stepId: string;
      targetId: string;
    }
  | { kind: "flow-without-steps"; flowId: string; flowName: string }
  | { kind: "unreachable-step"; flowId: string; flowName: string; stepId: string }
  | { kind: "node-missing-purpose"; nodeId: string; label: string }
  | { kind: "flow-missing-goal"; flowId: string; flowName: string }
  | { kind: "flow-no-endings-marked"; flowId: string; flowName: string }
  | { kind: "review-screen-unassigned"; nodeId: string; label: string }
  | { kind: "nav-rule-missing-body"; ruleId: string }
  | { kind: "nav-rule-unknown-screen-type"; ruleId: string; title: string }
  | {
      kind: "unknown-role-ref";
      source: "sitemap-audience" | "flow-primaryActor" | "step-actor";
      refName: string;
      where: string;
    }
  | {
      kind: "unknown-entity-ref";
      nodeId: string;
      label: string;
      refName: string;
    };

export type IaDiagnosticKind = IaDiagnostic["kind"];

export const DIAGNOSTIC_SEVERITY: Record<
  IaDiagnosticKind,
  "warning" | "info"
> = {
  "orphan-sitemap-node": "info",
  "missing-screen-ref": "warning",
  "unknown-screen-ref": "warning",
  "dangling-next": "warning",
  "flow-without-steps": "warning",
  "unreachable-step": "warning",
  "node-missing-purpose": "info",
  "flow-missing-goal": "info",
  "flow-no-endings-marked": "info",
  "review-screen-unassigned": "info",
  "nav-rule-missing-body": "warning",
  "nav-rule-unknown-screen-type": "warning",
  "unknown-role-ref": "info",
  "unknown-entity-ref": "info",
};

export const DIAGNOSTIC_LABELS: Record<IaDiagnosticKind, string> = {
  "orphan-sitemap-node": "플로우에 쓰이지 않는 화면",
  "missing-screen-ref": "연결 화면이 비어있는 스텝",
  "unknown-screen-ref": "사이트맵에 없는 화면을 참조하는 스텝",
  "dangling-next": "같은 플로우에 존재하지 않는 스텝으로의 이동",
  "flow-without-steps": "스텝이 하나도 없는 플로우",
  "unreachable-step": "도달 불가능한 스텝",
  "node-missing-purpose": "존재 이유가 비어있는 화면",
  "flow-missing-goal": "완료 정의가 없는 플로우",
  "flow-no-endings-marked": "성공/실패 종료 미지정 플로우",
  "review-screen-unassigned": "승인/검토 화면의 수행 주체 미설정",
  "nav-rule-missing-body": "본문이 비어있는 네비 규칙",
  "nav-rule-unknown-screen-type": "정의되지 않은 화면 역할을 대상으로 하는 규칙",
  "unknown-role-ref": "등록되지 않은 역할 참조",
  "unknown-entity-ref": "등록되지 않은 엔티티 참조",
};

export function diagnoseInfoArchitecture(
  ia: InfoArchitecturePhase,
): IaDiagnostic[] {
  const diagnostics: IaDiagnostic[] = [];
  const flatNodes = flattenSitemap(ia.sitemap);
  const nodeIds = new Set(flatNodes.map((n) => n.id));
  const referencedNodeIds = new Set<string>();

  ia.userFlows.forEach((flow) => {
    const flowName = flow.name || "이름 없는 플로우";

    if (!(flow.goal ?? "").trim()) {
      diagnostics.push({
        kind: "flow-missing-goal",
        flowId: flow.id,
        flowName,
      });
    }

    if (flow.steps.length === 0) {
      diagnostics.push({
        kind: "flow-without-steps",
        flowId: flow.id,
        flowName,
      });
      return;
    }

    const hasEndings =
      (flow.successEndings?.length ?? 0) > 0 ||
      (flow.failureEndings?.length ?? 0) > 0;
    if (!hasEndings) {
      diagnostics.push({
        kind: "flow-no-endings-marked",
        flowId: flow.id,
        flowName,
      });
    }

    const stepIds = new Set(flow.steps.map((s) => s.id));
    const reachable = new Set<string>();
    reachable.add(flow.steps[0].id);

    flow.steps.forEach((step) => {
      const ref = step.screenRef?.trim() ?? "";
      if (!ref) {
        diagnostics.push({
          kind: "missing-screen-ref",
          flowId: flow.id,
          flowName,
          stepId: step.id,
        });
      } else if (!nodeIds.has(ref)) {
        diagnostics.push({
          kind: "unknown-screen-ref",
          flowId: flow.id,
          flowName,
          stepId: step.id,
          ref,
        });
      } else {
        referencedNodeIds.add(ref);
      }

      step.next.forEach((targetId) => {
        if (!stepIds.has(targetId)) {
          diagnostics.push({
            kind: "dangling-next",
            flowId: flow.id,
            flowName,
            stepId: step.id,
            targetId,
          });
        } else {
          reachable.add(targetId);
        }
      });
    });

    flow.steps.forEach((step) => {
      if (!reachable.has(step.id)) {
        diagnostics.push({
          kind: "unreachable-step",
          flowId: flow.id,
          flowName,
          stepId: step.id,
        });
      }
    });
  });

  flatNodes.forEach((node) => {
    if (!referencedNodeIds.has(node.id)) {
      diagnostics.push({
        kind: "orphan-sitemap-node",
        nodeId: node.id,
        label: node.label || "이름 없는 노드",
      });
    }
  });

  // purpose는 옵셔널 상의 사이트맵 전체 노드에서 검사 (사용자 확정 1차 경고)
  const nodeMetaById = new Map<
    string,
    {
      purpose: string;
      screenType?: ScreenType;
      audience: string[];
      primaryEntity: string;
    }
  >();
  const collectMeta = (nodes: InfoArchitecturePhase["sitemap"]) => {
    nodes.forEach((n) => {
      nodeMetaById.set(n.id, {
        purpose: (n.purpose ?? "").trim(),
        screenType: n.screenType,
        audience: n.audience ?? [],
        primaryEntity: (n.primaryEntity ?? "").trim(),
      });
      collectMeta(n.children);
    });
  };
  collectMeta(ia.sitemap);

  flatNodes.forEach((node) => {
    const meta = nodeMetaById.get(node.id);
    if (!meta) return;
    if (!meta.purpose) {
      diagnostics.push({
        kind: "node-missing-purpose",
        nodeId: node.id,
        label: node.label || "이름 없는 노드",
      });
    }
    if (meta.screenType === "review" && meta.audience.length === 0) {
      diagnostics.push({
        kind: "review-screen-unassigned",
        nodeId: node.id,
        label: node.label || "이름 없는 노드",
      });
    }
  });

  ia.globalNavRules.forEach((rule) => {
    if (!rule.rule?.trim()) {
      diagnostics.push({
        kind: "nav-rule-missing-body",
        ruleId: rule.id,
      });
    }
    const invalidTypes = (rule.appliesTo?.screenTypes ?? []).filter(
      (t) => !VALID_SCREEN_TYPES.includes(t),
    );
    if (invalidTypes.length > 0) {
      diagnostics.push({
        kind: "nav-rule-unknown-screen-type",
        ruleId: rule.id,
        title: rule.title || "이름 없는 규칙",
      });
    }
  });

  // 역할·엔티티 참조 무결성 (3차)
  const roleNames = new Set(
    (ia.roles ?? []).filter((r) => r.name).map((r) => r.name),
  );
  const entityNames = new Set(
    (ia.entities ?? []).filter((e) => e.name).map((e) => e.name),
  );
  if (roleNames.size > 0) {
    const pushUnknownRole = (
      refName: string,
      source: "sitemap-audience" | "flow-primaryActor" | "step-actor",
      where: string,
    ) => {
      if (!refName.trim()) return;
      if (!roleNames.has(refName)) {
        diagnostics.push({
          kind: "unknown-role-ref",
          source,
          refName,
          where,
        });
      }
    };

    flatNodes.forEach((node) => {
      const audience =
        nodeMetaById.get(node.id)?.audience ?? [];
      audience.forEach((a) =>
        pushUnknownRole(
          a,
          "sitemap-audience",
          node.label || node.id,
        ),
      );
    });
    ia.userFlows.forEach((flow) => {
      pushUnknownRole(
        flow.primaryActor ?? "",
        "flow-primaryActor",
        flow.name || flow.id,
      );
      flow.steps.forEach((step) => {
        pushUnknownRole(
          step.actor ?? "",
          "step-actor",
          `${flow.name || flow.id} / ${step.id}`,
        );
      });
    });
  }

  if (entityNames.size > 0) {
    flatNodes.forEach((node) => {
      const meta = nodeMetaById.get(node.id);
      const primary = meta?.primaryEntity ?? "";
      if (primary && !entityNames.has(primary)) {
        diagnostics.push({
          kind: "unknown-entity-ref",
          nodeId: node.id,
          label: node.label || "이름 없는 노드",
          refName: primary,
        });
      }
    });
  }

  return diagnostics;
}

export function groupDiagnostics(
  diagnostics: IaDiagnostic[],
): Record<IaDiagnosticKind, IaDiagnostic[]> {
  const initial = Object.keys(DIAGNOSTIC_LABELS).reduce(
    (acc, key) => {
      acc[key as IaDiagnosticKind] = [];
      return acc;
    },
    {} as Record<IaDiagnosticKind, IaDiagnostic[]>,
  );
  return diagnostics.reduce((acc, d) => {
    acc[d.kind].push(d);
    return acc;
  }, initial);
}
