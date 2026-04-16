"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, ensureDefaultWorkspace, DEFAULT_WORKSPACE_ID } from "@/lib/db";
import {
  createAgentProjectPhaseData,
  createDefaultPhaseData,
} from "@/lib/schemas/phase-data";
import type { AgentSubType, Project, ProjectType } from "@/types/phases";

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
      const phases =
        input.initialPhases ??
        (input.type === "agent"
          ? createAgentProjectPhaseData(input.agentSubType!)
          : createDefaultPhaseData());
      const project: Project = {
        id: crypto.randomUUID(),
        workspaceId: input.workspaceId,
        name: input.name,
        type: input.type,
        agentSubType:
          input.type === "agent" ? input.agentSubType : undefined,
        currentPhase: 0,
        phases: phases as Project["phases"],
        createdAt: now,
        updatedAt: now,
      };
      await db.projects.add(project);
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
      await db.projects.delete(id);
      return project?.workspaceId ?? DEFAULT_WORKSPACE_ID;
    },
    onSuccess: (workspaceId) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceId),
      });
    },
  });
}
