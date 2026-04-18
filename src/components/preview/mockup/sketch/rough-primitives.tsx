"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import rough from "roughjs";
import type { Options as RoughOptions } from "roughjs/bin/core";
import type { RoughSVG } from "roughjs/bin/svg";

const BASE_OPTIONS: RoughOptions = {
  roughness: 1.1,
  bowing: 1.0,
  stroke: "currentColor",
  strokeWidth: 1,
};

function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 2 ** 31;
}

interface RoughSvgProps {
  width: number;
  height: number;
  draw: (svg: RoughSVG) => SVGElement | SVGElement[] | null;
  seed: string | number;
  className?: string;
  style?: CSSProperties;
  preserveAspectRatio?: string;
}

/**
 * roughjs SVG를 CSR-only로 그린다. SSR/hydration 시 `dangerouslySetInnerHTML`을
 * 사용하면 빈 마크업과 실제 마크업이 번갈아 주입되면서 중복 렌더 및 낙서-누적 현상이
 * 발생했다. 여기서는 ref 기반 useEffect로 매 렌더마다 기존 children을 모두 제거 후
 * 새로 append해 누적을 원천 차단한다.
 */
export function RoughSvg({
  width,
  height,
  draw,
  seed,
  className,
  style,
  preserveAspectRatio = "none",
}: RoughSvgProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  // `draw` reference는 매 렌더마다 바뀌지만 같은 요소에서 결과는 같아야 한다.
  // deps에서 제외하고 최신값을 ref로 유지해 불필요한 재그림을 피한다.
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    // 이전 렌더 결과를 모두 제거해 누적/중첩을 방지.
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const rc = rough.svg(svg, {
      options: {
        ...BASE_OPTIONS,
        seed: typeof seed === "number" ? seed : hashSeed(String(seed)),
      },
    });
    const drawn = drawRef.current(rc);
    if (!drawn) return;

    const nodes = Array.isArray(drawn) ? drawn : [drawn];
    nodes.forEach((node) => {
      if (node) svg.appendChild(node);
    });
  }, [seed, width, height]);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      style={{ display: "block", overflow: "hidden", ...style }}
      data-roughjs=""
    />
  );
}

interface RoughBoxProps {
  width: number;
  height: number;
  seed: string | number;
  fill?: string;
  fillStyle?: RoughOptions["fillStyle"];
  fillWeight?: number;
  hachureAngle?: number;
  hachureGap?: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  padding?: number;
  className?: string;
  style?: CSSProperties;
}

export function RoughBox({
  width,
  height,
  seed,
  fill,
  fillStyle,
  fillWeight,
  hachureAngle,
  hachureGap,
  stroke,
  strokeWidth,
  roughness,
  padding = 2,
  className,
  style,
}: RoughBoxProps) {
  const boxWidth = Math.max(4, width - padding * 2);
  const boxHeight = Math.max(4, height - padding * 2);
  const opts: RoughOptions = {
    fill,
    fillStyle,
    fillWeight,
    hachureAngle,
    hachureGap,
    stroke: stroke ?? "currentColor",
    strokeWidth: strokeWidth ?? 1.1,
    roughness: roughness ?? 1.3,
  };
  return (
    <RoughSvg
      width={width}
      height={height}
      seed={seed}
      className={className}
      style={style}
      draw={(rc) => rc.rectangle(padding, padding, boxWidth, boxHeight, opts)}
    />
  );
}

interface RoughLineProps {
  width: number;
  height: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  seed: string | number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
  style?: CSSProperties;
}

export function RoughLine({
  width,
  height,
  x1,
  y1,
  x2,
  y2,
  seed,
  stroke,
  strokeWidth,
  roughness,
  className,
  style,
}: RoughLineProps) {
  return (
    <RoughSvg
      width={width}
      height={height}
      seed={seed}
      className={className}
      style={style}
      draw={(rc) =>
        rc.line(x1, y1, x2, y2, {
          stroke: stroke ?? "currentColor",
          strokeWidth: strokeWidth ?? 1,
          roughness: roughness ?? 1.2,
        })
      }
    />
  );
}

interface RoughCircleProps {
  width: number;
  height: number;
  cx: number;
  cy: number;
  diameter: number;
  seed: string | number;
  fill?: string;
  fillStyle?: RoughOptions["fillStyle"];
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

export function RoughCircle({
  width,
  height,
  cx,
  cy,
  diameter,
  seed,
  fill,
  fillStyle,
  stroke,
  strokeWidth,
  className,
  style,
}: RoughCircleProps) {
  return (
    <RoughSvg
      width={width}
      height={height}
      seed={seed}
      className={className}
      style={style}
      draw={(rc) =>
        rc.circle(cx, cy, diameter, {
          fill,
          fillStyle,
          stroke: stroke ?? "currentColor",
          strokeWidth: strokeWidth ?? 1,
        })
      }
    />
  );
}

interface HandwrittenProps {
  children: ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
}

const SIZE_CLASS: Record<NonNullable<HandwrittenProps["size"]>, string> = {
  xs: "text-[11px]",
  sm: "text-[13px]",
  base: "text-[15px]",
  lg: "text-[18px]",
  xl: "text-[22px]",
};

export function Handwritten({
  children,
  className = "",
  size = "sm",
  weight = "medium",
  align = "left",
}: HandwrittenProps) {
  const weightClass = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  }[weight];
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];
  return (
    <span
      className={`font-sketch tracking-[0.01em] ${SIZE_CLASS[size]} ${weightClass} ${alignClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function useElementSeed(id: string, salt: string = "") {
  return useMemo(() => hashSeed(`${id}::${salt}`), [id, salt]);
}
