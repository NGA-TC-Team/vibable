"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";
import type { SitemapNode } from "@/types/phases";

function SitemapTree({ nodes, depth = 0 }: { nodes: SitemapNode[]; depth?: number }) {
  return (
    <ul className={depth > 0 ? "ml-4 border-l pl-3" : ""}>
      {nodes.map((node) => (
        <li key={node.id} className="py-1">
          <span className="font-medium">{node.label || "이름 없음"}</span>
          {node.path && <span className="ml-2 text-xs text-muted-foreground">{node.path}</span>}
          {node.children.length > 0 && <SitemapTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export function InfoArchitecturePreview() {
  const { data } = usePhaseData("infoArchitecture");
  if (!data) return null;

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-2">
        <h2 className="text-base font-semibold">사이트맵</h2>
        {data.sitemap.length === 0 ? (
          <p className="text-muted-foreground/50 italic">사이트맵 노드를 추가하세요</p>
        ) : (
          <SitemapTree nodes={data.sitemap} />
        )}
      </section>

      {data.userFlows.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">유저 플로우</h2>
          {data.userFlows.map((flow) => (
            <div key={flow.id} className="space-y-1">
              <p className="font-medium">{flow.name}</p>
              <ol className="ml-4 list-decimal">
                {flow.steps.map((s) => (
                  <li key={s.id}>{s.action}</li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}

      {data.globalNavRules.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">네비게이션 규칙</h2>
          <ul className="ml-4 list-disc">{data.globalNavRules.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
