"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface LinkedScreenOption {
  id: string;
  label: string;
}

export function ScreenLinkGroup({
  title,
  pages,
  onNavigate,
  align = "left",
}: {
  title: "In" | "Out";
  pages: LinkedScreenOption[];
  onNavigate: (pageId: string) => void;
  align?: "left" | "right";
}) {
  const isRight = align === "right";
  const ChevronIcon = isRight ? ChevronRight : ChevronLeft;

  if (pages.length === 0) {
    return <div className={isRight ? "ml-auto min-h-9" : "min-h-9"} />;
  }

  return (
    <Collapsible className={isRight ? "ml-auto" : ""}>
      <div className={`flex flex-col gap-2 ${isRight ? "items-end text-right" : "items-start text-left"}`}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="xs" type="button">
            <ChevronIcon className="size-3.5" />
            {title} {pages.length}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="w-full">
          <div className={`flex max-w-[240px] flex-wrap gap-2 ${isRight ? "justify-end" : "justify-start"}`}>
            {pages.map((page) => (
              <Button
                key={page.id}
                variant="outline"
                size="xs"
                type="button"
                onClick={() => onNavigate(page.id)}
              >
                {page.label}
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
