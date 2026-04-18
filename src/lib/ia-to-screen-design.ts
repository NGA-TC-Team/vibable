import type {
  InfoArchitecturePhase,
  ScreenDesignPhase,
  ScreenPage,
  SitemapNode,
} from "@/types/phases";
import { flattenSitemap } from "./info-arch-utils";

export interface SeedResult {
  phase: ScreenDesignPhase;
  added: string[];
  skipped: string[];
}

function buildInOutMaps(ia: InfoArchitecturePhase): {
  inPagesById: Map<string, Set<string>>;
  outPagesById: Map<string, Set<string>>;
} {
  const inPagesById = new Map<string, Set<string>>();
  const outPagesById = new Map<string, Set<string>>();
  ia.userFlows.forEach((flow) => {
    const stepById = new Map(flow.steps.map((s) => [s.id, s]));
    flow.steps.forEach((step) => {
      const sourceRef = (step.screenRef ?? "").trim();
      if (!sourceRef) return;
      step.next.forEach((nextStepId) => {
        const target = stepById.get(nextStepId);
        const targetRef = target?.screenRef?.trim() ?? "";
        if (!targetRef || targetRef === sourceRef) return;
        if (!outPagesById.has(sourceRef))
          outPagesById.set(sourceRef, new Set());
        outPagesById.get(sourceRef)!.add(targetRef);
        if (!inPagesById.has(targetRef))
          inPagesById.set(targetRef, new Set());
        inPagesById.get(targetRef)!.add(sourceRef);
      });
    });
  });
  return { inPagesById, outPagesById };
}

/**
 * 사이트맵 노드를 screenDesign.pages로 시드한다.
 * - 기존 페이지는 id 일치 시 보존(무변경)
 * - 신규 노드만 pages 배열 뒤에 추가
 * - IA의 inPages/outPages는 플로우 연결로부터 유도
 */
export function seedScreenDesignFromIa(
  ia: InfoArchitecturePhase,
  existing: ScreenDesignPhase,
  entityNameToId: Map<string, string> = new Map(),
): SeedResult {
  const flat = flattenSitemap(ia.sitemap);
  const existingIds = new Set(existing.pages.map((p) => p.id));
  const { inPagesById, outPagesById } = buildInOutMaps(ia);

  const added: string[] = [];
  const skipped: string[] = [];
  const newPages: ScreenPage[] = [];

  flat.forEach((flatNode) => {
    if (existingIds.has(flatNode.id)) {
      skipped.push(flatNode.id);
      return;
    }
    const fullNode = findNode(ia.sitemap, flatNode.id);
    if (!fullNode) return;

    const entityId = fullNode.primaryEntity
      ? entityNameToId.get(fullNode.primaryEntity) ?? ""
      : "";

    const page: ScreenPage = {
      id: fullNode.id,
      name: fullNode.label || "이름 없음",
      route: fullNode.path ?? "",
      entityIds: entityId ? [entityId] : [],
      uxIntent: {
        userGoal: fullNode.primaryTask ?? "",
        businessIntent: fullNode.purpose ?? "",
      },
      states: {
        idle: "",
        loading: "",
        offline: "",
        errors: [],
      },
      interactions: [],
      inPages: Array.from(inPagesById.get(fullNode.id) ?? []),
      outPages: Array.from(outPagesById.get(fullNode.id) ?? []),
    };
    newPages.push(page);
    added.push(fullNode.id);
  });

  return {
    phase: { ...existing, pages: [...existing.pages, ...newPages] },
    added,
    skipped,
  };
}

function findNode(nodes: SitemapNode[], id: string): SitemapNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = findNode(n.children, id);
    if (hit) return hit;
  }
  return null;
}
