"use client";

import { Plus, X } from "lucide-react";
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
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type {
  DesignSystemPhase,
  ColorToken,
  TypeScaleEntry,
  ComponentStyle,
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
  if (!data) return null;

  const patch = (p: Partial<DesignSystemPhase>) => patchData(p);

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
  const addComponent = () => {
    const comp: ComponentStyle = {
      component: "",
      variants: "",
      borderRadius: "",
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
    <div className="space-y-6">
      {/* § 1 Visual Theme */}
      <section className="space-y-3">
        <Label className="text-base font-semibold">§ 1. 비주얼 테마</Label>
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
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">§ 2. 컬러 팔레트</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addColor}>
              <Plus className="size-3.5" />
            </Button>
          )}
        </div>
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
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">§ 3. 타이포그래피</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addTypeScale}>
              <Plus className="size-3.5" />
            </Button>
          )}
        </div>
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
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            § 4. 컴포넌트 스타일
          </Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addComponent}>
              <Plus className="size-3.5" />
            </Button>
          )}
        </div>
        {data.components.map((comp, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="컴포넌트 (Button, Card 등)"
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
            <Textarea
              placeholder="variants 설명 (default, hover, active, disabled)"
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
        <Label className="text-base font-semibold">§ 5. 레이아웃</Label>
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
        <Label className="text-base font-semibold">§ 7. Do&apos;s and Don&apos;ts</Label>
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
        <Label className="text-base font-semibold">UX 라이팅</Label>
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
              <Button variant="ghost" size="xs" onClick={addGlossary}>
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
    </div>
  );
}
