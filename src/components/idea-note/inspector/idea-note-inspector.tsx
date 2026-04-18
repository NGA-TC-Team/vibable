"use client";

import { Trash2, Lock, Unlock, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { IdeaNoteNode, IdeaNoteEdge } from "@/types/idea-note";

function NodeInspector({ node }: { node: IdeaNoteNode }) {
  const updateNode = useIdeaNoteStore((s) => s.updateNode);
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const board = useIdeaNoteStore((s) => s.board);

  const maxZ = Math.max(0, ...(board?.nodes.map((n) => n.zIndex) ?? [0]));
  const minZ = Math.min(0, ...(board?.nodes.map((n) => n.zIndex) ?? [0]));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          {node.type}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            updateNode(node.id, { locked: !node.locked })
          }
          aria-label={node.locked ? "잠금 해제" : "잠금"}
        >
          {node.locked ? (
            <Lock className="size-3.5" />
          ) : (
            <Unlock className="size-3.5" />
          )}
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-muted-foreground">
          위치
        </Label>
        <div className="grid grid-cols-2 gap-1">
          <Input
            className="h-7 text-xs"
            type="number"
            value={Math.round(node.position.x)}
            onChange={(e) =>
              updateNode(node.id, {
                position: { x: Number(e.target.value), y: node.position.y },
              })
            }
          />
          <Input
            className="h-7 text-xs"
            type="number"
            value={Math.round(node.position.y)}
            onChange={(e) =>
              updateNode(node.id, {
                position: { x: node.position.x, y: Number(e.target.value) },
              })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-muted-foreground">
          크기
        </Label>
        <div className="grid grid-cols-2 gap-1">
          <Input
            className="h-7 text-xs"
            type="number"
            value={Math.round(node.size.width)}
            onChange={(e) =>
              updateNode(node.id, {
                size: { width: Number(e.target.value), height: node.size.height },
              })
            }
          />
          <Input
            className="h-7 text-xs"
            type="number"
            value={Math.round(node.size.height)}
            onChange={(e) =>
              updateNode(node.id, {
                size: { width: node.size.width, height: Number(e.target.value) },
              })
            }
          />
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => updateNode(node.id, { zIndex: maxZ + 1 })}
        >
          <ArrowUpToLine className="size-3.5" /> 맨 위
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => updateNode(node.id, { zIndex: minZ - 1 })}
        >
          <ArrowDownToLine className="size-3.5" /> 맨 아래
        </Button>
      </div>

      {node.type === "note" && (
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">
            색상
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={node.data.accentColor}
              onChange={(e) =>
                updateNodeData(node.id, { accentColor: e.target.value })
              }
              className="h-7 w-12 cursor-pointer rounded border"
            />
            <input
              type="color"
              value={node.data.backgroundColor}
              onChange={(e) =>
                updateNodeData(node.id, { backgroundColor: e.target.value })
              }
              className="h-7 w-12 cursor-pointer rounded border"
            />
          </div>
        </div>
      )}

      {node.type === "swatch" && (
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">
            색상
          </Label>
          <input
            type="color"
            value={node.data.hex}
            onChange={(e) =>
              updateNodeData(node.id, { hex: e.target.value })
            }
            className="h-8 w-full cursor-pointer rounded border"
          />
        </div>
      )}

      {node.type === "shape" && (
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">
            색상
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={node.data.fill}
              onChange={(e) =>
                updateNodeData(node.id, { fill: e.target.value })
              }
              className="h-7 w-12 cursor-pointer rounded border"
            />
            <input
              type="color"
              value={node.data.stroke}
              onChange={(e) =>
                updateNodeData(node.id, { stroke: e.target.value })
              }
              className="h-7 w-12 cursor-pointer rounded border"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EdgeInspector({ edge }: { edge: IdeaNoteEdge }) {
  const updateEdge = useIdeaNoteStore((s) => s.updateEdge);

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase text-muted-foreground">
        Edge
      </span>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-muted-foreground">
          라벨
        </Label>
        <Input
          className="h-7 text-xs"
          value={edge.label ?? ""}
          onChange={(e) => updateEdge(edge.id, { label: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-muted-foreground">
          색상
        </Label>
        <input
          type="color"
          value={edge.color}
          onChange={(e) => updateEdge(edge.id, { color: e.target.value })}
          className="h-7 w-full cursor-pointer rounded border"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-muted-foreground">
          화살표
        </Label>
        <select
          className="h-7 w-full rounded border bg-background px-1 text-xs"
          value={edge.arrowHead}
          onChange={(e) =>
            updateEdge(edge.id, {
              arrowHead: e.target.value as IdeaNoteEdge["arrowHead"],
            })
          }
        >
          <option value="none">없음</option>
          <option value="end">끝</option>
          <option value="both">양쪽</option>
          <option value="dot-end">점-끝</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={edge.dashed}
          onChange={(e) => updateEdge(edge.id, { dashed: e.target.checked })}
        />
        점선
      </label>
    </div>
  );
}

export function IdeaNoteInspector({ className }: { className?: string }) {
  const board = useIdeaNoteStore((s) => s.board);
  const selectedNodeIds = useIdeaNoteStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useIdeaNoteStore((s) => s.selectedEdgeIds);
  const removeNodes = useIdeaNoteStore((s) => s.removeNodes);
  const removeEdges = useIdeaNoteStore((s) => s.removeEdges);
  const commitHistory = useIdeaNoteStore((s) => s.commitHistory);

  if (!board) return null;
  if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) {
    return null;
  }

  const node =
    selectedNodeIds.length === 1
      ? board.nodes.find((n) => n.id === selectedNodeIds[0]) ?? null
      : null;

  const edge =
    selectedEdgeIds.length === 1
      ? board.edges.find((e) => e.id === selectedEdgeIds[0]) ?? null
      : null;

  const selectionCount = selectedNodeIds.length + selectedEdgeIds.length;

  return (
    <aside
      className={cn(
        "flex w-60 shrink-0 flex-col gap-3 border-l bg-card p-3 overflow-y-auto",
        className,
      )}
    >
      {selectionCount > 1 ? (
        <div className="text-xs text-muted-foreground">
          {selectionCount}개 선택됨
        </div>
      ) : node ? (
        <NodeInspector node={node} />
      ) : edge ? (
        <EdgeInspector edge={edge} />
      ) : null}

      <Button
        variant="destructive"
        size="sm"
        className="mt-auto"
        onClick={() => {
          commitHistory();
          if (selectedNodeIds.length) removeNodes(selectedNodeIds);
          if (selectedEdgeIds.length) removeEdges(selectedEdgeIds);
        }}
      >
        <Trash2 className="size-3.5" /> 삭제
      </Button>
    </aside>
  );
}
