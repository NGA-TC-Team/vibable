"use client";

import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  Layers3,
  Plus,
  Target,
  TextCursorInput,
  TriangleAlert,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";
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
import { DateInput } from "@/components/ui/date-input";
import { DynamicList, StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SectionGroup } from "@/components/editor/section-group";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type {
  Competitor,
  SuccessMetric,
  Milestone,
  Reference,
  OverviewPhase,
} from "@/types/phases";

const scopeLabels = {
  mvp: "MVP",
  full: "Full",
  prototype: "Prototype",
} as const;

export function OverviewForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("overview");

  if (!data) return null;

  const addGoal = () => {
    patchData({ businessGoals: [...data.businessGoals, ""] });
  };

  const updateGoal = (index: number, value: string) => {
    const goals = [...data.businessGoals];
    goals[index] = value;
    patchData({ businessGoals: goals });
  };

  const removeGoal = (index: number) => {
    patchData({
      businessGoals: data.businessGoals.filter((_, i) => i !== index),
    });
  };

  const patchScope = (patch: Partial<OverviewPhase["scope"]>) => {
    patchData({ scope: { ...(data.scope ?? { type: "mvp", details: "" }), ...patch } });
  };

  const addCompetitor = () => {
    const item: Competitor = { id: crypto.randomUUID(), name: "", strength: "", weakness: "" };
    patchData({ competitors: [...(data.competitors ?? []), item] });
  };

  const updateCompetitor = (index: number, patch: Partial<Competitor>) => {
    const items = [...(data.competitors ?? [])];
    items[index] = { ...items[index], ...patch };
    patchData({ competitors: items });
  };

  const removeCompetitor = (index: number) => {
    patchData({ competitors: (data.competitors ?? []).filter((_, i) => i !== index) });
  };

  const addMetric = () => {
    const item: SuccessMetric = { id: crypto.randomUUID(), metric: "", target: "", measurement: "" };
    patchData({ successMetrics: [...(data.successMetrics ?? []), item] });
  };

  const updateMetric = (index: number, patch: Partial<SuccessMetric>) => {
    const items = [...(data.successMetrics ?? [])];
    items[index] = { ...items[index], ...patch };
    patchData({ successMetrics: items });
  };

  const removeMetric = (index: number) => {
    patchData({ successMetrics: (data.successMetrics ?? []).filter((_, i) => i !== index) });
  };

  const addMilestone = () => {
    const item: Milestone = { id: crypto.randomUUID(), milestone: "", date: "", description: "" };
    patchData({ timeline: [...(data.timeline ?? []), item] });
  };

  const updateMilestone = (index: number, patch: Partial<Milestone>) => {
    const items = [...(data.timeline ?? [])];
    items[index] = { ...items[index], ...patch };
    patchData({ timeline: items });
  };

  const removeMilestone = (index: number) => {
    patchData({ timeline: (data.timeline ?? []).filter((_, i) => i !== index) });
  };

  const addReference = () => {
    const item: Reference = { id: crypto.randomUUID(), title: "" };
    patchData({ references: [...(data.references ?? []), item] });
  };

  const updateReference = (index: number, patch: Partial<Reference>) => {
    const items = [...(data.references ?? [])];
    items[index] = { ...items[index], ...patch };
    patchData({ references: items });
  };

  const removeReference = (index: number) => {
    patchData({ references: (data.references ?? []).filter((_, i) => i !== index) });
  };

  return (
    <SectionGroup>
      <div className="space-y-2">
        <FieldLabel
          htmlFor="ov-project-name"
          icon={Layers3}
          tooltip="사용자와 팀이 공통으로 부를 서비스 또는 프로젝트 이름입니다."
        >
          프로젝트명
        </FieldLabel>
        <Input
          id="ov-project-name"
          placeholder="서비스 이름을 입력하세요"
          value={data.projectName}
          onChange={(e) => patchData({ projectName: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          htmlFor="ov-elevator-pitch"
          icon={TextCursorInput}
          tooltip="서비스의 핵심 가치를 한 문장으로 압축해 설명합니다."
        >
          한줄 소개
        </FieldLabel>
        <Input
          id="ov-elevator-pitch"
          placeholder="140자 이내로 서비스를 소개하세요"
          maxLength={140}
          value={data.elevatorPitch ?? ""}
          onChange={(e) => patchData({ elevatorPitch: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          htmlFor="ov-background"
          icon={TextCursorInput}
          tooltip="이 프로젝트를 시작하게 된 문제와 맥락을 정리합니다."
        >
          개발 배경
        </FieldLabel>
        <Textarea
          id="ov-background"
          placeholder="왜 이 프로젝트를 만드는지 설명하세요"
          value={data.background}
          onChange={(e) => patchData({ background: e.target.value })}
          rows={4}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          htmlFor="ov-core-value"
          icon={Target}
          tooltip="사용자에게 전달할 가장 핵심적인 차별화 포인트를 적습니다."
        >
          핵심 가치 제안
        </FieldLabel>
        <Textarea
          id="ov-core-value"
          placeholder="이 서비스의 차별화 포인트를 짧게 설명하세요"
          value={data.coreValueProposition ?? ""}
          onChange={(e) => patchData({ coreValueProposition: e.target.value })}
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <SectionHeader title="비즈니스 목표" tooltip={SECTION_TOOLTIPS["overview.businessGoals"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addGoal}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        {data.businessGoals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            목표를 추가해 주세요
          </p>
        )}
        <AnimatedList className="space-y-2">
          {data.businessGoals.map((goal, i) => (
            <AnimatedListItem key={`goal-${i}`}>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`목표 ${i + 1}`}
                  value={goal}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  disabled={disabled}
                />
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeGoal(i)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </div>

      <div className="space-y-2">
        <FieldLabel
          htmlFor="ov-target-users"
          icon={Users}
          tooltip="이 서비스를 가장 자주 사용할 주요 사용자군을 설명합니다."
        >
          타깃 유저
        </FieldLabel>
        <Textarea
          id="ov-target-users"
          placeholder="주요 타깃 유저를 설명하세요"
          value={data.targetUsers}
          onChange={(e) => patchData({ targetUsers: e.target.value })}
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={Layers3}
          tooltip="이번 단계에서 포함할 범위와 제외할 범위를 나눠 적습니다."
        >
          프로젝트 범위
        </FieldLabel>
        <div className="flex gap-2">
          <Select
            value={data.scope?.type ?? "mvp"}
            onValueChange={(v) => patchScope({ type: v as OverviewPhase["scope"]["type"] })}
            disabled={disabled}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scopeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="포함/제외할 기능 범위를 설명하세요"
          value={data.scope?.details ?? ""}
          onChange={(e) => patchScope({ details: e.target.value })}
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={Building2}
          tooltip="비슷한 문제를 푸는 경쟁 서비스나 대안을 비교합니다."
        >
          경쟁사 / 대안
        </FieldLabel>
        <DynamicList
          items={data.competitors ?? []}
          onAdd={addCompetitor}
          onRemove={removeCompetitor}
          addLabel="경쟁사 추가"
          emptyMessage="경쟁사를 추가하세요"
          disabled={disabled}
          renderItem={(item, i) => (
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="서비스명"
                value={item.name}
                onChange={(e) => updateCompetitor(i, { name: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="URL (선택)"
                value={item.url ?? ""}
                onChange={(e) => updateCompetitor(i, { url: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="강점"
                value={item.strength}
                onChange={(e) => updateCompetitor(i, { strength: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="약점"
                value={item.weakness}
                onChange={(e) => updateCompetitor(i, { weakness: e.target.value })}
                disabled={disabled}
              />
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={TriangleAlert}
          tooltip="예산, 일정, 리소스처럼 설계에 영향을 주는 제약을 적습니다."
        >
          제약사항
        </FieldLabel>
        <StringList
          items={data.constraints ?? []}
          onChange={(constraints) => patchData({ constraints })}
          placeholder="예: 예산 500만원 이하"
          addLabel="제약사항 추가"
          emptyMessage="제약사항을 추가하세요"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={BarChart3}
          tooltip="프로젝트가 잘 되고 있는지 판단할 지표와 목표값을 정의합니다."
        >
          성공 지표
        </FieldLabel>
        <DynamicList
          items={data.successMetrics ?? []}
          onAdd={addMetric}
          onRemove={removeMetric}
          addLabel="지표 추가"
          emptyMessage="성공 지표를 추가하세요"
          disabled={disabled}
          renderItem={(item, i) => (
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="지표명"
                value={item.metric}
                onChange={(e) => updateMetric(i, { metric: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="목표값"
                value={item.target}
                onChange={(e) => updateMetric(i, { target: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="측정 방법"
                value={item.measurement}
                onChange={(e) => updateMetric(i, { measurement: e.target.value })}
                disabled={disabled}
              />
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={Calendar}
          tooltip="주요 마일스톤과 예상 시점을 정리해 전체 일정 감각을 맞춥니다."
        >
          일정 (마일스톤)
        </FieldLabel>
        <DynamicList
          items={data.timeline ?? []}
          onAdd={addMilestone}
          onRemove={removeMilestone}
          addLabel="마일스톤 추가"
          emptyMessage="마일스톤을 추가하세요"
          disabled={disabled}
          renderItem={(item, i) => (
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="마일스톤"
                value={item.milestone}
                onChange={(e) => updateMilestone(i, { milestone: e.target.value })}
                disabled={disabled}
              />
              <DateInput
                placeholder="일정 (예: 2026-Q2)"
                value={item.date}
                onChange={(v) => updateMilestone(i, { date: v })}
                disabled={disabled}
              />
              <Input
                placeholder="설명"
                value={item.description}
                onChange={(e) => updateMilestone(i, { description: e.target.value })}
                disabled={disabled}
              />
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={BookOpen}
          tooltip="레퍼런스 링크, 문서, 벤치마크 자료를 모아둡니다."
        >
          참고 자료
        </FieldLabel>
        <DynamicList
          items={data.references ?? []}
          onAdd={addReference}
          onRemove={removeReference}
          addLabel="참고 자료 추가"
          emptyMessage="참고 자료를 추가하세요"
          disabled={disabled}
          renderItem={(item, i) => (
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="제목"
                value={item.title}
                onChange={(e) => updateReference(i, { title: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="URL (선택)"
                value={item.url ?? ""}
                onChange={(e) => updateReference(i, { url: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="메모 (선택)"
                value={item.notes ?? ""}
                onChange={(e) => updateReference(i, { notes: e.target.value })}
                disabled={disabled}
              />
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          htmlFor="ov-tech-stack"
          icon={Wrench}
          tooltip="예상 기술 스택이나 구현 메모를 자유롭게 남깁니다."
        >
          기술 스택 메모 (선택)
        </FieldLabel>
        <Input
          id="ov-tech-stack"
          placeholder="예: Next.js, Supabase, Tailwind CSS"
          value={data.techStack ?? ""}
          onChange={(e) => patchData({ techStack: e.target.value })}
          disabled={disabled}
        />
      </div>
    </SectionGroup>
  );
}
