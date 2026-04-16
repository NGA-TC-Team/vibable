"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type Node, type Edge, type NodeProps } from "@xyflow/react";
import type { SitemapNode } from "@/types/phases";
import { FlowDiagram } from "./flow-diagram";

type SitemapNodeData = {
  label: string;
  path?: string;
  isRoot: boolean;
  isLeaf: boolean;
};

const SitemapNodeComponent = memo(function SitemapNodeComponent({
  data,
}: NodeProps<Node<SitemapNodeData>>) {
  const bgClass = data.isRoot
    ? "bg-primary text-primary-foreground"
    : data.isLeaf
      ? "bg-muted text-muted-foreground"
      : "bg-card text-card-foreground border";

  return (
    <div className={`rounded-lg px-4 py-2 text-center shadow-sm ${bgClass}`}>
      <Handle type="target" position={Position.Top} className="!invisible" />
      <div className="text-sm font-medium">{data.label}</div>
      {data.path && (
        <div className="text-xs opacity-70">{data.path}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!invisible" />
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
        isRoot: depth === 0,
        isLeaf,
      },
    };
    result.nodes.push(flowNode);

    if (parentId) {
      result.edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
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
