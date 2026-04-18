import { cn } from "@/lib/utils";
import { ansiToReact } from "@/lib/cli/ansi-to-react";

interface TerminalBlockProps {
  children: string;
  title?: string;
  variant?: "dark" | "light";
  className?: string;
  /** 우측 상단 라벨 (e.g. "human", "agent / --json") */
  mode?: string;
}

export function TerminalBlock({
  children,
  title,
  variant = "dark",
  className,
  mode,
}: TerminalBlockProps) {
  const rendered = ansiToReact(children);
  return (
    <div
      className={cn(
        "rounded-md border overflow-hidden font-mono text-xs",
        variant === "dark"
          ? "bg-[#1e1e1e] text-[#e5e5e5] border-[#333]"
          : "bg-muted text-foreground",
        className,
      )}
    >
      {(title || mode) && (
        <div
          className={cn(
            "flex items-center justify-between px-3 py-1.5 border-b",
            variant === "dark"
              ? "bg-[#252525] border-[#333] text-[#cccccc]"
              : "bg-muted/80 border-border",
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
            {title && <span className="ml-2 text-[11px]">{title}</span>}
          </div>
          {mode && (
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              {mode}
            </span>
          )}
        </div>
      )}
      <pre className="overflow-x-auto px-3 py-2 whitespace-pre leading-relaxed">
        {rendered}
      </pre>
    </div>
  );
}
