"use client";

export const BROWSER_FRAME_HORIZONTAL_PADDING = 24;

interface BrowserFrameProps {
  url?: string;
  width: number;
  children: React.ReactNode;
}

export function BrowserFrame({ url = "https://example.com", width, children }: BrowserFrameProps) {
  const frameWidth = width + BROWSER_FRAME_HORIZONTAL_PADDING * 2;

  return (
    <div
      className="overflow-hidden rounded-[22px] border border-border/70 bg-card shadow-2xl"
      style={{ width: frameWidth }}
    >
      <div className="flex h-8 items-center gap-2 border-b bg-muted/50 px-3">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-yellow-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground truncate">
          {url}
        </div>
      </div>
      <div className="relative overflow-auto bg-background px-6 pb-8 pt-6">
        <div className="mx-auto min-h-full" style={{ width }}>
          {children}
        </div>
      </div>
    </div>
  );
}
