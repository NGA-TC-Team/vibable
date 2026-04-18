"use client";

import { useState } from "react";
import { Search, Plus, FileUp, Globe, Smartphone, Terminal, Bot } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { VibableLogo } from "@/components/vibable-logo";
import { ModeToggle } from "@/components/mode-toggle";
import { ProjectCard } from "@/components/workspace/project-card";
import { CreateProjectModal } from "@/components/workspace/create-project-modal";
import { ImportJsonModal } from "@/components/workspace/import-json-modal";
import { EmptyState } from "@/components/workspace/empty-state";
import { DataManagementMenu } from "@/components/workspace/data-management-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkspace,
  useProjects,
  useDeleteProject,
} from "@/hooks/use-project.hook";
import { useSeedExamples } from "@/hooks/use-seed-examples.hook";
import { DEFAULT_WORKSPACE_ID } from "@/lib/db";
import { toast } from "sonner";
import type { ProjectType } from "@/types/phases";
import { cn } from "@/lib/utils";

const TYPE_FILTERS: { type: ProjectType; label: string; icon: React.ReactNode }[] = [
  { type: "web",    label: "웹",      icon: <Globe       className="size-3.5" /> },
  { type: "mobile", label: "모바일",  icon: <Smartphone  className="size-3.5" /> },
  { type: "cli",    label: "CLI",     icon: <Terminal    className="size-3.5" /> },
  { type: "agent",  label: "에이전트", icon: <Bot        className="size-3.5" /> },
];

export function WorkspaceClient() {
  const { data: workspace } = useWorkspace();
  const { data: projects, isLoading } = useProjects(DEFAULT_WORKSPACE_ID);
  const deleteProject = useDeleteProject();

  useSeedExamples({
    workspace,
    isLoadingProjects: isLoading,
    projectCount: projects?.length ?? 0,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<ProjectType>>(new Set());

  const toggleType = (type: ProjectType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    deleteProject.mutate(id, {
      onSuccess: () => toast.success("프로젝트가 삭제되었습니다"),
      onError: () => toast.error("삭제에 실패했습니다"),
    });
  };

  const isEmpty = !isLoading && projects?.length === 0;

  const filtered = projects?.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTypes.size === 0 || activeTypes.has(p.type);
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <VibableLogo width={36} height={36} />
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
          <div className="flex items-center gap-2">
            <DataManagementMenu />
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-4xl" />
            ))}
          </div>
        ) : isEmpty ? (
          <>
            <EmptyState onCreateNew={() => setCreateOpen(true)} />
            <CreateProjectModal
              workspaceId={DEFAULT_WORKSPACE_ID}
              open={createOpen}
              onOpenChange={setCreateOpen}
              trigger={null}
            />
          </>
        ) : (
          <>
            {/* 툴바 */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {/* 검색창 */}
              <div className="relative min-w-40 flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="프로젝트 이름 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 타입 필터 토글 */}
              <div className="flex items-center gap-1">
                {TYPE_FILTERS.map(({ type, label, icon }) => {
                  const active = activeTypes.has(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        "flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                      )}
                    >
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 구분선 */}
              <div className="hidden h-6 w-px bg-border sm:block" />

              {/* 액션 버튼 */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="shrink-0 gap-1.5"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">새 프로젝트</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportOpen(true)}
                className="shrink-0 gap-1.5"
              >
                <FileUp className="size-4" />
                <span className="hidden sm:inline">JSON 가져오기</span>
              </Button>
            </div>

            {/* 카드 그리드 */}
            {filtered?.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                {searchQuery
                  ? `"${searchQuery}"와 일치하는 프로젝트가 없습니다.`
                  : "선택한 유형의 프로젝트가 없습니다."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered?.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -6 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      <ProjectCard
                        project={project}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <CreateProjectModal workspaceId={DEFAULT_WORKSPACE_ID} />
                <ImportJsonModal workspaceId={DEFAULT_WORKSPACE_ID} />
              </div>
            )}

            {/* 제어 모달 (툴바 버튼용) */}
            <CreateProjectModal
              workspaceId={DEFAULT_WORKSPACE_ID}
              open={createOpen}
              onOpenChange={setCreateOpen}
              trigger={null}
            />
            <ImportJsonModal
              workspaceId={DEFAULT_WORKSPACE_ID}
              open={importOpen}
              onOpenChange={setImportOpen}
              trigger={null}
            />
          </>
        )}
      </main>
    </div>
  );
}
