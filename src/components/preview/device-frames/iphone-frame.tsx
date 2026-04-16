"use client";

interface IPhoneFrameProps {
  children: React.ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="overflow-hidden rounded-[2.5rem] border-4 border-foreground/20 bg-card shadow-lg" style={{ width: 375 + 8 }}>
      {/* Status bar */}
      <div className="flex h-11 items-center justify-between bg-background px-6">
        <span className="text-[10px] font-medium">9:41</span>
        <div className="mx-auto h-5 w-20 rounded-full bg-foreground/20" />
        <div className="flex items-center gap-1">
          <div className="h-2 w-3 rounded-sm bg-foreground/40" />
          <div className="h-2.5 w-1.5 rounded-sm bg-foreground/40" />
          <div className="h-2 w-4 rounded-sm bg-foreground/40" />
        </div>
      </div>
      {/* Content */}
      <div className="relative overflow-auto bg-background" style={{ width: 375, minHeight: 667 }}>
        {children}
      </div>
      {/* Home indicator */}
      <div className="flex h-8 items-center justify-center bg-background">
        <div className="h-1 w-32 rounded-full bg-foreground/30" />
      </div>
    </div>
  );
}
