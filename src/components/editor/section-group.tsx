"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";

export function SectionGroup({ children }: { children: React.ReactNode }) {
  const sections = React.Children.toArray(children);
  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Separator className="my-2" />}
          {section}
        </React.Fragment>
      ))}
    </div>
  );
}
