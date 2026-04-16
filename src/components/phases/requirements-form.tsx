"use client";

import { useState } from "react";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SectionGroup } from "@/components/editor/section-group";
import { SECTION_TOOLTIPS } from "@/lib/constants";
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

const PAGE_SIZE = 3;

type RequirementsSliceKey = "requirements" | "agentRequirements";

export function RequirementsForm({
  disabled = false,
  phaseSlice = "requirements",
}: {
  disabled?: boolean;
  /** 에이전트 프로젝트 Phase 2는 agentRequirements에 저장 */
  phaseSlice?: RequirementsSliceKey;
}) {
  const { data, patchData } = usePhaseData(phaseSlice);
  const [funcSearch, setFuncSearch] = useState("");
  const [funcPage, setFuncPage] = useState(1);
  const [nfSearch, setNfSearch] = useState("");

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
    const remaining = data.functional.filter((_, i) => i !== index);
    const renumbered = remaining.map((req, i) => ({
      ...req,
      id: `REQ-${String(i + 1).padStart(3, "0")}`,
    }));
    patchData({ functional: renumbered });
    const maxPage = Math.max(1, Math.ceil(remaining.length / PAGE_SIZE));
    if (funcPage > maxPage) setFuncPage(maxPage);
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
    const remaining = data.nonFunctional.filter((_, i) => i !== index);
    const renumbered = remaining.map((req, i) => ({
      ...req,
      id: `NFR-${String(i + 1).padStart(3, "0")}`,
    }));
    patchData({ nonFunctional: renumbered });
  };

  const filteredFunctional = data.functional
    .map((req, originalIndex) => ({ req, originalIndex }))
    .filter(({ req }) =>
      funcSearch === "" || req.title.toLowerCase().includes(funcSearch.toLowerCase()),
    );

  const totalFuncPages = Math.max(1, Math.ceil(filteredFunctional.length / PAGE_SIZE));
  const clampedFuncPage = Math.min(funcPage, totalFuncPages);
  const paginatedFunctional = filteredFunctional.slice(
    (clampedFuncPage - 1) * PAGE_SIZE,
    clampedFuncPage * PAGE_SIZE,
  );

  const filteredNonFunctional = data.nonFunctional
    .map((req, originalIndex) => ({ req, originalIndex }))
    .filter(({ req }) =>
      nfSearch === "" || req.description.toLowerCase().includes(nfSearch.toLowerCase()),
    );

  return (
    <SectionGroup>
      <section className="space-y-3">
        <SectionHeader title="기능 요구사항" tooltip={SECTION_TOOLTIPS["requirements.functional"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addFunctional}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="요구사항 이름으로 검색..."
            value={funcSearch}
            onChange={(e) => {
              setFuncSearch(e.target.value);
              setFuncPage(1);
            }}
            className="pl-11!"
          />
        </div>
        <AnimatedList className="space-y-3">
          {paginatedFunctional.map(({ req, originalIndex }) => (
            <AnimatedListItem key={req.id}>
              <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="mt-2 text-xs font-mono text-muted-foreground">
                {req.id}
              </span>
              <Select
                value={req.priority}
                onValueChange={(v) =>
                  updateFunctional(originalIndex, {
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
                  onClick={() => removeFunctional(originalIndex)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Input
              placeholder="제목"
              value={req.title}
              onChange={(e) => updateFunctional(originalIndex, { title: e.target.value })}
              disabled={disabled}
            />
            <Textarea
              placeholder="상세 설명"
              value={req.description}
              onChange={(e) =>
                updateFunctional(originalIndex, { description: e.target.value })
              }
              rows={2}
              disabled={disabled}
            />
            <div className="space-y-1">
              <FieldLabel
                icon={CheckSquare}
                tooltip="요구사항이 충족되었다고 판단할 수 있는 구체적인 기준 목록입니다."
              >
                수용 기준
              </FieldLabel>
              <StringList
                items={req.acceptanceCriteria}
                onChange={(acceptanceCriteria) =>
                  updateFunctional(originalIndex, { acceptanceCriteria })
                }
                placeholder="수용 기준"
                disabled={disabled}
              />
            </div>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
        {totalFuncPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-2">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setFuncPage((p) => Math.max(1, p - 1))}
              disabled={clampedFuncPage === 1}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            {Array.from({ length: totalFuncPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={clampedFuncPage === i + 1 ? "default" : "ghost"}
                size="xs"
                onClick={() => setFuncPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setFuncPage((p) => Math.min(totalFuncPages, p + 1))}
              disabled={clampedFuncPage === totalFuncPages}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="비기능 요구사항" tooltip={SECTION_TOOLTIPS["requirements.nonFunctional"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addNonFunctional}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="비기능 요구사항 검색..."
            value={nfSearch}
            onChange={(e) => setNfSearch(e.target.value)}
            className="pl-11!"
          />
        </div>
        <AnimatedList className="space-y-2">
          {filteredNonFunctional.map(({ req, originalIndex }) => (
            <AnimatedListItem key={req.id}>
              <div className="flex gap-2 items-start">
            <span className="mt-2 text-xs font-mono text-muted-foreground shrink-0">
              {req.id}
            </span>
            <Select
              value={req.category}
              onValueChange={(v) =>
                updateNonFunctional(originalIndex, {
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
                updateNonFunctional(originalIndex, { description: e.target.value })
              }
              className="flex-1"
              disabled={disabled}
            />
            {!disabled && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeNonFunctional(originalIndex)}
              >
                <X className="size-3.5" />
              </Button>
            )}
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>
    </SectionGroup>
  );
}
