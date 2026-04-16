"use client";

interface BrowserFrameProps {
  url?: string;
  width: number;
  children: React.ReactNode;
}

export function BrowserFrame({ url = "https://example.com", width, children }: BrowserFrameProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-lg" style={{ width }}>
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
      <div className="relative overflow-auto bg-background">
        {children}
      </div>
    </div>
  );
}
