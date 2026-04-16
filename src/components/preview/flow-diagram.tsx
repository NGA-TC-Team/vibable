"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import dagre from "dagre";

import "@xyflow/react/dist/style.css";

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB",
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 60 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.measured?.width ?? 180, height: node.measured?.height ?? 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const w = node.measured?.width ?? 180;
    const h = node.measured?.height ?? 50;
    return {
      ...node,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}

interface FlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeTypes?: Record<string, React.ComponentType<any>>;
  direction?: "TB" | "LR";
}

function FlowDiagramInner({ nodes, edges, nodeTypes, direction = "TB" }: FlowDiagramProps) {
  const { fitView } = useReactFlow();

  const layouted = getLayoutedElements(nodes, edges, direction);

  const onInit = useCallback(() => {
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [fitView]);

  useEffect(() => {
    fitView({ padding: 0.2 });
  }, [nodes.length, edges.length, fitView]);

  return (
    <ReactFlow
      nodes={layouted.nodes}
      edges={layouted.edges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      fitView
      minZoom={0.3}
      maxZoom={2}
      onInit={onInit}
      proOptions={{ hideAttribution: true }}
    />
  );
}

export function FlowDiagram(props: FlowDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
