"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type Node, type Edge, type NodeProps } from "@xyflow/react";
import type { SitemapNode, ScreenType } from "@/types/phases";
import { SCREEN_TYPE_LABELS } from "@/lib/constants";
import { FlowDiagram } from "./flow-diagram";

type SitemapNodeData = {
  label: string;
  path?: string;
  depth: number;
  isRoot: boolean;
  isLeaf: boolean;
  screenType?: ScreenType;
  purpose?: string;
  audience?: string[];
  primaryEntity?: string;
};

const DEPTH_TONES = [
  "border-primary bg-primary text-primary-foreground",
  "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-100",
  "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-100",
  "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-100",
  "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100",
] as const;

const SitemapNodeComponent = memo(function SitemapNodeComponent({
  data,
}: NodeProps<Node<SitemapNodeData>>) {
  const bgClass = data.isRoot
    ? DEPTH_TONES[0]
    : data.isLeaf
      ? "border-border bg-muted/70 text-muted-foreground"
      : DEPTH_TONES[Math.min(data.depth, DEPTH_TONES.length - 1)];

  return (
    <div className={`rounded-lg border px-4 py-2 text-center shadow-sm ${bgClass}`}>
      <Handle type="target" position={Position.Top} className="invisible!" />
      <div className="text-sm font-medium">{data.label}</div>
      {data.path && (
        <div className="text-xs opacity-70">{data.path}</div>
      )}
      {data.screenType && (
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {SCREEN_TYPE_LABELS[data.screenType]}
        </div>
      )}
      {data.purpose && (
        <div className="mt-0.5 max-w-[220px] truncate text-[10px] opacity-60">
          {data.purpose}
        </div>
      )}
      {(data.audience?.length ?? 0) > 0 && (
        <div className="mt-0.5 text-[9px] opacity-70">
          👤 {data.audience!.join(", ")}
        </div>
      )}
      {data.primaryEntity && (
        <div className="mt-0.5 text-[9px] opacity-70">
          📦 {data.primaryEntity}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="invisible!" />
    </div>
  );
});

const nodeTypes = { sitemapNode: SitemapNodeComponent };

function flatten(
  nodes: SitemapNode[],
  parentId: string | undefined,
  depth: number,
): { nodes: Node[]; edges: Edge[] } {
  const result: { nodes: Node[]; edges: Edge[] } = { nodes: [], edges: [] };

  nodes.forEach((node) => {
    const isLeaf = node.children.length === 0;
    const flowNode: Node<SitemapNodeData> = {
      id: node.id,
      type: "sitemapNode",
      position: { x: 0, y: 0 },
      data: {
        label: node.label || "이름 없음",
        path: node.path,
        depth,
        isRoot: depth === 0,
        isLeaf,
        screenType: node.screenType,
        purpose: node.purpose,
        audience: node.audience,
        primaryEntity: node.primaryEntity,
      },
    };
    result.nodes.push(flowNode);

    if (parentId) {
      result.edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
        animated: true,
        style: {
          strokeDasharray: "6 3",
        },
      });
    }

    const children = flatten(node.children, node.id, depth + 1);
    result.nodes.push(...children.nodes);
    result.edges.push(...children.edges);
  });

  return result;
}

interface SitemapDiagramProps {
  sitemap: SitemapNode[];
}

export function SitemapDiagram({ sitemap }: SitemapDiagramProps) {
  const { nodes, edges } = useMemo(() => flatten(sitemap, undefined, 0), [sitemap]);

  if (nodes.length === 0) {
    return <p className="text-sm text-muted-foreground/50 italic">사이트맵 노드를 추가하세요</p>;
  }

  return (
    <div className="h-[500px] w-full">
      <FlowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} direction="TB" />
    </div>
  );
}
