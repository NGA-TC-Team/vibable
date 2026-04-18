"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type Node, type Edge, type NodeProps } from "@xyflow/react";
import type { UserFlow, SitemapNode } from "@/types/phases";
import { FlowDiagram } from "./flow-diagram";

type FlowNodeData = {
  label: string;
  variant: "start" | "success-end" | "failure-end" | "end" | "step";
  screenLabel?: string;
};

const FlowNodeComponent = memo(function FlowNodeComponent({
  data,
}: NodeProps<Node<FlowNodeData>>) {
  const bgClass =
    data.variant === "start"
      ? "bg-primary text-primary-foreground rounded-full"
      : data.variant === "success-end"
        ? "bg-emerald-500 text-white rounded-full"
        : data.variant === "failure-end"
          ? "bg-rose-500 text-white rounded-full"
          : data.variant === "end"
            ? "bg-muted-foreground text-background rounded-full"
            : "bg-card text-card-foreground border rounded-lg";

  return (
    <div className={`px-4 py-2 text-center shadow-sm ${bgClass}`}>
      <Handle type="target" position={Position.Top} className="!invisible" />
      <div className="text-sm font-medium">{data.label}</div>
      {data.screenLabel && (
        <div className="mt-0.5 text-[10px] opacity-70">@{data.screenLabel}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!invisible" />
    </div>
  );
});

const nodeTypes = { flowNode: FlowNodeComponent };

function userFlowToFlow(
  flow: UserFlow,
  sitemap: SitemapNode[] = [],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const labelById = new Map<string, string>();
  const collect = (ns: SitemapNode[]) => {
    ns.forEach((n) => {
      labelById.set(n.id, n.label || "(이름 없음)");
      collect(n.children);
    });
  };
  collect(sitemap);

  const startId = `${flow.id}-start`;
  nodes.push({
    id: startId,
    type: "flowNode",
    position: { x: 0, y: 0 },
    data: { label: "시작", variant: "start" },
  });

  flow.steps.forEach((step) => {
    const ref = step.screenRef?.trim() ?? "";
    nodes.push({
      id: step.id,
      type: "flowNode",
      position: { x: 0, y: 0 },
      data: {
        label: step.action || "—",
        variant: "step",
        screenLabel: ref ? labelById.get(ref) ?? ref : undefined,
      },
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

  const successSet = new Set(flow.successEndings ?? []);
  const failureSet = new Set(flow.failureEndings ?? []);
  const hasExplicitEndings = successSet.size > 0 || failureSet.size > 0;

  const terminalSteps = flow.steps.filter(
    (s) => s.next.length === 0 || s.next.every((n) => !flow.steps.some((ss) => ss.id === n)),
  );

  if (hasExplicitEndings) {
    const addEndNode = (suffix: string, label: string, variant: FlowNodeData["variant"]) => {
      const id = `${flow.id}-${suffix}`;
      nodes.push({
        id,
        type: "flowNode",
        position: { x: 0, y: 0 },
        data: { label, variant },
      });
      return id;
    };
    if (successSet.size > 0) {
      const id = addEndNode("success", "성공", "success-end");
      successSet.forEach((stepId) => {
        if (flow.steps.some((s) => s.id === stepId)) {
          edges.push({
            id: `e-${stepId}-success`,
            source: stepId,
            target: id,
            type: "smoothstep",
            animated: true,
            style: { ...edgeStyle, stroke: "#10b981" },
          });
        }
      });
    }
    if (failureSet.size > 0) {
      const id = addEndNode("failure", "실패/이탈", "failure-end");
      failureSet.forEach((stepId) => {
        if (flow.steps.some((s) => s.id === stepId)) {
          edges.push({
            id: `e-${stepId}-failure`,
            source: stepId,
            target: id,
            type: "smoothstep",
            animated: true,
            style: { ...edgeStyle, stroke: "#f43f5e" },
          });
        }
      });
    }
    // 명시되지 않은 terminal은 일반 종료로 묶음
    const unmarked = terminalSteps.filter(
      (s) => !successSet.has(s.id) && !failureSet.has(s.id),
    );
    if (unmarked.length > 0) {
      const id = addEndNode("end", "종료", "end");
      unmarked.forEach((step) => {
        edges.push({
          id: `e-${step.id}-end`,
          source: step.id,
          target: id,
          type: "smoothstep",
          animated: true,
          style: edgeStyle,
        });
      });
    }
  } else if (terminalSteps.length > 0) {
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
  sitemap?: SitemapNode[];
}

export function UserFlowDiagram({ flow, sitemap }: UserFlowDiagramProps) {
  const { nodes, edges } = useMemo(
    () => userFlowToFlow(flow, sitemap ?? []),
    [flow, sitemap],
  );

  if (flow.steps.length === 0) {
    return <p className="text-sm text-muted-foreground/50 italic">스텝을 추가하세요</p>;
  }

  return (
    <div className="h-[500px] w-full">
      <FlowDiagram nodes={nodes} edges={edges} nodeTypes={nodeTypes} direction="TB" />
    </div>
  );
}
