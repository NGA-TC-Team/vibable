"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";

export function SectionGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  /** 있으면 그룹 상단에 섹션 제목을 표시합니다 */
  title?: string;
}) {
  const sections = React.Children.toArray(children);
  return (
    <div className="space-y-6">
      {title ? (
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      ) : null}
      {sections.map((section, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Separator className="my-2 bg-border/45" />}
          {section}
        </React.Fragment>
      ))}
    </div>
  );
}
