"use client";

import { VibableLogo } from "@/components/vibable-logo";
import { ModeToggle } from "@/components/mode-toggle";
import { ProjectCard } from "@/components/workspace/project-card";
import { CreateProjectModal } from "@/components/workspace/create-project-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkspace,
  useProjects,
  useDeleteProject,
} from "@/hooks/use-project.hook";
import { DEFAULT_WORKSPACE_ID } from "@/lib/db";
import { toast } from "sonner";

export function WorkspaceClient() {
  const { data: workspace } = useWorkspace();
  const { data: projects, isLoading } = useProjects(DEFAULT_WORKSPACE_ID);
  const deleteProject = useDeleteProject();

  const handleDelete = (id: string) => {
    deleteProject.mutate(id, {
      onSuccess: () => toast.success("프로젝트가 삭제되었습니다"),
      onError: () => toast.error("삭제에 실패했습니다"),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <VibableLogo width={28} height={28} />
            <span className="shrink-0 text-lg font-semibold tracking-tight">
              Vibable
            </span>
            <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
              Powered By NGA
            </span>
            <span
              className="hidden min-w-0 truncate text-sm font-medium text-muted-foreground sm:inline"
              title={workspace?.name ?? undefined}
            >
              · {workspace?.name ?? "워크스페이스"}
            </span>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-4xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
            <CreateProjectModal workspaceId={DEFAULT_WORKSPACE_ID} />
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground">
              첫 프로젝트를 만들어 보세요
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              위의 + 버튼을 클릭하여 기획서 작성을 시작할 수 있습니다
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
