"use client";

import type { ComponentStyle } from "@/types/phases";

interface ComponentPreviewProps {
  style: ComponentStyle;
}

export function ComponentStylePreview({ style }: ComponentPreviewProps) {
  const { defaultStyle, hoverStyle, category } = style;

  if (!defaultStyle) return null;

  const baseStyle: React.CSSProperties = {
    backgroundColor: defaultStyle.background,
    color: defaultStyle.textColor,
    borderRadius: defaultStyle.borderRadius ?? style.borderRadius,
    padding: defaultStyle.padding,
    fontSize: defaultStyle.fontSize,
    fontWeight: defaultStyle.fontWeight as React.CSSProperties["fontWeight"],
    border: defaultStyle.borderColor
      ? `1px solid ${defaultStyle.borderColor}`
      : undefined,
    boxShadow: defaultStyle.shadow,
  };

  const hoverCss: React.CSSProperties = hoverStyle
    ? {
        ...baseStyle,
        backgroundColor: hoverStyle.background ?? baseStyle.backgroundColor,
        color: hoverStyle.textColor ?? baseStyle.color,
      }
    : baseStyle;

  switch (category) {
    case "button":
      return (
        <div className="flex gap-3 items-center p-3 rounded bg-muted/30">
          <div style={baseStyle} className="cursor-default transition-all">
            {style.component || "Button"}
          </div>
          {hoverStyle && (
            <div style={hoverCss} className="cursor-default opacity-80">
              Hover
            </div>
          )}
        </div>
      );

    case "card":
      return (
        <div className="p-3 rounded bg-muted/30">
          <div style={baseStyle} className="min-h-[60px] p-4">
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {style.component || "Card"}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Card content preview
            </div>
          </div>
        </div>
      );

    case "badge":
      return (
        <div className="flex gap-2 items-center p-3 rounded bg-muted/30">
          <span style={baseStyle}>Default</span>
          {hoverStyle && <span style={hoverCss}>Hover</span>}
        </div>
      );

    case "input":
      return (
        <div className="p-3 rounded bg-muted/30">
          <div
            style={{
              ...baseStyle,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ opacity: 0.5 }}>Placeholder text...</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-3 rounded bg-muted/30">
          <div style={baseStyle} className="min-h-[40px] flex items-center justify-center">
            {style.component || "Component"}
          </div>
        </div>
      );
  }
}
