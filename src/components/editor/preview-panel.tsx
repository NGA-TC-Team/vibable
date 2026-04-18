"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useEditorStore } from "@/services/store/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPhasePreviewComponent } from "@/lib/editor-phase-previews";

const PrintPreview = dynamic(() => import("./print-preview").then((m) => m.PrintPreview), {
  ssr: false,
});

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function PreviewPanel() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const projectType = useEditorStore((s) => s.projectType);
  const agentSubType = useEditorStore((s) => s.agentSubType);
  const isPrintPreview = useEditorStore((s) => s.isPrintPreview);
  const Preview = getPhasePreviewComponent(projectType, agentSubType, currentPhase);

  const [direction, setDirection] = useState(0);
  const prevPhase = useRef(currentPhase);

  useEffect(() => {
    setDirection(currentPhase > prevPhase.current ? 1 : -1);
    prevPhase.current = currentPhase;
  }, [currentPhase]);

  if (isPrintPreview) {
    return <PrintPreview />;
  }

  const isFullBleed =
    (projectType === "web" || projectType === "mobile") && currentPhase === 4;

  if (isFullBleed && Preview) {
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
