"use client";

import {
  Briefcase,
  Heart,
  Lightbulb,
  Monitor,
  Plus,
  Quote,
  Target,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SectionGroup } from "@/components/editor/section-group";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { Persona, UserStory } from "@/types/phases";

const PERSONA_DEFAULTS: Omit<Persona, "id"> = {
  name: "",
  role: "",
  demographics: "",
  context: "",
  techProficiency: "",
  behaviors: [],
  motivations: [],
  needs: [],
  painPoints: [],
  frustrations: [],
  goals: [],
  successCriteria: [],
  quote: "",
};

function createEmptyPersona(): Persona {
  return {
    id: crypto.randomUUID(),
    ...PERSONA_DEFAULTS,
  };
}

function normalizePersona(persona: Persona): Persona {
  return {
    ...PERSONA_DEFAULTS,
    ...persona,
    behaviors: persona.behaviors ?? [],
    motivations: persona.motivations ?? [],
    needs: persona.needs ?? [],
    painPoints: persona.painPoints ?? [],
    frustrations: persona.frustrations ?? [],
    goals: persona.goals ?? [],
    successCriteria: persona.successCriteria ?? [],
  };
}

export function UserScenarioForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("userScenario");
  if (!data) return null;

  const isDetailed = data.personaDetailLevel === "detailed";
  const personas = data.personas.map((persona) => normalizePersona(persona));

  const addPersona = () => {
    patchData({ personas: [...personas, createEmptyPersona()] });
  };

  const updatePersona = (index: number, patch: Partial<Persona>) => {
    const nextPersonas = [...personas];
    nextPersonas[index] = { ...nextPersonas[index], ...patch };
    patchData({ personas: nextPersonas });
  };

  const removePersona = (index: number) => {
    patchData({ personas: personas.filter((_, i) => i !== index) });
  };

  const addStory = () => {
    const s: UserStory = {
      id: crypto.randomUUID(),
      personaId: personas[0]?.id ?? "",
      asA: "",
      iWant: "",
      soThat: "",
    };
    patchData({ userStories: [...data.userStories, s] });
  };

  const updateStory = (index: number, patch: Partial<UserStory>) => {
    const stories = [...data.userStories];
    stories[index] = { ...stories[index], ...patch };
    patchData({ userStories: stories });
  };

  const removeStory = (index: number) => {
    patchData({ userStories: data.userStories.filter((_, i) => i !== index) });
  };

  return (
    <SectionGroup>
      {/* Personas */}
      <section className="space-y-3">
        <SectionHeader title="페르소나" tooltip={SECTION_TOOLTIPS["userScenario.personas"]}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
              <span className="text-[11px] font-medium text-muted-foreground">간편형</span>
              <Switch
                size="sm"
                checked={isDetailed}
                onCheckedChange={(checked) =>
                  patchData({
                    personaDetailLevel: checked ? "detailed" : "simple",
                  })
                }
                disabled={disabled}
              />
              <span className="text-[11px] font-medium text-muted-foreground">상세형</span>
            </div>
            {!disabled && (
              <Button variant="outline" size="xs" onClick={addPersona}>
                <Plus className="size-3.5" />
                추가
              </Button>
            )}
          </div>
        </SectionHeader>

        {isDetailed ? (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">상세형 베스트 프랙티스</p>
            <p className="mt-1">
              역할만 적는 대신 배경, 사용 맥락, 동기, 행동 패턴, 성공 기준까지 함께 적으면
              이후 요구사항과 UX 의도 정합성이 좋아집니다.
            </p>
          </div>
        ) : null}

        <AnimatedList className="space-y-3">
          {personas.map((persona, i) => (
            <AnimatedListItem key={persona.id}>
              <div className="space-y-4 rounded-xl border border-border/70 bg-background/80 p-3">
                <div className="flex items-start justify-between">
                  <div className="grid flex-1 gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <FieldLabel
                        icon={User}
                        tooltip="실제 사용자처럼 읽히는 이름을 적어 페르소나를 구체화합니다."
                      >
                        이름
                      </FieldLabel>
                      <Input
                        placeholder="예: 김하늘"
                        value={persona.name}
                        onChange={(e) => updatePersona(i, { name: e.target.value })}
                        disabled={disabled}
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel
                        icon={Briefcase}
                        tooltip="직업, 책임, 사용 상황을 드러내는 역할을 적습니다."
                      >
                        역할
                      </FieldLabel>
                      <Input
                        placeholder="예: 고객 문의를 매일 처리하는 운영 매니저"
                        value={persona.role}
                        onChange={(e) => updatePersona(i, { role: e.target.value })}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removePersona(i)}
                      className="ml-2"
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>

                {isDetailed ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <FieldLabel
                          tooltip="연령대, 숙련도, 업무 환경처럼 의사결정에 영향을 주는 배경을 간단히 적습니다."
                        >
                          배경 정보
                        </FieldLabel>
                        <Input
                          placeholder="예: 30대 초반, 스타트업 근무, 모바일 중심"
                          value={persona.demographics}
                          onChange={(e) => updatePersona(i, { demographics: e.target.value })}
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel
                          icon={Monitor}
                          tooltip="디지털 도구 사용 익숙함, 협업툴 친숙도 같은 수준을 적습니다."
                        >
                          디지털 숙련도
                        </FieldLabel>
                        <Input
                          placeholder="예: 협업툴은 익숙하지만 자동화 설정은 어려워함"
                          value={persona.techProficiency}
                          onChange={(e) => updatePersona(i, { techProficiency: e.target.value })}
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <FieldLabel
                        tooltip="이 사용자가 언제, 어떤 압박과 제약 속에서 서비스를 쓰는지 적습니다."
                      >
                        사용 맥락
                      </FieldLabel>
                      <Textarea
                        placeholder="예: 오전 고객 응대 중 여러 툴을 오가며 급하게 상태를 확인해야 한다."
                        value={persona.context}
                        onChange={(e) => updatePersona(i, { context: e.target.value })}
                        disabled={disabled}
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <FieldLabel
                          icon={Lightbulb}
                          tooltip="이 사용자가 반복적으로 보이는 행동 패턴이나 의사결정 습관을 적습니다."
                        >
                          행동 패턴
                        </FieldLabel>
                        <StringList
                          items={persona.behaviors}
                          onChange={(behaviors) => updatePersona(i, { behaviors })}
                          placeholder="예: 새 기능보다 익숙한 흐름을 선호함"
                          addLabel="행동 추가"
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel
                          icon={Heart}
                          tooltip="사용자가 진짜로 얻고 싶은 감정적/실무적 보상을 적습니다."
                        >
                          동기
                        </FieldLabel>
                        <StringList
                          items={persona.motivations}
                          onChange={(motivations) => updatePersona(i, { motivations })}
                          placeholder="예: 실수를 줄이고 팀 신뢰를 얻고 싶음"
                          addLabel="동기 추가"
                          disabled={disabled}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <FieldLabel
                          tooltip="문제를 해결하기 위해 반드시 충족되어야 하는 실질적 니즈를 적습니다."
                        >
                          핵심 니즈
                        </FieldLabel>
                        <StringList
                          items={persona.needs}
                          onChange={(needs) => updatePersona(i, { needs })}
                          placeholder="예: 지금 상태를 빠르게 파악할 수 있는 요약"
                          addLabel="니즈 추가"
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel
                          tooltip="페인 포인트보다 더 감정적으로 강한 좌절 지점을 기록합니다."
                        >
                          좌절 포인트
                        </FieldLabel>
                        <StringList
                          items={persona.frustrations}
                          onChange={(frustrations) => updatePersona(i, { frustrations })}
                          placeholder="예: 작은 설정 차이로 작업이 반복 취소됨"
                          addLabel="좌절 포인트 추가"
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <FieldLabel
                      icon={TriangleAlert}
                      tooltip="페르소나가 현재 겪고 있는 불편, 장애물, 불만 요소를 적습니다."
                    >
                      페인 포인트
                    </FieldLabel>
                    <StringList
                      items={persona.painPoints}
                      onChange={(painPoints) => updatePersona(i, { painPoints })}
                      placeholder="예: 반복 입력이 많아 시간 손실이 큼"
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel
                      icon={Target}
                      tooltip="페르소나가 서비스로 달성하고 싶은 핵심 목표를 정리합니다."
                    >
                      목표
                    </FieldLabel>
                    <StringList
                      items={persona.goals}
                      onChange={(goals) => updatePersona(i, { goals })}
                      placeholder="예: 상태 확인과 조치를 1분 내 끝내고 싶음"
                      disabled={disabled}
                    />
                  </div>
                </div>

                {isDetailed ? (
                  <>
                    <div className="space-y-1">
                      <FieldLabel
                        tooltip="이 사용자가 제품을 성공으로 판단하는 기준을 적습니다."
                      >
                        성공 기준
                      </FieldLabel>
                      <StringList
                        items={persona.successCriteria}
                        onChange={(successCriteria) => updatePersona(i, { successCriteria })}
                        placeholder="예: 첫 주 안에 팀원이 별도 설명 없이 사용할 수 있어야 함"
                        addLabel="성공 기준 추가"
                        disabled={disabled}
                      />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel
                        icon={Quote}
                        tooltip="실제 인터뷰에서 나올 법한 대표 발화를 한 문장으로 적습니다."
                      >
                        대표 발화
                      </FieldLabel>
                      <Textarea
                        placeholder='예: "설정은 많아도 좋지만 지금 뭘 해야 하는지는 바로 보여야 해요."'
                        value={persona.quote}
                        onChange={(e) => updatePersona(i, { quote: e.target.value })}
                        disabled={disabled}
                        rows={2}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      {/* User Stories */}
      <section className="space-y-3">
        <SectionHeader title="유저 스토리" tooltip={SECTION_TOOLTIPS["userScenario.userStories"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addStory}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <AnimatedList className="space-y-3">
          {data.userStories.map((story, i) => (
            <AnimatedListItem key={story.id}>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <Select
                    value={story.personaId}
                    onValueChange={(v) => updateStory(i, { personaId: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="페르소나" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name || "이름 없음"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeStory(i)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="As a (역할로서)"
                  value={story.asA}
                  onChange={(e) => updateStory(i, { asA: e.target.value })}
                  disabled={disabled}
                />
                <Input
                  placeholder="I want (원하는 것)"
                  value={story.iWant}
                  onChange={(e) => updateStory(i, { iWant: e.target.value })}
                  disabled={disabled}
                />
                <Input
                  placeholder="So that (달성하고 싶은 것)"
                  value={story.soThat}
                  onChange={(e) => updateStory(i, { soThat: e.target.value })}
                  disabled={disabled}
                />
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      {/* Scenarios */}
      <section className="space-y-2">
        <SectionHeader title="성공 시나리오" tooltip={SECTION_TOOLTIPS["userScenario.successScenarios"]} />
        <StringList
          items={data.successScenarios}
          onChange={(successScenarios) => patchData({ successScenarios })}
          placeholder="성공 시나리오"
          disabled={disabled}
        />
      </section>

      <section className="space-y-2">
        <SectionHeader title="실패 시나리오" tooltip={SECTION_TOOLTIPS["userScenario.failureScenarios"]} />
        <StringList
          items={data.failureScenarios}
          onChange={(failureScenarios) => patchData({ failureScenarios })}
          placeholder="실패 시나리오"
          disabled={disabled}
        />
      </section>
    </SectionGroup>
  );
}
