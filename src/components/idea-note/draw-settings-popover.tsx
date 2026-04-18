"use client";

import { useEffect, useMemo, useRef } from "react";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#fde047", // 노랑
  "#fca5a5", // 빨강
  "#6ee7b7", // 초록
  "#93c5fd", // 파랑
  "#c4b5fd", // 보라
  "#fdba74", // 주황
  "#f9a8d4", // 핑크
  "#0f172a", // 검정
];

const PRESET_SIZES = [4, 8, 12, 18, 28];

export interface DrawSettingsPopoverState {
  clientX: number;
  clientY: number;
}

interface Props {
  state: DrawSettingsPopoverState | null;
  onClose: () => void;
}

/**
 * 마우스 위치에 띄우는 형광펜 색상·굵기 모달. 포지션 fixed, 바깥 클릭/ESC로 닫힘.
 */
export function DrawSettingsPopover({ state, onClose }: Props) {
  const drawColor = useIdeaNoteStore((s) => s.drawColor);
  const drawSize = useIdeaNoteStore((s) => s.drawSize);
  const setDrawColor = useIdeaNoteStore((s) => s.setDrawColor);
  const setDrawSize = useIdeaNoteStore((s) => s.setDrawSize);
  const rootRef = useRef<HTMLDivElement>(null);

  const clampedPos = useMemo(() => {
    if (!state) return null;
    if (typeof window === "undefined") return { x: state.clientX, y: state.clientY };
    const margin = 8;
    const w = 244;
    const h = 180;
    const x = Math.min(state.clientX, window.innerWidth - w - margin);
    const y = Math.min(state.clientY, window.innerHeight - h - margin);
    return { x: Math.max(margin, x), y: Math.max(margin, y) };
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDocClick = (e: MouseEvent) => {
      if (
        rootRef.current &&
        e.target instanceof Node &&
        !rootRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    // 모달을 연 이벤트가 current tick에서 처리되고 나서 바깥 클릭 리스너를 붙이도록
    // 다음 프레임에 등록한다.
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", onDocClick);
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [state, onClose]);

  if (!state || !clampedPos) return null;

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        top: clampedPos.y,
        left: clampedPos.x,
        zIndex: 80,
      }}
      className="w-60 rounded-lg border bg-popover p-3 shadow-md"
    >
      <div className="mb-2 text-[10px] font-medium uppercase text-muted-foreground">
        형광펜
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`색상 ${c}`}
            onClick={() => setDrawColor(c)}
            className={cn(
              "size-6 rounded-full transition-transform",
              drawColor.toLowerCase() === c.toLowerCase() &&
                "ring-2 ring-primary ring-offset-1",
            )}
            style={{ background: c }}
          />
        ))}
        <label
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-full border text-[9px]",
            !PRESET_COLORS.map((c) => c.toLowerCase()).includes(
              drawColor.toLowerCase(),
            ) && "ring-2 ring-primary ring-offset-1",
          )}
          style={{ background: drawColor }}
        >
          +
          <input
            type="color"
            className="sr-only"
            value={drawColor}
            onChange={(e) => setDrawColor(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">
        굵기
      </div>
      <div className="flex items-center gap-1.5">
        {PRESET_SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setDrawSize(s)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              drawSize === s ? "bg-muted" : "hover:bg-muted/60",
            )}
            aria-label={`굵기 ${s}`}
          >
            <span
              className="rounded-full"
              style={{ width: s, height: s, background: drawColor }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
