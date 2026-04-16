"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Globe,
  Smartphone,
  Terminal,
  Trash2,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProjectModal } from "@/components/workspace/edit-project-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import type { Project, ProjectType } from "@/types/phases";
import { PHASE_KEYS } from "@/types/phases";

const typeConfig: Record<
  ProjectType,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }
> = {
  web: { label: "웹", icon: <Globe className="size-3" />, variant: "default" },
  mobile: {
    label: "모바일",
    icon: <Smartphone className="size-3" />,
    variant: "secondary",
  },
  cli: {
    label: "CLI",
    icon: <Terminal className="size-3" />,
    variant: "outline",
  },
};

function getCompletedPhaseCount(project: Project): number {
  const { phases } = project;
  let count = 0;

  if (phases.overview.projectName) count++;
  if (phases.userScenario.personas.length > 0) count++;
  if (phases.requirements.functional.length > 0) count++;
  if (phases.infoArchitecture.sitemap.length > 0) count++;
  if (phases.screenDesign.pages.length > 0) count++;
  if (phases.dataModel.entities.length > 0) count++;
  if (phases.designSystem.visualTheme.mood) count++;

  return count;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const cfg = typeConfig[project.type];
  const completed = getCompletedPhaseCount(project);
  const total = PHASE_KEYS.length;
  const progressPct = Math.round((completed / total) * 100);

  return (
    <>
      <EditProjectModal
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <Link href={`/workspace/${project.id}`} className="block">
        <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    <span>정보 변경</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="size-4 text-destructive" />
                        <span className="text-destructive">삭제</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{project.name}&quot;을(를) 삭제하시겠습니까? 이
                          작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(project.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={cfg.variant}>
            {cfg.icon}
            {cfg.label}
          </Badge>
          <p className="text-xs text-muted-foreground">
            생성일: {format(project.createdAt, "yyyy.MM.dd")}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completed}/{total} 페이즈
              </span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(project.updatedAt, {
              addSuffix: true,
              locale: ko,
            })}{" "}수정
          </p>
        </CardContent>
        </Card>
      </Link>
    </>
  );
}
