"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROJECT_TYPES } from "@/lib/project-types";
import { useCreateProject } from "@/hooks/use-project.hook";
import type { AgentSubType, ProjectType } from "@/types/phases";

const AGENT_SUB_OPTIONS: {
  value: AgentSubType;
  label: string;
  desc: string;
}[] = [
  {
    value: "claude-subagent",
    label: "Claude Subagent",
    desc: ".claude/agents YAML + 프롬프트",
  },
  {
    value: "openclaw",
    label: "OpenClaw",
    desc: "워크스페이스 마크다운 + 설정",
  },
];

interface CreateProjectModalProps {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateProjectModal({
  workspaceId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CreateProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("web");
  const [agentSubType, setAgentSubType] = useState<AgentSubType>("claude-subagent");
  const router = useRouter();
  const createProject = useCreateProject();

  const handleCreate = () => {
    if (!name.trim()) return;
    if (type === "agent" && !agentSubType) return;

    createProject.mutate(
      {
        workspaceId,
        name: name.trim(),
        type,
        agentSubType: type === "agent" ? agentSubType : undefined,
      },
      {
        onSuccess: (project) => {
          setOpen(false);
          setName("");
          setType("web");
          setAgentSubType("claude-subagent");
          router.push(`/workspace/${project.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        trigger
      ) : (
        <DialogTrigger asChild>
          <button className="flex h-full min-h-[180px] cursor-pointer items-center justify-center rounded-4xl border-2 border-dashed border-muted-foreground/25 bg-background transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Plus className="size-8" />
              <span className="text-sm font-medium">새 프로젝트</span>
            </div>
          </button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트 이름</Label>
            <Input
              id="project-name"
              placeholder="예: 차세대 커머스 앱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>프로젝트 유형</Label>
            <div className="grid grid-cols-2 gap-3">
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
            onClick={handleCreate}
            disabled={!name.trim() || createProject.isPending}
          >
            {createProject.isPending ? "생성 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
