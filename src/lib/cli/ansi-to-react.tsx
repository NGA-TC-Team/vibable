import type { ReactNode } from "react";
import type { AnsiColor, TerminalPalette } from "@/types/phases";

const ANSI_HEX_16: Record<AnsiColor, string> = {
  black: "#1e1e1e",
  red: "#cd3131",
  green: "#0dbc79",
  yellow: "#e5e510",
  blue: "#2472c8",
  magenta: "#bc3fbc",
  cyan: "#11a8cd",
  white: "#e5e5e5",
  brightBlack: "#666666",
  brightRed: "#f14c4c",
  brightGreen: "#23d18b",
  brightYellow: "#f5f543",
  brightBlue: "#3b8eea",
  brightMagenta: "#d670d6",
  brightCyan: "#29b8db",
  brightWhite: "#ffffff",
};

export function ansiColorToHex(
  color: AnsiColor,
  palette?: TerminalPalette,
): string {
  if (palette?.truecolorHex) {
    const entries = palette.truecolorHex;
    if (color === palette.primary && entries.primary) return entries.primary;
    if (color === palette.success && entries.success) return entries.success;
    if (color === palette.warning && entries.warning) return entries.warning;
    if (color === palette.danger && entries.danger) return entries.danger;
    if (color === palette.info && entries.info) return entries.info;
    if (color === palette.muted && entries.muted) return entries.muted;
  }
  return ANSI_HEX_16[color];
}

/** ANSI escape code를 React span으로 변환 (기본 SGR만 지원) */
export function ansiToReact(input: string): ReactNode[] {
  const parts = input.split(/(\x1b\[[0-9;]*m)/g);
  let style: { color?: string; fontWeight?: number } = {};
  const out: ReactNode[] = [];
  let key = 0;
  for (const part of parts) {
    if (part.startsWith("\x1b[") && part.endsWith("m")) {
      const codes = part
        .slice(2, -1)
        .split(";")
        .map((n) => parseInt(n || "0", 10));
      for (const code of codes) {
        if (code === 0) style = {};
        else if (code === 1) style = { ...style, fontWeight: 700 };
        else if (code === 30) style = { ...style, color: ANSI_HEX_16.black };
        else if (code === 31) style = { ...style, color: ANSI_HEX_16.red };
        else if (code === 32) style = { ...style, color: ANSI_HEX_16.green };
        else if (code === 33) style = { ...style, color: ANSI_HEX_16.yellow };
        else if (code === 34) style = { ...style, color: ANSI_HEX_16.blue };
        else if (code === 35) style = { ...style, color: ANSI_HEX_16.magenta };
        else if (code === 36) style = { ...style, color: ANSI_HEX_16.cyan };
        else if (code === 37) style = { ...style, color: ANSI_HEX_16.white };
        else if (code === 90) style = { ...style, color: ANSI_HEX_16.brightBlack };
        else if (code === 91) style = { ...style, color: ANSI_HEX_16.brightRed };
        else if (code === 92) style = { ...style, color: ANSI_HEX_16.brightGreen };
        else if (code === 93) style = { ...style, color: ANSI_HEX_16.brightYellow };
        else if (code === 94) style = { ...style, color: ANSI_HEX_16.brightBlue };
        else if (code === 95) style = { ...style, color: ANSI_HEX_16.brightMagenta };
        else if (code === 96) style = { ...style, color: ANSI_HEX_16.brightCyan };
        else if (code === 97) style = { ...style, color: ANSI_HEX_16.brightWhite };
      }
    } else if (part.length > 0) {
      out.push(
        <span key={key++} style={style}>
          {part}
        </span>,
      );
    }
  }
  return out;
}
