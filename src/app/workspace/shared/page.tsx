import { Suspense } from "react";
import { SharedClient } from "./_components/shared-client";

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <SharedClient />
    </Suspense>
  );
}
