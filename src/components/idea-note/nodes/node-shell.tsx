"use client";

import { memo, type PropsWithChildren, type CSSProperties } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface NodeShellProps extends PropsWithChildren {
  selected?: boolean;
  locked?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 상하좌우 연결 핸들 표시 */
  withHandles?: boolean;
  /** 사용자 리사이즈 허용 */
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  onContextMenu?: (e: React.MouseEvent) => void;
}

/**
 * 4방향 Handle — connectionMode="loose"와 함께 사용하면 source/target 구분 없이
 * 어느 핸들에서도 드래그·드롭이 가능하다. 기본 상태에서는 완전히 숨기고
 * 노드가 선택되었을 때만 노출한다.
 */
export const NodeShell = memo(function NodeShell({
  children,
  selected,
  locked,
  className,
  style,
  withHandles = true,
  resizable = true,
  minWidth = 120,
  minHeight = 60,
  onContextMenu,
}: NodeShellProps) {
  const handleVisibility = selected
    ? "opacity-100"
    : "opacity-0 pointer-events-none";
  const handleClass = cn(
    "!size-3 !min-h-0 !min-w-0 !border-2 !border-primary !bg-background transition-all hover:!size-4",
    handleVisibility,
  );

  return (
    <div
      className={cn(
        "group relative h-full w-full rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        locked && "opacity-80",
        className,
      )}
      style={style}
      onContextMenu={onContextMenu}
    >
      {resizable && selected && !locked && (
        <NodeResizer
          minWidth={minWidth}
          minHeight={minHeight}
          handleClassName="!size-2 !rounded-sm !border !border-primary !bg-background"
          lineClassName="!border-primary/40"
        />
      )}
      {withHandles && (
        <>
          {/* 상하좌우 Handle — 선택 시에만 표시. loose 모드에서 source/target 겸용 */}
          <Handle
            type="source"
            position={Position.Top}
            id="t"
            isConnectableStart={!!selected}
            isConnectableEnd={!!selected}
            className={handleClass}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="r"
            isConnectableStart={!!selected}
            isConnectableEnd={!!selected}
            className={handleClass}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="b"
            isConnectableStart={!!selected}
            isConnectableEnd={!!selected}
            className={handleClass}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="l"
            isConnectableStart={!!selected}
            isConnectableEnd={!!selected}
            className={handleClass}
          />
        </>
      )}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg">
        {children}
      </div>
    </div>
  );
});
