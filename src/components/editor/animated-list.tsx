"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSystemRuntime } from "@/services/store/hooks";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <AnimatePresence initial={false}>
      <div className={className}>{children}</div>
    </AnimatePresence>
  );
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  const { prefersReducedMotion } = useSystemRuntime();

  return (
    <motion.div
      layout
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: 8, scale: 0.985 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -6, scale: 0.985 }
      }
      transition={{
        layout: {
          duration: prefersReducedMotion ? 0 : 0.16,
          ease: [0.22, 1, 0.36, 1],
        },
        duration: prefersReducedMotion ? 0 : 0.16,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
