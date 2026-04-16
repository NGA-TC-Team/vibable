"use client";

import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ComponentStyleToken } from "@/types/phases";

interface TokenEditorProps {
  label: string;
  token?: ComponentStyleToken;
  onChange: (token: ComponentStyleToken) => void;
  disabled?: boolean;
}

export function ComponentTokenEditor({
  label,
  token,
  onChange,
  disabled,
}: TokenEditorProps) {
  const t = token ?? {};

  const update = (patch: Partial<ComponentStyleToken>) =>
    onChange({ ...t, ...patch });

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium hover:text-foreground text-muted-foreground transition-colors">
        <ChevronRight className="size-3 transition-transform [[data-state=open]>&]:rotate-90" />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex gap-1.5 items-center">
            <input
              type="color"
              value={t.background ?? "#ffffff"}
              onChange={(e) => update({ background: e.target.value })}
              disabled={disabled}
              className="h-7 w-7 shrink-0 cursor-pointer rounded border"
            />
            <Input
              placeholder="배경색"
              value={t.background ?? ""}
              onChange={(e) => update({ background: e.target.value })}
              disabled={disabled}
              className="text-xs"
            />
          </div>
          <div className="flex gap-1.5 items-center">
            <input
              type="color"
              value={t.textColor ?? "#000000"}
              onChange={(e) => update({ textColor: e.target.value })}
              disabled={disabled}
              className="h-7 w-7 shrink-0 cursor-pointer rounded border"
            />
            <Input
              placeholder="텍스트색"
              value={t.textColor ?? ""}
              onChange={(e) => update({ textColor: e.target.value })}
              disabled={disabled}
              className="text-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="padding"
            value={t.padding ?? ""}
            onChange={(e) => update({ padding: e.target.value })}
            disabled={disabled}
            className="text-xs"
          />
          <Input
            placeholder="font-size"
            value={t.fontSize ?? ""}
            onChange={(e) => update({ fontSize: e.target.value })}
            disabled={disabled}
            className="text-xs"
          />
          <Input
            placeholder="font-weight"
            value={t.fontWeight ?? ""}
            onChange={(e) => update({ fontWeight: e.target.value })}
            disabled={disabled}
            className="text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="border-color"
            value={t.borderColor ?? ""}
            onChange={(e) => update({ borderColor: e.target.value })}
            disabled={disabled}
            className="text-xs"
          />
          <Input
            placeholder="box-shadow"
            value={t.shadow ?? ""}
            onChange={(e) => update({ shadow: e.target.value })}
            disabled={disabled}
            className="text-xs"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
