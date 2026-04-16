"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { FunctionalRequirement, NonFunctionalRequirement } from "@/types/phases";

const priorityLabels = {
  must: "Must",
  should: "Should",
  could: "Could",
  wont: "Won't",
} as const;

const nfrCategories = {
  performance: "성능",
  security: "보안",
  accessibility: "접근성",
  offline: "오프라인",
  other: "기타",
} as const;

export function RequirementsForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("requirements");
  if (!data) return null;

  const nextReqId = () => {
    const num = data.functional.length + 1;
    return `REQ-${String(num).padStart(3, "0")}`;
  };

  const addFunctional = () => {
    const req: FunctionalRequirement = {
      id: nextReqId(),
      title: "",
      description: "",
      priority: "should",
      acceptanceCriteria: [],
    };
    patchData({ functional: [...data.functional, req] });
  };

  const updateFunctional = (
    index: number,
    patch: Partial<FunctionalRequirement>,
  ) => {
    const items = [...data.functional];
    items[index] = { ...items[index], ...patch };
    patchData({ functional: items });
  };

  const removeFunctional = (index: number) => {
    patchData({ functional: data.functional.filter((_, i) => i !== index) });
  };

  const addNonFunctional = () => {
    const req: NonFunctionalRequirement = {
      id: `NFR-${String(data.nonFunctional.length + 1).padStart(3, "0")}`,
      category: "other",
      description: "",
    };
    patchData({ nonFunctional: [...data.nonFunctional, req] });
  };

  const updateNonFunctional = (
    index: number,
    patch: Partial<NonFunctionalRequirement>,
  ) => {
    const items = [...data.nonFunctional];
    items[index] = { ...items[index], ...patch };
    patchData({ nonFunctional: items });
  };

  const removeNonFunctional = (index: number) => {
    patchData({
      nonFunctional: data.nonFunctional.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">기능 요구사항</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addFunctional}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </div>
        {data.functional.map((req, i) => (
          <div key={req.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="mt-2 text-xs font-mono text-muted-foreground">
                {req.id}
              </span>
              <Select
                value={req.priority}
                onValueChange={(v) =>
                  updateFunctional(i, {
                    priority: v as FunctionalRequirement["priority"],
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeFunctional(i)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Input
              placeholder="제목"
              value={req.title}
              onChange={(e) => updateFunctional(i, { title: e.target.value })}
              disabled={disabled}
            />
            <Textarea
              placeholder="상세 설명"
              value={req.description}
              onChange={(e) =>
                updateFunctional(i, { description: e.target.value })
              }
              rows={2}
              disabled={disabled}
            />
            <div className="space-y-1">
              <Label className="text-xs">수용 기준</Label>
              <StringList
                items={req.acceptanceCriteria}
                onChange={(acceptanceCriteria) =>
                  updateFunctional(i, { acceptanceCriteria })
                }
                placeholder="수용 기준"
                disabled={disabled}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">비기능 요구사항</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addNonFunctional}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </div>
        {data.nonFunctional.map((req, i) => (
          <div key={req.id} className="flex gap-2 items-start">
            <span className="mt-2 text-xs font-mono text-muted-foreground shrink-0">
              {req.id}
            </span>
            <Select
              value={req.category}
              onValueChange={(v) =>
                updateNonFunctional(i, {
                  category: v as NonFunctionalRequirement["category"],
                })
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(nfrCategories).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="설명"
              value={req.description}
              onChange={(e) =>
                updateNonFunctional(i, { description: e.target.value })
              }
              className="flex-1"
              disabled={disabled}
            />
            {!disabled && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeNonFunctional(i)}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
