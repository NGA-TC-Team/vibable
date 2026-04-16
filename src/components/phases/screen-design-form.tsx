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
import { useEditorStore } from "@/services/store/editor-store";
import type { ScreenPage, ErrorState, Interaction } from "@/types/phases";

const errorTypes = {
  network: "네트워크",
  validation: "유효성 검증",
  permission: "권한",
  notFound: "Not Found",
  custom: "커스텀",
} as const;

function ScreenPageEditor({
  page,
  pageIndex,
  disabled,
  updatePage,
  removePage,
  addError,
  updateError,
  removeError,
  addInteraction,
  updateInteraction,
  removeInteraction,
}: {
  page: ScreenPage;
  pageIndex: number;
  disabled: boolean;
  updatePage: (index: number, patch: Partial<ScreenPage>) => void;
  removePage: (index: number) => void;
  addError: (pageIndex: number) => void;
  updateError: (pageIndex: number, errIndex: number, patch: Partial<ErrorState>) => void;
  removeError: (pageIndex: number, errIndex: number) => void;
  addInteraction: (pageIndex: number) => void;
  updateInteraction: (pageIndex: number, intIndex: number, patch: Partial<Interaction>) => void;
  removeInteraction: (pageIndex: number, intIndex: number) => void;
}) {
  const pi = pageIndex;

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="화면 이름"
          value={page.name}
          onChange={(e) => updatePage(pi, { name: e.target.value })}
          disabled={disabled}
        />
        <Input
          placeholder="라우트"
          value={page.route ?? ""}
          onChange={(e) => updatePage(pi, { route: e.target.value })}
          disabled={disabled}
          className="w-36"
        />
        {!disabled && (
          <Button variant="ghost" size="icon-xs" onClick={() => removePage(pi)}>
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">유저 목표</Label>
          <Textarea
            placeholder="유저가 이 화면에서 달성하려는 것"
            value={page.uxIntent.userGoal}
            onChange={(e) =>
              updatePage(pi, {
                uxIntent: { ...page.uxIntent, userGoal: e.target.value },
              })
            }
            rows={2}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">비즈니스 의도</Label>
          <Textarea
            placeholder="비즈니스 측면에서의 의도"
            value={page.uxIntent.businessIntent}
            onChange={(e) =>
              updatePage(pi, {
                uxIntent: { ...page.uxIntent, businessIntent: e.target.value },
              })
            }
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">상태별 UI</Label>
        <Input
          placeholder="Idle 상태"
          value={page.states.idle}
          onChange={(e) => updatePage(pi, { states: { ...page.states, idle: e.target.value } })}
          disabled={disabled}
        />
        <Input
          placeholder="Loading 상태"
          value={page.states.loading}
          onChange={(e) => updatePage(pi, { states: { ...page.states, loading: e.target.value } })}
          disabled={disabled}
        />
        <Input
          placeholder="Offline 상태"
          value={page.states.offline}
          onChange={(e) => updatePage(pi, { states: { ...page.states, offline: e.target.value } })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">에러 상태</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={() => addError(pi)}>
              <Plus className="size-3" />
            </Button>
          )}
        </div>
        {page.states.errors.map((err, ei) => (
          <div key={ei} className="flex gap-2">
            <Select
              value={err.type}
              onValueChange={(v) => updateError(pi, ei, { type: v as ErrorState["type"] })}
              disabled={disabled}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(errorTypes).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="설명"
              value={err.description}
              onChange={(e) => updateError(pi, ei, { description: e.target.value })}
              disabled={disabled}
            />
            {!disabled && (
              <Button variant="ghost" size="icon-xs" onClick={() => removeError(pi, ei)}>
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">인터랙션</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={() => addInteraction(pi)}>
              <Plus className="size-3" />
            </Button>
          )}
        </div>
        {page.interactions.map((int, ii) => (
          <div key={ii} className="grid grid-cols-3 gap-2">
            <Input
              placeholder="요소"
              value={int.element}
              onChange={(e) => updateInteraction(pi, ii, { element: e.target.value })}
              disabled={disabled}
            />
            <Input
              placeholder="트리거"
              value={int.trigger}
              onChange={(e) => updateInteraction(pi, ii, { trigger: e.target.value })}
              disabled={disabled}
            />
            <div className="flex gap-1">
              <Input
                placeholder="액션"
                value={int.action}
                onChange={(e) => updateInteraction(pi, ii, { action: e.target.value })}
                disabled={disabled}
              />
              {!disabled && (
                <Button variant="ghost" size="icon-xs" onClick={() => removeInteraction(pi, ii)}>
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Label className="text-xs">연결 페이지 (In)</Label>
        <StringList
          items={page.inPages}
          onChange={(inPages) => updatePage(pi, { inPages })}
          placeholder="인입 페이지 ID"
          disabled={disabled}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">연결 페이지 (Out)</Label>
        <StringList
          items={page.outPages}
          onChange={(outPages) => updatePage(pi, { outPages })}
          placeholder="아웃 페이지 ID"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function ScreenDesignForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("screenDesign");
  const activeScreenPageId = useEditorStore((s) => s.activeScreenPageId);
  const setActiveScreenPageId = useEditorStore((s) => s.setActiveScreenPageId);
  if (!data) return null;

  const activeId = activeScreenPageId ?? data.pages[0]?.id ?? null;

  const activeIndex = data.pages.findIndex((p) => p.id === activeId);
  const activePage = activeIndex >= 0 ? data.pages[activeIndex] : null;

  const addPage = () => {
    const page: ScreenPage = {
      id: crypto.randomUUID(),
      name: "",
      route: "",
      uxIntent: { userGoal: "", businessIntent: "" },
      states: { idle: "", loading: "", offline: "", errors: [] },
      interactions: [],
      inPages: [],
      outPages: [],
    };
    patchData({ pages: [...data.pages, page] });
    setActiveScreenPageId(page.id);
  };

  const updatePage = (index: number, patch: Partial<ScreenPage>) => {
    const pages = [...data.pages];
    pages[index] = { ...pages[index], ...patch };
    patchData({ pages });
  };

  const removePage = (index: number) => {
    const remaining = data.pages.filter((_, i) => i !== index);
    patchData({ pages: remaining });
    if (data.pages[index]?.id === activeId) {
      setActiveScreenPageId(remaining[0]?.id ?? null);
    }
  };

  const addError = (pageIndex: number) => {
    const pages = [...data.pages];
    const err: ErrorState = { type: "custom", description: "" };
    pages[pageIndex] = {
      ...pages[pageIndex],
      states: { ...pages[pageIndex].states, errors: [...pages[pageIndex].states.errors, err] },
    };
    patchData({ pages });
  };

  const updateError = (pageIndex: number, errIndex: number, patch: Partial<ErrorState>) => {
    const pages = [...data.pages];
    const errors = [...pages[pageIndex].states.errors];
    errors[errIndex] = { ...errors[errIndex], ...patch };
    pages[pageIndex] = { ...pages[pageIndex], states: { ...pages[pageIndex].states, errors } };
    patchData({ pages });
  };

  const removeError = (pageIndex: number, errIndex: number) => {
    const pages = [...data.pages];
    pages[pageIndex] = {
      ...pages[pageIndex],
      states: { ...pages[pageIndex].states, errors: pages[pageIndex].states.errors.filter((_, i) => i !== errIndex) },
    };
    patchData({ pages });
  };

  const addInteraction = (pageIndex: number) => {
    const pages = [...data.pages];
    const interaction: Interaction = { element: "", trigger: "", action: "" };
    pages[pageIndex] = { ...pages[pageIndex], interactions: [...pages[pageIndex].interactions, interaction] };
    patchData({ pages });
  };

  const updateInteraction = (pageIndex: number, intIndex: number, patch: Partial<Interaction>) => {
    const pages = [...data.pages];
    const interactions = [...pages[pageIndex].interactions];
    interactions[intIndex] = { ...interactions[intIndex], ...patch };
    pages[pageIndex] = { ...pages[pageIndex], interactions };
    patchData({ pages });
  };

  const removeInteraction = (pageIndex: number, intIndex: number) => {
    const pages = [...data.pages];
    pages[pageIndex] = {
      ...pages[pageIndex],
      interactions: pages[pageIndex].interactions.filter((_, i) => i !== intIndex),
    };
    patchData({ pages });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={activeId ?? undefined} onValueChange={setActiveScreenPageId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="화면 선택" />
          </SelectTrigger>
          <SelectContent>
            {data.pages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name || "이름 없음"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!disabled && (
          <Button variant="ghost" size="xs" onClick={addPage}>
            <Plus className="size-3.5" />
            화면 추가
          </Button>
        )}
      </div>
      {activePage && activeIndex >= 0 && (
        <ScreenPageEditor
          key={activePage.id}
          page={activePage}
          pageIndex={activeIndex}
          disabled={disabled}
          updatePage={updatePage}
          removePage={removePage}
          addError={addError}
          updateError={updateError}
          removeError={removeError}
          addInteraction={addInteraction}
          updateInteraction={updateInteraction}
          removeInteraction={removeInteraction}
        />
      )}
    </div>
  );
}
