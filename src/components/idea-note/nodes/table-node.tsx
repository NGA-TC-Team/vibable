"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Plus, Trash2 } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { TableData } from "@/types/idea-note";

type TableNodeType = Node<TableData & Record<string, unknown>, "table">;

export const TableNode = memo(function TableNode({
  id,
  data,
  selected,
}: NodeProps<TableNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);

  const setHeaders = (headers: string[]) => updateNodeData(id, { headers });
  const setRows = (rows: string[][]) => updateNodeData(id, { rows });

  const addColumn = () => {
    updateNodeData(id, {
      headers: [...data.headers, ""],
      rows: data.rows.map((r) => [...r, ""]),
      columnWidths: [...data.columnWidths, 120],
    });
  };
  const addRow = () =>
    setRows([...data.rows, data.headers.map(() => "")]);

  const removeColumn = (idx: number) => {
    if (data.headers.length <= 1) return;
    updateNodeData(id, {
      headers: data.headers.filter((_, i) => i !== idx),
      rows: data.rows.map((r) => r.filter((_, i) => i !== idx)),
      columnWidths: data.columnWidths.filter((_, i) => i !== idx),
    });
  };
  const removeRow = (idx: number) =>
    setRows(data.rows.filter((_, i) => i !== idx));

  return (
    <NodeShell selected={selected} minWidth={260} minHeight={120}>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted/60">
                {data.headers.map((h, i) => (
                  <th
                    key={i}
                    className="group/col relative border px-1.5 py-1 text-left font-semibold"
                  >
                    <input
                      className="w-full bg-transparent outline-none"
                      value={h}
                      placeholder="Column"
                      onChange={(e) =>
                        setHeaders(
                          data.headers.map((x, j) =>
                            j === i ? e.target.value : x,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 hidden text-muted-foreground hover:text-destructive group-hover/col:block"
                      onClick={() => removeColumn(i)}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, r) => (
                <tr key={r} className="group/row">
                  {row.map((cell, c) => (
                    <td key={c} className="border px-1.5 py-1">
                      <input
                        className="w-full bg-transparent outline-none"
                        value={cell}
                        onChange={(e) =>
                          setRows(
                            data.rows.map((rr, ri) =>
                              ri === r
                                ? rr.map((cc, ci) =>
                                    ci === c ? e.target.value : cc,
                                  )
                                : rr,
                            ),
                          )
                        }
                      />
                    </td>
                  ))}
                  <td className="border-0 pl-1">
                    <button
                      type="button"
                      className="hidden text-muted-foreground hover:text-destructive group-hover/row:block"
                      onClick={() => removeRow(r)}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 border-t px-2 py-1 text-[10px] text-muted-foreground">
          <button
            type="button"
            className="flex items-center gap-0.5 hover:text-foreground"
            onClick={addRow}
          >
            <Plus className="size-3" /> 행
          </button>
          <button
            type="button"
            className="flex items-center gap-0.5 hover:text-foreground"
            onClick={addColumn}
          >
            <Plus className="size-3" /> 열
          </button>
        </div>
      </div>
    </NodeShell>
  );
});
