"use client";

import { useRouter } from "next/navigation";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/hooks/use-project.hook";
import { getExampleProjectData } from "@/lib/example-project";
import { DEFAULT_WORKSPACE_ID } from "@/lib/db";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  const router = useRouter();
  const createProject = useCreateProject();

  const handleExampleProject = () => {
    const { name, type, phases } = getExampleProjectData();
    createProject.mutate(
      {
        workspaceId: DEFAULT_WORKSPACE_ID,
        name,
        type,
        initialPhases: phases,
      },
      {
        onSuccess: (project) => {
          router.push(`/workspace/${project.id}`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="rounded-full bg-muted p-4">
        <FileText className="size-10 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">
        첫 프로젝트를 만들어 보세요
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        기획서를 단계별로 작성하고, JSON·PDF로 내보낼 수 있습니다.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onCreateNew}>
          새 프로젝트 만들기
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleExampleProject}
          disabled={createProject.isPending}
        >
          <Sparkles className="size-4" />
          {createProject.isPending
            ? "생성 중..."
            : "예시 프로젝트 살펴보기"}
        </Button>
      </div>
    </div>
  );
}
