"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useEditorStore } from "@/services/store/editor-store";
import { OverviewPreview } from "@/components/preview/overview-preview";
import { UserScenarioPreview } from "@/components/preview/user-scenario-preview";
import { RequirementsPreview } from "@/components/preview/requirements-preview";
import { InfoArchitecturePreview } from "@/components/preview/info-architecture-preview";
import { ScreenDesignPreview } from "@/components/preview/screen-design-preview";
import { DataModelPreview } from "@/components/preview/data-model-preview";
import { DesignSystemPreview } from "@/components/preview/design-system-preview";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrintPreview = dynamic(() => import("./print-preview").then((m) => m.PrintPreview), {
  ssr: false,
});

const previewComponents: Record<number, React.ComponentType> = {
  0: OverviewPreview,
  1: UserScenarioPreview,
  2: RequirementsPreview,
  3: InfoArchitecturePreview,
  4: ScreenDesignPreview,
  5: DataModelPreview,
  6: DesignSystemPreview,
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function PreviewPanel() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const isPrintPreview = useEditorStore((s) => s.isPrintPreview);
  const Preview = previewComponents[currentPhase];

  const [direction, setDirection] = useState(0);
  const prevPhase = useRef(currentPhase);

  useEffect(() => {
    setDirection(currentPhase > prevPhase.current ? 1 : -1);
    prevPhase.current = currentPhase;
  }, [currentPhase]);

  if (isPrintPreview) {
    return <PrintPreview />;
  }

  if (currentPhase === 4 && Preview) {
    return (
      <div className="h-full w-full overflow-hidden">
        <Preview />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPhase}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="mx-auto aspect-[297/210] w-full max-w-3xl rounded-lg border bg-card p-8 shadow-sm">
              {Preview ? (
                <Preview />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  미리보기 준비 중...
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
