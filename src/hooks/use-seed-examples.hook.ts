"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { seedDemoProjectsOnce } from "@/lib/seeds";
import type { Workspace } from "@/types/phases";

interface UseSeedExamplesInput {
  workspace: Workspace | undefined;
  /** 프로젝트 목록 쿼리 로딩 상태 — true면 시드 판단 보류 */
  isLoadingProjects: boolean;
  /** 현재 프로젝트 개수 (로딩 끝난 뒤 신뢰) */
  projectCount: number;
}

/**
 * 새 사용자 첫 방문 시 예제 프로젝트를 자동 시드한다.
 * - 워크스페이스 hasSeededExamples=false
 * - 프로젝트 수 0
 * 두 조건 모두일 때만 1회 실행. React StrictMode 이중 호출 방지용 ref 가드.
 */
export function useSeedExamples({
  workspace,
  isLoadingProjects,
  projectCount,
}: UseSeedExamplesInput): void {
  const queryClient = useQueryClient();
  const didAttemptRef = useRef(false);

  useEffect(() => {
    if (didAttemptRef.current) return;
    if (!workspace) return;
    if (workspace.hasSeededExamples) return;
    if (isLoadingProjects) return;
    if (projectCount > 0) return;

    didAttemptRef.current = true;
    seedDemoProjectsOnce(workspace.id)
      .then((count) => {
        if (count > 0) {
          queryClient.invalidateQueries({
            queryKey: ["projects", workspace.id],
          });
          queryClient.invalidateQueries({ queryKey: ["workspace", workspace.id] });
        }
      })
      .catch((err) => {
        console.error("[seed examples] failed", err);
      });
  }, [workspace, isLoadingProjects, projectCount, queryClient]);
}
