"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, ensureDefaultWorkspace, DEFAULT_WORKSPACE_ID } from "@/lib/db";
import {
  createAgentProjectPhaseData,
  createCliProjectPhaseData,
  createDefaultPhaseData,
} from "@/lib/schemas/phase-data";
import { buildOnboardingBoard } from "@/lib/idea-note/onboarding";
import type { AgentSubType, CliSubType, Project, ProjectType } from "@/types/phases";

// ─── Query Keys ───

const projectKeys = {
  all: ["projects"] as const,
  list: (workspaceId: string) => ["projects", workspaceId] as const,
  detail: (projectId: string) => ["project", projectId] as const,
};

// ─── Queries ───

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace", DEFAULT_WORKSPACE_ID],
    queryFn: ensureDefaultWorkspace,
  });
}

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: async () => {
      const projects = await db.projects
        .where("workspaceId")
        .equals(workspaceId)
        .toArray();
      return projects.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    enabled: !!workspaceId,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => db.projects.get(projectId),
    enabled: !!projectId,
  });
}

// ─── Mutations ───

interface CreateProjectInput {
  workspaceId: string;
  name: string;
  type: ProjectType;
  agentSubType?: AgentSubType;
  cliSubType?: CliSubType;
  initialPhases?: Project["phases"];
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const now = Date.now();
      if (input.type === "agent" && !input.agentSubType) {
        throw new Error("agent 프로젝트에는 agentSubType이 필요합니다");
      }
      if (input.type === "cli" && !input.cliSubType) {
        throw new Error("cli 프로젝트에는 cliSubType이 필요합니다");
      }
      const phases =
        input.initialPhases ??
        (input.type === "agent"
          ? createAgentProjectPhaseData(input.agentSubType!)
          : input.type === "cli"
            ? createCliProjectPhaseData(input.cliSubType!)
            : createDefaultPhaseData());

      const projectId = crypto.randomUUID();
      const { board: rootBoard, assets } = await buildOnboardingBoard(
        projectId,
        input.name,
      );

      const project: Project = {
        id: projectId,
        workspaceId: input.workspaceId,
        name: input.name,
        type: input.type,
        agentSubType:
          input.type === "agent" ? input.agentSubType : undefined,
        cliSubType: input.type === "cli" ? input.cliSubType : undefined,
        ideaNoteRootBoardId: rootBoard.id,
        currentPhase: 0,
        phases: phases as Project["phases"],
        createdAt: now,
        updatedAt: now,
      };

      await db.transaction(
        "rw",
        db.projects,
        db.ideaBoards,
        db.ideaAssets,
        async () => {
          await db.projects.add(project);
          await db.ideaBoards.add(rootBoard);
          if (assets.length) await db.ideaAssets.bulkAdd(assets);
        },
      );

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.list(project.workspaceId),
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Project> & { id: string }) => {
      await db.projects.update(id, { ...updates, updatedAt: Date.now() });
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const project = await db.projects.get(id);

      await db.transaction(
        "rw",
        db.projects,
        db.ideaBoards,
        db.ideaAssets,
        async () => {
          await db.projects.delete(id);
          await db.ideaBoards.where("projectId").equals(id).delete();
          await db.ideaAssets.where("projectId").equals(id).delete();
        },
      );

      return project?.workspaceId ?? DEFAULT_WORKSPACE_ID;
    },
    onSuccess: (workspaceId) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceId),
      });
    },
  });
}
