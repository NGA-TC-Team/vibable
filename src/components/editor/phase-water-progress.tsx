"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Orientation = "horizontal" | "vertical";

export interface PhaseWaterProgressProps {
  value: number;
  orientation: Orientation;
  className?: string;
}

/** Horizontal bar: repeating wave fill, period 50 on X; fits viewBox height 24. */
const WAVE_FILL_H =
  "M-60,0 C-45,5 -30,0 -15,5 0,0 15,5 30,0 45,5 60,0 75,5 90,0 105,5 120,0 135,5 150,0 165,5 180,0 195,5 210,0 V24 H-60 Z";

const WAVE_FILL_H2 =
  "M-50,4 C-35,10 -20,4 -5,10 10,4 25,10 40,4 55,10 70,4 85,10 100,4 115,10 130,4 145,10 160,4 175,10 190,4 205,10 220,4 V24 H-50 Z";

export function PhaseWaterProgress({ value, orientation, className }: PhaseWaterProgressProps) {
  const rawId = useId().replace(/:/g, "");
  const clipId = `pwp-clip-${rawId}`;

  const v = Math.min(100, Math.max(0, value));

  const isH = orientation === "horizontal";
  const viewW = isH ? 100 : 24;
  const viewH = isH ? 24 : 100;
  const rx = Math.min(viewW, viewH) / 2;

  const clipRect = isH
    ? { x: 0, y: 0, width: Math.max(0, v), height: viewH }
    : { x: 0, y: viewH - v, width: viewW, height: Math.max(0, v) };

  /** Maps horizontal 100×24 wave space into vertical 24×100 bar (rotate -90° about center). */
  const vertWaveGroup =
    !isH && v > 0 ? `translate(${viewW / 2},${viewH / 2}) rotate(-90) translate(-50,-12)` : undefined;

  return (
    <svg
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
      className={cn("block overflow-hidden rounded-full", className)}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect
            x={clipRect.x}
            y={clipRect.y}
            width={Math.max(clipRect.width, 0.0001)}
            height={Math.max(clipRect.height, 0.0001)}
          />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={viewW} height={viewH} rx={rx} className="fill-muted" />

      <g clipPath={`url(#${clipId})`}>
        <rect x={0} y={0} width={viewW} height={viewH} className="fill-primary" />

        {v > 0 && (
          <g transform={vertWaveGroup}>
            <g className="text-primary-foreground/25">
              <path d={WAVE_FILL_H} fill="currentColor">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="-50 0"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
            <g className="text-primary-foreground/18">
              <path d={WAVE_FILL_H2} fill="currentColor">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="-18 0"
                  to="32 0"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        )}
      </g>
    </svg>
  );
}
