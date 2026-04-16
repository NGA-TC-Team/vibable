"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type Node, type Edge, type NodeProps } from "@xyflow/react";
import type { UserFlow } from "@/types/phases";
import { FlowDiagram } from "./flow-diagram";

type FlowNodeData = {
  label: string;
  variant: "start" | "end" | "step";
};

const FlowNodeComponent = memo(function FlowNodeComponent({
  data,
}: NodeProps<Node<FlowNodeData>>) {
  const isTerminal = data.variant === "start" || data.variant === "end";
  const bgClass = isTerminal
    ? "bg-primary text-primary-foreground rounded-full"
    : "bg-card text-card-foreground border rounded-lg";

  return (
    <div className={`px-4 py-2 text-center shadow-sm ${bgClass}`}>
      <Handle type="target" position={Position.Top} className="!invisible" />
      <div className="text-sm font-medium">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!invisible" />
    </div>
  );
});

const nodeTypes = { flowNode: FlowNodeComponent };

function userFlowToFlow(flow: UserFlow): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const startId = `${flow.id}-start`;
  nodes.push({
    id: startId,
    type: "flowNode",
    position: { x: 0, y: 0 },
    data: { label: "시작", variant: "start" },
  });

  flow.steps.forEach((step) => {
    nodes.push({
      id: step.id,
      type: "flowNode",
      position: { x: 0, y: 0 },
      data: { label: step.action || "—", variant: "step" },
    });
  });

  const edgeStyle = { strokeDasharray: "6 3" };

  if (flow.steps.length > 0) {
    edges.push({
      id: `e-start-${flow.steps[0].id}`,
      source: startId,
      target: flow.steps[0].id,
      type: "smoothstep",
      animated: true,
      style: edgeStyle,
    });
  }

  const stepsWithoutNext = new Set(flow.steps.map((s) => s.id));

  flow.steps.forEach((step) => {
    step.next.forEach((nextId) => {
      const targetExists = flow.steps.some((s) => s.id === nextId);
      if (targetExists) {
        stepsWithoutNext.delete(nextId);
        edges.push({
          id: `e-${step.id}-${nextId}`,
          source: step.id,
          target: nextId,
          type: "smoothstep",
          animated: true,
          style: edgeStyle,
        });
      }
    });
  });

  const terminalSteps = flow.steps.filter(
    (s) => s.next.length === 0 || s.next.every((n) => !flow.steps.some((ss) => ss.id === n)),
  );

  if (terminalSteps.length > 0) {
    const endId = `${flow.id}-end`;
    nodes.push({
      id: endId,
      type: "flowNode",
      position: { x: 0, y: 0 },
      data: { label: "종료", variant: "end" },
    });
    terminalSteps.forEach((step) => {
      edges.push({
        id: `e-${step.id}-end`,
        source: step.id,
        target: endId,
        type: "smoothstep",
        animated: true,
        style: edgeStyle,
      });
    });
  }

  return { nodes, edges };
}

interface UserFlowDiagramProps {
  flow: UserFlow;
}

export function UserFlowDiagram({ flow }: UserFlowDiagramProps) {
  const { nodes, edges } = useMemo(() => userFlowToFlow(flow), [flow]);

  if (flow.steps.length === 0) {
    return <p className="text-sm text-muted-foreground/50 italic">스텝을 추가하세요</p>;
  }

  return (
    <div className="h-[500px] w-full">
      <FlowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} direction="TB" />
    </div>
  );
}
