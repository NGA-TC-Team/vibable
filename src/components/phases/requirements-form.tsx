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
import type {
  Clarification,
  Constraint,
  FunctionalRequirement,
  GlossaryTerm,
  NonFunctionalRequirement,
} from "@/types/phases";

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

const constraintCategories = {
  policy: "정책",
  legal: "법/규제",
  budget: "예산",
  schedule: "일정",
  legacySystem: "레거시",
  other: "기타",
} as const;

const glossaryKinds = {
  role: "역할",
  state: "상태",
  entity: "객체",
  rule: "규칙",
  term: "용어",
} as const;

const clarificationStatuses = {
  open: "미해결",
  answered: "확인됨",
  deferred: "보류",
} as const;

const PAGE_SIZE = 3;

type RequirementsSliceKey = "requirements" | "agentRequirements" | "cliRequirements";

function padId(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

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
  const [glossarySearch, setGlossarySearch] = useState("");
  const [constraintSearch, setConstraintSearch] = useState("");
  const [clarificationSearch, setClarificationSearch] = useState("");

  if (!data) return null;

  const constraints = data.constraints ?? [];
  const glossary = data.glossary ?? [];
  const clarifications = data.clarifications ?? [];

  const nextReqId = () => padId("REQ", data.functional.length + 1);

  const addFunctional = () => {
    const req: FunctionalRequirement = {
      id: nextReqId(),
      title: "",
      description: "",
      priority: "should",
      acceptanceCriteria: [],
      statement: "",
      rationale: "",
      source: "",
      relatedGoalIds: [],
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
      id: padId("REQ", i + 1),
    }));
    patchData({ functional: renumbered });
    const maxPage = Math.max(1, Math.ceil(remaining.length / PAGE_SIZE));
    if (funcPage > maxPage) setFuncPage(maxPage);
  };

  const addNonFunctional = () => {
    const req: NonFunctionalRequirement = {
      id: padId("NFR", data.nonFunctional.length + 1),
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
      id: padId("NFR", i + 1),
    }));
    patchData({ nonFunctional: renumbered });
  };

  const addGlossary = () => {
    const item: GlossaryTerm = {
      id: padId("GLS", glossary.length + 1),
      term: "",
      definition: "",
      kind: "term",
      aliases: [],
    };
    patchData({ glossary: [...glossary, item] });
  };

  const updateGlossary = (index: number, patch: Partial<GlossaryTerm>) => {
    const items = [...glossary];
    items[index] = { ...items[index], ...patch };
    patchData({ glossary: items });
  };

  const removeGlossary = (index: number) => {
    const remaining = glossary.filter((_, i) => i !== index);
    const renumbered = remaining.map((item, i) => ({
      ...item,
      id: padId("GLS", i + 1),
    }));
    patchData({ glossary: renumbered });
  };

  const addConstraint = () => {
    const item: Constraint = {
      id: padId("CON", constraints.length + 1),
      category: "other",
      description: "",
      source: "",
      impact: "",
    };
    patchData({ constraints: [...constraints, item] });
  };

  const updateConstraint = (index: number, patch: Partial<Constraint>) => {
    const items = [...constraints];
    items[index] = { ...items[index], ...patch };
    patchData({ constraints: items });
  };

  const removeConstraint = (index: number) => {
    const remaining = constraints.filter((_, i) => i !== index);
    const renumbered = remaining.map((item, i) => ({
      ...item,
      id: padId("CON", i + 1),
    }));
    patchData({ constraints: renumbered });
  };

  const addClarification = () => {
    const item: Clarification = {
      id: padId("CLR", clarifications.length + 1),
      question: "",
      context: "",
      owner: "",
      status: "open",
      answer: "",
      blocksRequirementIds: [],
    };
    patchData({ clarifications: [...clarifications, item] });
  };

  const updateClarification = (
    index: number,
    patch: Partial<Clarification>,
  ) => {
    const items = [...clarifications];
    items[index] = { ...items[index], ...patch };
    patchData({ clarifications: items });
  };

  const removeClarification = (index: number) => {
    const remaining = clarifications.filter((_, i) => i !== index);
    const renumbered = remaining.map((item, i) => ({
      ...item,
      id: padId("CLR", i + 1),
    }));
    patchData({ clarifications: renumbered });
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

  const filteredGlossary = glossary
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) =>
      glossarySearch === "" ||
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()),
    );

  const filteredConstraints = constraints
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) =>
      constraintSearch === "" ||
      item.description.toLowerCase().includes(constraintSearch.toLowerCase()),
    );

  const filteredClarifications = clarifications
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) =>
      clarificationSearch === "" ||
      item.question.toLowerCase().includes(clarificationSearch.toLowerCase()),
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
                <div className="space-y-1">
                  <FieldLabel tooltip={SECTION_TOOLTIPS["requirements.statement"]}>
                    규격 문장
                  </FieldLabel>
                  <Textarea
                    placeholder="시스템은 <대상>이 <행동/상태>할 수 있어야 한다"
                    value={req.statement ?? ""}
                    onChange={(e) =>
                      updateFunctional(originalIndex, { statement: e.target.value })
                    }
                    rows={2}
                    disabled={disabled}
                  />
                </div>
                <Textarea
                  placeholder="상세 설명"
                  value={req.description}
                  onChange={(e) =>
                    updateFunctional(originalIndex, { description: e.target.value })
                  }
                  rows={2}
                  disabled={disabled}
                />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <FieldLabel tooltip={SECTION_TOOLTIPS["requirements.rationale"]}>
                      근거
                    </FieldLabel>
                    <Textarea
                      placeholder="왜 필요한가 — 업무 목적"
                      value={req.rationale ?? ""}
                      onChange={(e) =>
                        updateFunctional(originalIndex, { rationale: e.target.value })
                      }
                      rows={2}
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel tooltip={SECTION_TOOLTIPS["requirements.source"]}>
                      출처
                    </FieldLabel>
                    <Input
                      placeholder="요청자 · 근거 문서"
                      value={req.source ?? ""}
                      onChange={(e) =>
                        updateFunctional(originalIndex, { source: e.target.value })
                      }
                      disabled={disabled}
                    />
                  </div>
                </div>
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
        <SectionHeader title="용어 정의" tooltip={SECTION_TOOLTIPS["requirements.glossary"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addGlossary}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="용어 검색..."
            value={glossarySearch}
            onChange={(e) => setGlossarySearch(e.target.value)}
            className="pl-11!"
          />
        </div>
        <AnimatedList className="space-y-2">
          {filteredGlossary.map(({ item, originalIndex }) => (
            <AnimatedListItem key={item.id}>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-mono text-muted-foreground shrink-0">
                    {item.id}
                  </span>
                  <Select
                    value={item.kind}
                    onValueChange={(v) =>
                      updateGlossary(originalIndex, {
                        kind: v as GlossaryTerm["kind"],
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(glossaryKinds).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="용어"
                    value={item.term}
                    onChange={(e) =>
                      updateGlossary(originalIndex, { term: e.target.value })
                    }
                    className="flex-1"
                    disabled={disabled}
                  />
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeGlossary(originalIndex)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="정의"
                  value={item.definition}
                  onChange={(e) =>
                    updateGlossary(originalIndex, { definition: e.target.value })
                  }
                  rows={2}
                  disabled={disabled}
                />
                <div className="space-y-1">
                  <FieldLabel tooltip="같은 개념을 가리키는 동의어 또는 영문명">
                    동의어
                  </FieldLabel>
                  <StringList
                    items={item.aliases}
                    onChange={(aliases) =>
                      updateGlossary(originalIndex, { aliases })
                    }
                    placeholder="동의어"
                    disabled={disabled}
                  />
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      <section className="space-y-3">
        <SectionHeader title="제약조건" tooltip={SECTION_TOOLTIPS["requirements.constraints"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addConstraint}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="제약 검색..."
            value={constraintSearch}
            onChange={(e) => setConstraintSearch(e.target.value)}
            className="pl-11!"
          />
        </div>
        <AnimatedList className="space-y-2">
          {filteredConstraints.map(({ item, originalIndex }) => (
            <AnimatedListItem key={item.id}>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-mono text-muted-foreground shrink-0">
                    {item.id}
                  </span>
                  <Select
                    value={item.category}
                    onValueChange={(v) =>
                      updateConstraint(originalIndex, {
                        category: v as Constraint["category"],
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(constraintCategories).map(([k, v]) => (
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
                      onClick={() => removeConstraint(originalIndex)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="제약 설명"
                  value={item.description}
                  onChange={(e) =>
                    updateConstraint(originalIndex, { description: e.target.value })
                  }
                  rows={2}
                  disabled={disabled}
                />
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Input
                    placeholder="출처 (법령, 계약서, 이해관계자)"
                    value={item.source}
                    onChange={(e) =>
                      updateConstraint(originalIndex, { source: e.target.value })
                    }
                    disabled={disabled}
                  />
                  <Input
                    placeholder="영향 (설계/구현 파급)"
                    value={item.impact}
                    onChange={(e) =>
                      updateConstraint(originalIndex, { impact: e.target.value })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
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

      <section className="space-y-3">
        <SectionHeader
          title="미해결 · 확인 필요"
          tooltip={SECTION_TOOLTIPS["requirements.clarifications"]}
        >
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addClarification}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="질문 검색..."
            value={clarificationSearch}
            onChange={(e) => setClarificationSearch(e.target.value)}
            className="pl-11!"
          />
        </div>
        <AnimatedList className="space-y-2">
          {filteredClarifications.map(({ item, originalIndex }) => (
            <AnimatedListItem key={item.id}>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-mono text-muted-foreground shrink-0">
                    {item.id}
                  </span>
                  <Select
                    value={item.status}
                    onValueChange={(v) =>
                      updateClarification(originalIndex, {
                        status: v as Clarification["status"],
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(clarificationStatuses).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="담당자"
                    value={item.owner}
                    onChange={(e) =>
                      updateClarification(originalIndex, { owner: e.target.value })
                    }
                    className="flex-1"
                    disabled={disabled}
                  />
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeClarification(originalIndex)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="질문 / 불명확한 사항"
                  value={item.question}
                  onChange={(e) =>
                    updateClarification(originalIndex, { question: e.target.value })
                  }
                  rows={2}
                  disabled={disabled}
                />
                <Input
                  placeholder="맥락 (어느 요구/플로우에서 발생했는지)"
                  value={item.context}
                  onChange={(e) =>
                    updateClarification(originalIndex, { context: e.target.value })
                  }
                  disabled={disabled}
                />
                <Textarea
                  placeholder="답변 (나오면 기록)"
                  value={item.answer}
                  onChange={(e) =>
                    updateClarification(originalIndex, { answer: e.target.value })
                  }
                  rows={2}
                  disabled={disabled}
                />
                <div className="space-y-1">
                  <FieldLabel tooltip="이 질문이 막고 있는 FR/NFR id — 해결 전까지 해당 요구 구현을 미룰 수 있습니다.">
                    영향 요구 ID
                  </FieldLabel>
                  <StringList
                    items={item.blocksRequirementIds}
                    onChange={(blocksRequirementIds) =>
                      updateClarification(originalIndex, { blocksRequirementIds })
                    }
                    placeholder="예: REQ-001"
                    disabled={disabled}
                  />
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>
    </SectionGroup>
  );
}
