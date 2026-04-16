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

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">엔티티</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addEntity}>
              <Plus className="size-3.5" />
              엔티티 추가
            </Button>
          )}
        </div>
        {data.entities.map((entity, ei) => (
          <div key={entity.id} className="rounded-lg border p-3 space-y-3">
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
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {entity.fields.map((field, fi) => (
                <div
                  key={fi}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
                >
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
                    onValueChange={(v) =>
                      updateField(ei, fi, {
                        type: v as EntityField["type"],
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24">
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
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) =>
                        updateField(ei, fi, { required: !!checked })
                      }
                      disabled={disabled}
                    />
                    <span className="text-xs text-muted-foreground">필수</span>
                  </div>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeField(ei, fi)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => addField(ei)}
                >
                  <Plus className="size-3" />
                  필드 추가
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <Label className="text-base font-semibold">저장 전략</Label>
        <RadioGroup
          value={data.storageStrategy}
          onValueChange={(v) =>
            patchData({
              storageStrategy: v as DataModelPhase["storageStrategy"],
            })
          }
          disabled={disabled}
        >
          {(["local", "remote", "hybrid"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <RadioGroupItem value={s} id={`storage-${s}`} />
              <Label htmlFor={`storage-${s}`} className="text-sm">
                {s === "local"
                  ? "로컬"
                  : s === "remote"
                    ? "원격"
                    : "하이브리드"}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Textarea
          placeholder="저장 전략에 대한 추가 메모"
          value={data.storageNotes ?? ""}
          onChange={(e) => patchData({ storageNotes: e.target.value })}
          rows={2}
          disabled={disabled}
        />
      </section>
    </div>
  );
}
