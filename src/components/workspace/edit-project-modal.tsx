"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROJECT_TYPES } from "@/lib/project-types";
import { useUpdateProject } from "@/hooks/use-project.hook";
import { toast } from "sonner";
import {
  createAgentProjectPhaseData,
  createDefaultPhaseData,
} from "@/lib/schemas/phase-data";
import type { AgentSubType, Project, ProjectType } from "@/types/phases";

const AGENT_SUB_OPTIONS: {
  value: AgentSubType;
  label: string;
  desc: string;
}[] = [
  {
    value: "claude-subagent",
    label: "Claude Subagent",
    desc: ".claude/agents",
  },
  { value: "openclaw", label: "OpenClaw", desc: "워크스페이스" },
];

interface EditProjectModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectModal({
  project,
  open,
  onOpenChange,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [type, setType] = useState<ProjectType>(project.type);
  const [agentSubType, setAgentSubType] = useState<AgentSubType>(
    project.agentSubType ?? "claude-subagent",
  );
  const updateProject = useUpdateProject();

  useEffect(() => {
    if (open) {
      setName(project.name);
      setType(project.type);
      setAgentSubType(project.agentSubType ?? "claude-subagent");
    }
  }, [open, project.name, project.type, project.agentSubType]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (type === "agent" && !agentSubType) {
      toast.error("AI 에이전트 하위 유형을 선택하세요");
      return;
    }

    const updates: Partial<Project> & { id: string } = {
      id: project.id,
      name: name.trim(),
    };

    const typeChanged = type !== project.type;
    const subtypeChanged =
      type === "agent" &&
      project.type === "agent" &&
      agentSubType !== project.agentSubType;

    if (typeChanged) {
      updates.type = type;
      if (type === "agent") {
        updates.agentSubType = agentSubType;
        if (project.type !== "agent") {
          updates.phases = createAgentProjectPhaseData(agentSubType) as Project["phases"];
        }
      } else {
        updates.agentSubType = undefined;
        if (project.type === "agent") {
          if (
            !globalThis.confirm(
              "에이전트 전용 페이즈 데이터가 삭제되고 일반 템플릿으로 바뀝니다. 계속할까요?",
            )
          ) {
            return;
          }
          updates.phases = createDefaultPhaseData() as Project["phases"];
        }
      }
    } else if (subtypeChanged) {
      if (
        !globalThis.confirm(
          "하위 유형을 바꾸면 에이전트 페이즈(2~6)가 초기화됩니다. 계속할까요?",
        )
      ) {
        return;
      }
      updates.agentSubType = agentSubType;
      updates.phases = createAgentProjectPhaseData(agentSubType) as Project["phases"];
    }

    updateProject.mutate(updates, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success("프로젝트 정보가 수정되었습니다");
      },
      onError: () => {
        toast.error("수정에 실패했습니다");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로젝트 정보 변경</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">프로젝트 이름</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>프로젝트 유형</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setType(pt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors sm:p-4",
                    type === pt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50",
                  )}
                >
                  {pt.icon}
                  <span className="text-sm font-medium">{pt.label}</span>
                  <span className="text-center text-xs text-muted-foreground">
                    {pt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {type === "agent" && (
            <div className="space-y-2">
              <Label>에이전트 하위 유형</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {AGENT_SUB_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAgentSubType(opt.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors",
                      agentSubType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || updateProject.isPending}
          >
            {updateProject.isPending ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
