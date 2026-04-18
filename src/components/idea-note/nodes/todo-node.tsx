"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Plus, Trash2 } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { TodoData, TodoItem } from "@/types/idea-note";

type TodoNodeType = Node<TodoData & Record<string, unknown>, "todo">;

function newItem(): TodoItem {
  return {
    id: `item-${crypto.randomUUID().slice(0, 8)}`,
    text: "",
    done: false,
  };
}

export const TodoNode = memo(function TodoNode({
  id,
  data,
  selected,
}: NodeProps<TodoNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const doneCount = data.items.filter((it) => it.done).length;
  const ratio = data.items.length === 0 ? 0 : doneCount / data.items.length;

  const updateItems = (items: TodoItem[]) => updateNodeData(id, { items });

  return (
    <NodeShell selected={selected} minWidth={200} minHeight={140}>
      <div className="flex h-full flex-col gap-2 p-3">
        <input
          className="w-full bg-transparent text-sm font-semibold outline-none"
          value={data.title}
          placeholder="할 일"
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
        />
        {data.showProgress && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width]"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <span>
              {doneCount}/{data.items.length}
            </span>
          </div>
        )}
        <div className="flex-1 space-y-1 overflow-auto">
          {data.items.map((it) => (
            <div key={it.id} className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={it.done}
                className="mt-1 size-3.5 shrink-0"
                onChange={(e) =>
                  updateItems(
                    data.items.map((cur) =>
                      cur.id === it.id ? { ...cur, done: e.target.checked } : cur,
                    ),
                  )
                }
              />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                value={it.text}
                placeholder="항목"
                onChange={(e) =>
                  updateItems(
                    data.items.map((cur) =>
                      cur.id === it.id ? { ...cur, text: e.target.value } : cur,
                    ),
                  )
                }
                style={{
                  textDecoration: it.done ? "line-through" : undefined,
                  opacity: it.done ? 0.6 : 1,
                }}
              />
              <button
                type="button"
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() =>
                  updateItems(data.items.filter((cur) => cur.id !== it.id))
                }
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => updateItems([...data.items, newItem()])}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3" /> 항목 추가
        </button>
      </div>
    </NodeShell>
  );
});
