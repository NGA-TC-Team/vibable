"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/editor/animated-list";
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SectionGroup } from "@/components/editor/section-group";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { Entity, EntityField, DataModelPhase } from "@/types/phases";

const fieldTypes = [
  "string",
  "number",
  "boolean",
  "date",
  "enum",
  "relation",
] as const;

const relationTypes = ["1:1", "1:N", "N:M"] as const;

const fkActionOptions = [
  { value: "cascade", label: "CASCADE" },
  { value: "restrict", label: "RESTRICT" },
  { value: "setNull", label: "SET NULL" },
  { value: "noAction", label: "NO ACTION" },
] as const;

const storageStrategyOptions = [
  { value: "local", label: "로컬" },
  { value: "remote", label: "원격" },
  { value: "hybrid", label: "하이브리드" },
  { value: "distributed", label: "분산 저장" },
] as const;

const distributedStrategyOptions = [
  {
    value: "primaryReplica",
    label: "Primary + Replica",
    description: "쓰기 노드 1개와 읽기 복제본을 분리하는 일반적인 기본 전략",
  },
  {
    value: "sharded",
    label: "Sharding",
    description: "tenant/user/key 기준으로 데이터를 분할 저장하는 확장 전략",
  },
  {
    value: "multiRegion",
    label: "Multi-region",
    description: "지역 단위 복제와 장애 대응을 위한 다중 리전 전략",
  },
] as const;

export function DataModelForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("dataModel");
  if (!data) return null;

  const addEntity = () => {
    const entity: Entity = {
      id: crypto.randomUUID(),
      name: "",
      fields: [],
    };
    patchData({ entities: [...data.entities, entity] });
  };

  const updateEntity = (index: number, patch: Partial<Entity>) => {
    const entities = [...data.entities];
    entities[index] = { ...entities[index], ...patch };
    patchData({ entities });
  };

  const removeEntity = (index: number) => {
    patchData({ entities: data.entities.filter((_, i) => i !== index) });
  };

  const addField = (entityIndex: number) => {
    const entities = [...data.entities];
    const field: EntityField = {
      name: "",
      type: "string",
      required: false,
    };
    entities[entityIndex] = {
      ...entities[entityIndex],
      fields: [...entities[entityIndex].fields, field],
    };
    patchData({ entities });
  };

  const updateField = (
    entityIndex: number,
    fieldIndex: number,
    patch: Partial<EntityField>,
  ) => {
    const entities = [...data.entities];
    const fields = [...entities[entityIndex].fields];
    fields[fieldIndex] = { ...fields[fieldIndex], ...patch };
    entities[entityIndex] = { ...entities[entityIndex], fields };
    patchData({ entities });
  };

  const removeField = (entityIndex: number, fieldIndex: number) => {
    const entities = [...data.entities];
    entities[entityIndex] = {
      ...entities[entityIndex],
      fields: entities[entityIndex].fields.filter((_, i) => i !== fieldIndex),
    };
    patchData({ entities });
  };

  const namedEntities = data.entities
    .map((entity) => ({
      name: entity.name.trim(),
      fields: entity.fields,
    }))
    .filter((entity) => entity.name.length > 0);

  return (
    <SectionGroup>
      <section className="space-y-3">
        <SectionHeader title="엔티티" tooltip={SECTION_TOOLTIPS["dataModel.entities"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addEntity}>
              <Plus className="size-3.5" />
              엔티티 추가
            </Button>
          )}
        </SectionHeader>
        <AnimatedList className="space-y-3">
          {data.entities.map((entity, ei) => (
            <AnimatedListItem key={entity.id}>
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="엔티티 이름"
                    value={entity.name}
                    onChange={(e) => updateEntity(ei, { name: e.target.value })}
                    disabled={disabled}
                    className="font-medium"
                  />
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeEntity(ei)}
                      className="hover:border-destructive/40 hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <AnimatedList className="space-y-2">
                    {entity.fields.map((field, fi) => (
                      <AnimatedListItem key={`${entity.id}-field-${fi}`}>
                        <div className="space-y-3 rounded-xl border border-border/60 p-3">
                          <div className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_120px_auto_auto] md:items-center">
                            <Input
                              placeholder="필드명"
                              value={field.name}
                              onChange={(e) =>
                                updateField(ei, fi, { name: e.target.value })
                              }
                              disabled={disabled}
                            />
                            <Select
                              value={field.type}
                              onValueChange={(v) => {
                                const nextType = v as EntityField["type"];
                                const typePatch: Partial<EntityField> =
                                  nextType === "relation"
                                    ? {
                                        type: nextType,
                                        enumValues: undefined,
                                      }
                                    : nextType === "enum"
                                      ? {
                                          type: nextType,
                                          relationTarget: undefined,
                                          relationTargetField: undefined,
                                          relationType: undefined,
                                          onDelete: undefined,
                                          onUpdate: undefined,
                                        }
                                      : {
                                          type: nextType,
                                          enumValues: undefined,
                                          relationTarget: undefined,
                                          relationTargetField: undefined,
                                          relationType: undefined,
                                          onDelete: undefined,
                                          onUpdate: undefined,
                                        };
                                updateField(ei, fi, typePatch);
                              }}
                              disabled={disabled}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  updateField(ei, fi, {
                                    required: !!checked,
                                  })
                                }
                                disabled={disabled}
                              />
                              <span className="text-xs text-muted-foreground">
                                필수
                              </span>
                            </div>
                            {!disabled && (
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => removeField(ei, fi)}
                                  className="hover:border-destructive/40 hover:text-destructive"
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">설명</Label>
                            <Input
                              placeholder="필드의 의미 또는 용도를 설명"
                              value={field.description ?? ""}
                              onChange={(e) =>
                                updateField(ei, fi, {
                                  description: e.target.value,
                                })
                              }
                              disabled={disabled}
                            />
                          </div>

                          {field.type === "enum" ? (
                            <div className="space-y-2">
                              <Label className="text-xs">Enum 값</Label>
                              <StringList
                                items={field.enumValues ?? []}
                                onChange={(enumValues) =>
                                  updateField(ei, fi, { enumValues })
                                }
                                placeholder="예: draft"
                                addLabel="값 추가"
                                emptyMessage="Enum 값을 추가하세요"
                                disabled={disabled}
                              />
                            </div>
                          ) : null}

                          {field.type === "relation" ? (
                            <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                              <div className="grid gap-2 md:grid-cols-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    대상 엔티티
                                  </Label>
                                  <Select
                                    value={field.relationTarget || undefined}
                                    onValueChange={(value) =>
                                      updateField(ei, fi, {
                                        relationTarget: value,
                                        relationTargetField: undefined,
                                      })
                                    }
                                    disabled={
                                      disabled || namedEntities.length === 0
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="엔티티 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {namedEntities.map((targetEntity) => (
                                        <SelectItem
                                          key={targetEntity.name}
                                          value={targetEntity.name}
                                        >
                                          {targetEntity.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    대상 필드
                                  </Label>
                                  <Select
                                    value={
                                      field.relationTargetField || undefined
                                    }
                                    onValueChange={(value) =>
                                      updateField(ei, fi, {
                                        relationTargetField: value,
                                      })
                                    }
                                    disabled={
                                      disabled ||
                                      !field.relationTarget ||
                                      !namedEntities.some(
                                        (targetEntity) =>
                                          targetEntity.name ===
                                            field.relationTarget &&
                                          targetEntity.fields.some((candidate) =>
                                            candidate.name.trim(),
                                          ),
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="필드 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(namedEntities.find(
                                        (targetEntity) =>
                                          targetEntity.name ===
                                          field.relationTarget,
                                      )?.fields ?? [])
                                        .filter((candidate) =>
                                          candidate.name.trim(),
                                        )
                                        .map((candidate) => (
                                          <SelectItem
                                            key={candidate.name}
                                            value={candidate.name}
                                          >
                                            {candidate.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    관계 유형
                                  </Label>
                                  <Select
                                    value={field.relationType || undefined}
                                    onValueChange={(value) =>
                                      updateField(ei, fi, {
                                        relationType:
                                          value as EntityField["relationType"],
                                      })
                                    }
                                    disabled={disabled}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="관계 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {relationTypes.map((relationType) => (
                                        <SelectItem
                                          key={relationType}
                                          value={relationType}
                                        >
                                          {relationType}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid gap-2 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">ON DELETE</Label>
                                  <Select
                                    value={field.onDelete || undefined}
                                    onValueChange={(value) =>
                                      updateField(ei, fi, {
                                        onDelete:
                                          value as EntityField["onDelete"],
                                      })
                                    }
                                    disabled={disabled}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="동작 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {fkActionOptions.map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">ON UPDATE</Label>
                                  <Select
                                    value={field.onUpdate || undefined}
                                    onValueChange={(value) =>
                                      updateField(ei, fi, {
                                        onUpdate:
                                          value as EntityField["onUpdate"],
                                      })
                                    }
                                    disabled={disabled}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="동작 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {fkActionOptions.map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {namedEntities.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  대상 엔티티 이름이 있어야 FK 관계를 선택할 수 있습니다.
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </AnimatedListItem>
                    ))}
                  </AnimatedList>
                  {!disabled && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => addField(ei)}
                    >
                      <Plus className="size-3" />
                      필드 추가
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      <section className="space-y-3">
        <SectionHeader title="저장 전략" tooltip={SECTION_TOOLTIPS["dataModel.storage"]} />
        <RadioGroup
          value={data.storageStrategy}
          onValueChange={(v) => {
            const storageStrategy = v as DataModelPhase["storageStrategy"];
            patchData({
              storageStrategy,
              distributedStrategy:
                storageStrategy === "distributed"
                  ? data.distributedStrategy ?? "primaryReplica"
                  : undefined,
            });
          }}
          disabled={disabled}
        >
          {storageStrategyOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={option.value}
                id={`storage-${option.value}`}
              />
              <Label
                htmlFor={`storage-${option.value}`}
                className="text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {data.storageStrategy === "distributed" ? (
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="space-y-1">
              <Label className="text-xs">분산 저장 전략</Label>
              <Select
                value={data.distributedStrategy ?? "primaryReplica"}
                onValueChange={(value) =>
                  patchData({
                    distributedStrategy:
                      value as NonNullable<DataModelPhase["distributedStrategy"]>,
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {distributedStrategyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              {distributedStrategyOptions.find(
                (option) =>
                  option.value === (data.distributedStrategy ?? "primaryReplica"),
              )?.description ?? ""}
            </p>
          </div>
        ) : null}
        <Textarea
          placeholder="저장 전략에 대한 추가 메모"
          value={data.storageNotes ?? ""}
          onChange={(e) => patchData({ storageNotes: e.target.value })}
          rows={2}
          disabled={disabled}
        />
      </section>
    </SectionGroup>
  );
}
