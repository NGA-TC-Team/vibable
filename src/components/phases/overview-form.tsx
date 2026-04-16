"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePhaseData } from "@/hooks/use-phase.hook";

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

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="ov-project-name">프로젝트명</Label>
        <Input
          id="ov-project-name"
          placeholder="서비스 이름을 입력하세요"
          value={data.projectName}
          onChange={(e) => patchData({ projectName: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ov-background">개발 배경</Label>
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
        <div className="flex items-center justify-between">
          <Label>비즈니스 목표</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addGoal}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </div>
        {data.businessGoals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            목표를 추가해 주세요
          </p>
        )}
        {data.businessGoals.map((goal, i) => (
          <div key={i} className="flex items-center gap-2">
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
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ov-target-users">타깃 유저</Label>
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
        <Label htmlFor="ov-tech-stack">기술 스택 메모 (선택)</Label>
        <Input
          id="ov-tech-stack"
          placeholder="예: Next.js, Supabase, Tailwind CSS"
          value={data.techStack ?? ""}
          onChange={(e) => patchData({ techStack: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
