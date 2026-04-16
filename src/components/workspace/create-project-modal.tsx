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
import type { ProjectType } from "@/types/phases";

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
  const router = useRouter();
  const createProject = useCreateProject();

  const handleCreate = () => {
    if (!name.trim()) return;

    createProject.mutate(
      { workspaceId, name: name.trim(), type },
      {
        onSuccess: (project) => {
          setOpen(false);
          setName("");
          setType("web");
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
            <div className="grid grid-cols-3 gap-3">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setType(pt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                    type === pt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50",
                  )}
                >
                  {pt.icon}
                  <span className="text-sm font-medium">{pt.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {pt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
