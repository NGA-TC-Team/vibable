"use client";

import { useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SectionGroup } from "@/components/editor/section-group";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { usePhaseData } from "@/hooks/use-phase.hook";
import {
  designSystemPresets,
  PRESET_CATEGORIES,
  type DesignSystemPreset,
} from "@/lib/presets/design-system-presets";
import { COMPONENT_TEMPLATES } from "@/lib/presets/component-templates";
import { PresetCard } from "./design-system-preset-card";
import { ComponentStylePreview } from "./component-style-preview";
import { ComponentTokenEditor } from "./component-token-editor";
import type {
  DesignSystemPhase,
  ColorToken,
  TypeScaleEntry,
  ComponentStyle,
  ComponentCategory,
  GlossaryEntry,
} from "@/types/phases";

const toneLabels: Record<number, string> = {
  1: "매우 격식체",
  2: "격식체",
  3: "중립",
  4: "친근",
  5: "매우 친근",
};

export function DesignSystemForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("designSystem");
  const [presetCategory, setPresetCategory] = useState<string>("all");
  const [presetSearch, setPresetSearch] = useState("");

  if (!data) return null;

  const patch = (p: Partial<DesignSystemPhase>) => patchData(p);

  const applyPreset = (preset: DesignSystemPreset) => {
    patchData({
      visualTheme: {
        mood: preset.visualTheme.mood,
        density: preset.visualTheme.density,
        philosophy: preset.visualTheme.philosophy,
      },
      colorPalette: preset.colorPalette,
      typography: {
        ...data.typography,
        fontFamilies: preset.typography.fontFamilies,
      },
      presetSelection: {
        ...data.presetSelection,
        moodPreset: preset.id,
      },
      ...(preset.components ? { components: preset.components } : {}),
    });
  };

  const resetPreset = () => {
    patchData({
      visualTheme: { mood: "", density: "comfortable", philosophy: "" },
      colorPalette: [],
      typography: { ...data.typography, fontFamilies: [] },
      presetSelection: undefined,
    });
  };

  const filteredPresets = designSystemPresets.filter((p) => {
    const catMatch = presetCategory === "all" || p.category === presetCategory;
    const searchMatch = presetSearch === "" ||
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(presetSearch.toLowerCase());
    return catMatch && searchMatch;
  });

  const updateNestedField = <
    K extends keyof DesignSystemPhase,
  >(
    key: K,
    nestedPatch: Partial<DesignSystemPhase[K]>,
  ) => {
    patch({ [key]: { ...data[key], ...nestedPatch } } as Partial<DesignSystemPhase>);
  };

  // Color tokens
  const addColor = () => {
    const token: ColorToken = { name: "", hex: "#000000", role: "" };
    patch({ colorPalette: [...data.colorPalette, token] });
  };

  const updateColor = (i: number, p: Partial<ColorToken>) => {
    const palette = [...data.colorPalette];
    palette[i] = { ...palette[i], ...p };
    patch({ colorPalette: palette });
  };

  const removeColor = (i: number) => {
    patch({ colorPalette: data.colorPalette.filter((_, idx) => idx !== i) });
  };

  // Type scale
  const addTypeScale = () => {
    const entry: TypeScaleEntry = {
      name: "",
      size: "",
      lineHeight: "",
      weight: "",
    };
    updateNestedField("typography", {
      scale: [...data.typography.scale, entry],
    });
  };

  const updateTypeScale = (i: number, p: Partial<TypeScaleEntry>) => {
    const scale = [...data.typography.scale];
    scale[i] = { ...scale[i], ...p };
    updateNestedField("typography", { scale });
  };

  const removeTypeScale = (i: number) => {
    updateNestedField("typography", {
      scale: data.typography.scale.filter((_, idx) => idx !== i),
    });
  };

  // Components
  const addComponentByCategory = (category: ComponentCategory) => {
    const template = COMPONENT_TEMPLATES[category];
    const comp: ComponentStyle = {
      component: template.defaultComponent.component ?? "",
      category,
      variants: template.defaultComponent.variants ?? "",
      borderRadius: template.defaultComponent.borderRadius ?? "",
      defaultStyle: template.defaultComponent.defaultStyle,
      hoverStyle: template.defaultComponent.hoverStyle,
    };
    patch({ components: [...data.components, comp] });
  };

  const updateComponent = (i: number, p: Partial<ComponentStyle>) => {
    const components = [...data.components];
    components[i] = { ...components[i], ...p };
    patch({ components });
  };

  const removeComponent = (i: number) => {
    patch({ components: data.components.filter((_, idx) => idx !== i) });
  };

  // Glossary
  const addGlossary = () => {
    const entry: GlossaryEntry = { term: "", avoid: "" };
    updateNestedField("uxWriting", {
      glossary: [...data.uxWriting.glossary, entry],
    });
  };

  const updateGlossary = (i: number, p: Partial<GlossaryEntry>) => {
    const glossary = [...data.uxWriting.glossary];
    glossary[i] = { ...glossary[i], ...p };
    updateNestedField("uxWriting", { glossary });
  };

  const removeGlossary = (i: number) => {
    updateNestedField("uxWriting", {
      glossary: data.uxWriting.glossary.filter((_, idx) => idx !== i),
    });
  };

  return (
    <SectionGroup>
      {/* § 0 Preset Selection */}
      <section className="space-y-3">
        <SectionHeader title="§ 0. 프리셋 선택 (선택사항)" tooltip="브랜드 디자인 시스템을 프리셋으로 빠르게 적용할 수 있습니다." />
        <div className="flex gap-2">
          <Select value={presetCategory} onValueChange={setPresetCategory}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {PRESET_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="프리셋 검색..."
              value={presetSearch}
              onChange={(e) => setPresetSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={data.presetSelection?.moodPreset === preset.id}
              onSelect={() => !disabled && applyPreset(preset)}
            />
          ))}
        </div>
        {filteredPresets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">검색 결과 없음</p>
        )}
        <div className="flex gap-2">
          <p className="flex-1 text-xs text-muted-foreground">
            ✓ 프리셋을 적용한 후 개별 필드 수정 가능
          </p>
          {data.presetSelection?.moodPreset && !disabled && (
            <Button variant="ghost" size="xs" onClick={resetPreset}>
              초기화
            </Button>
          )}
        </div>
      </section>

      {/* § 1 Visual Theme */}
      <section className="space-y-3">
        <SectionHeader title="§ 1. 비주얼 테마" tooltip={SECTION_TOOLTIPS["designSystem.visualTheme"]} />
        <Input
          placeholder="분위기 (예: Minimal and warm)"
          value={data.visualTheme.mood}
          onChange={(e) =>
            updateNestedField("visualTheme", { mood: e.target.value })
          }
          disabled={disabled}
        />
        <Select
          value={data.visualTheme.density}
          onValueChange={(v) =>
            updateNestedField("visualTheme", {
              density: v as DesignSystemPhase["visualTheme"]["density"],
            })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="밀도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="디자인 철학"
          value={data.visualTheme.philosophy}
          onChange={(e) =>
            updateNestedField("visualTheme", { philosophy: e.target.value })
          }
          disabled={disabled}
        />
      </section>

      {/* § 2 Color Palette */}
      <section className="space-y-3">
        <SectionHeader title="§ 2. 컬러 팔레트" tooltip={SECTION_TOOLTIPS["designSystem.colorPalette"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addColor}>
              <Plus className="size-3.5" />
            </Button>
          )}
        </SectionHeader>
        {data.colorPalette.map((token, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="color"
              value={token.hex}
              onChange={(e) => updateColor(i, { hex: e.target.value })}
              disabled={disabled}
              className="h-9 w-9 shrink-0 cursor-pointer rounded border"
            />
            <Input
              placeholder="이름 (Primary 등)"
              value={token.name}
              onChange={(e) => updateColor(i, { name: e.target.value })}
              disabled={disabled}
            />
            <Input
              placeholder="역할"
              value={token.role}
              onChange={(e) => updateColor(i, { role: e.target.value })}
              disabled={disabled}
            />
            {!disabled && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeColor(i)}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </section>

      {/* § 3 Typography */}
      <section className="space-y-3">
        <SectionHeader title="§ 3. 타이포그래피" tooltip={SECTION_TOOLTIPS["designSystem.typography"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addTypeScale}>
              <Plus className="size-3.5" />
            </Button>
          )}
        </SectionHeader>
        {data.typography.scale.map((entry, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <Input
              placeholder="이름"
              value={entry.name}
              onChange={(e) => updateTypeScale(i, { name: e.target.value })}
              disabled={disabled}
            />
            <Input
              placeholder="크기"
              value={entry.size}
              onChange={(e) => updateTypeScale(i, { size: e.target.value })}
              disabled={disabled}
            />
            <Input
              placeholder="weight"
              value={entry.weight}
              onChange={(e) => updateTypeScale(i, { weight: e.target.value })}
              disabled={disabled}
            />
            <div className="flex gap-1">
              <Input
                placeholder="line-height"
                value={entry.lineHeight}
                onChange={(e) =>
                  updateTypeScale(i, { lineHeight: e.target.value })
                }
                disabled={disabled}
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeTypeScale(i)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* § 4 Components */}
      <section className="space-y-3">
        <SectionHeader title="§ 4. 컴포넌트 스타일" tooltip={SECTION_TOOLTIPS["designSystem.components"]}>
          {!disabled && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="xs">
                  <Plus className="size-3.5" />
                  추가
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                <div className="grid gap-0.5">
                  {(Object.entries(COMPONENT_TEMPLATES) as [ComponentCategory, (typeof COMPONENT_TEMPLATES)[ComponentCategory]][]).map(
                    ([key, tmpl]) => (
                      <button
                        key={key}
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted text-left w-full"
                        onClick={() => addComponentByCategory(key)}
                      >
                        {tmpl.label}
                      </button>
                    ),
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </SectionHeader>
        {data.components.map((comp, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-3">
            <div className="flex gap-2">
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded self-center">
                {comp.category ?? "custom"}
              </span>
              <Input
                placeholder="컴포넌트 이름"
                value={comp.component}
                onChange={(e) =>
                  updateComponent(i, { component: e.target.value })
                }
                disabled={disabled}
              />
              <Input
                placeholder="border-radius"
                value={comp.borderRadius}
                onChange={(e) =>
                  updateComponent(i, { borderRadius: e.target.value })
                }
                disabled={disabled}
                className="w-28"
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeComponent(i)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <ComponentStylePreview style={comp} />
            <div className="space-y-1">
              <ComponentTokenEditor
                label="Default"
                token={comp.defaultStyle}
                onChange={(defaultStyle) => updateComponent(i, { defaultStyle })}
                disabled={disabled}
              />
              <ComponentTokenEditor
                label="Hover"
                token={comp.hoverStyle}
                onChange={(hoverStyle) => updateComponent(i, { hoverStyle })}
                disabled={disabled}
              />
              <ComponentTokenEditor
                label="Active"
                token={comp.activeStyle}
                onChange={(activeStyle) => updateComponent(i, { activeStyle })}
                disabled={disabled}
              />
              <ComponentTokenEditor
                label="Disabled"
                token={comp.disabledStyle}
                onChange={(disabledStyle) => updateComponent(i, { disabledStyle })}
                disabled={disabled}
              />
            </div>
            <Textarea
              placeholder="variants 설명 (primary, secondary, ghost, outlined)"
              value={comp.variants}
              onChange={(e) =>
                updateComponent(i, { variants: e.target.value })
              }
              rows={2}
              disabled={disabled}
            />
          </div>
        ))}
      </section>

      {/* § 5 Layout */}
      <section className="space-y-3">
        <SectionHeader title="§ 5. 레이아웃" tooltip={SECTION_TOOLTIPS["designSystem.layout"]} />
        <Input
          placeholder="최대 콘텐츠 너비 (예: 1280px)"
          value={data.layout.maxContentWidth}
          onChange={(e) =>
            updateNestedField("layout", { maxContentWidth: e.target.value })
          }
          disabled={disabled}
        />
        <Textarea
          placeholder="여백 철학"
          value={data.layout.whitespacePhilosophy}
          onChange={(e) =>
            updateNestedField("layout", {
              whitespacePhilosophy: e.target.value,
            })
          }
          rows={2}
          disabled={disabled}
        />
      </section>

      {/* § 7 Do's and Don'ts */}
      <section className="space-y-3">
        <SectionHeader title="§ 7. Do's and Don'ts" tooltip={SECTION_TOOLTIPS["designSystem.guidelines"]} />
        <div className="space-y-2">
          <Label className="text-xs">Do&apos;s</Label>
          <StringList
            items={data.guidelines.dos}
            onChange={(dos) => updateNestedField("guidelines", { dos })}
            placeholder="Do"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Don&apos;ts</Label>
          <StringList
            items={data.guidelines.donts}
            onChange={(donts) => updateNestedField("guidelines", { donts })}
            placeholder="Don't"
            disabled={disabled}
          />
        </div>
      </section>

      {/* UX Writing */}
      <section className="space-y-3">
        <SectionHeader title="UX 라이팅" tooltip={SECTION_TOOLTIPS["designSystem.uxWriting"]} />
        <div className="space-y-2">
          <Label className="text-xs">
            톤 레벨: {toneLabels[data.uxWriting.toneLevel]}
          </Label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[data.uxWriting.toneLevel]}
            onValueChange={([v]) =>
              updateNestedField("uxWriting", {
                toneLevel: v as DesignSystemPhase["uxWriting"]["toneLevel"],
              })
            }
            disabled={disabled}
          />
        </div>
        <Select
          value={data.uxWriting.errorMessageStyle}
          onValueChange={(v) =>
            updateNestedField("uxWriting", {
              errorMessageStyle:
                v as DesignSystemPhase["uxWriting"]["errorMessageStyle"],
            })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="에러 메시지 스타일" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="descriptive">상세</SelectItem>
            <SelectItem value="concise">간결</SelectItem>
            <SelectItem value="friendly">친근</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">용어 사전</Label>
            {!disabled && (
              <Button variant="outline" size="xs" onClick={addGlossary}>
                <Plus className="size-3" />
              </Button>
            )}
          </div>
          {data.uxWriting.glossary.map((entry, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="사용 용어"
                value={entry.term}
                onChange={(e) => updateGlossary(i, { term: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="피할 표현"
                value={entry.avoid}
                onChange={(e) => updateGlossary(i, { avoid: e.target.value })}
                disabled={disabled}
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeGlossary(i)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </SectionGroup>
  );
}
