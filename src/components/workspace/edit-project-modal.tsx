"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import type { Project, ProjectType } from "@/types/phases";

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
  const updateProject = useUpdateProject();

  useEffect(() => {
    if (open) {
      setName(project.name);
      setType(project.type);
    }
  }, [open, project.name, project.type]);

  const handleSave = () => {
    if (!name.trim()) return;

    updateProject.mutate(
      { id: project.id, name: name.trim(), type },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("프로젝트 정보가 수정되었습니다");
        },
        onError: () => {
          toast.error("수정에 실패했습니다");
        },
      },
    );
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
