"use client";

import type { ReactNode } from "react";
import { HelpCircle, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  children: ReactNode;
  tooltip: ReactNode;
  icon?: LucideIcon;
  htmlFor?: string;
  className?: string;
  labelClassName?: string;
  iconClassName?: string;
}

export function FieldLabel({
  children,
  tooltip,
  icon: Icon,
  htmlFor,
  className,
  labelClassName,
  iconClassName,
}: FieldLabelProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Icon ? (
        <Icon
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground",
            iconClassName,
          )}
        />
      ) : null}
      <Label htmlFor={htmlFor} className={cn("text-xs", labelClassName)}>
        {children}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="도움말"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
