import type { Project } from "@/types/phases";
import type { IdeaNoteAsset, IdeaNoteBoard } from "@/types/idea-note";
import { createEmptyBoard } from "@/lib/idea-note/defaults";
import type { PhaseDataSchemaType } from "@/lib/schemas/phase-data";

export function uid(prefix = "id"): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export interface SeededProject {
  project: Project;
  board: IdeaNoteBoard;
  assets: IdeaNoteAsset[];
}

interface BuildProjectInput {
  workspaceId: string;
  name: string;
  type: Project["type"];
  agentSubType?: Project["agentSubType"];
  cliSubType?: Project["cliSubType"];
  phases: PhaseDataSchemaType;
  currentPhase?: number;
  /** 생성 시각 오프셋(ms) — 목록 정렬용 */
  createdAtOffset?: number;
}

export function buildSeededProject(input: BuildProjectInput): SeededProject {
  const now = Date.now() - (input.createdAtOffset ?? 0);
  const projectId = crypto.randomUUID();
  const board = createEmptyBoard(projectId, `${input.name} — Ideas`);

  const project: Project = {
    id: projectId,
    workspaceId: input.workspaceId,
    name: input.name,
    type: input.type,
    agentSubType: input.type === "agent" ? input.agentSubType : undefined,
    cliSubType: input.type === "cli" ? input.cliSubType : undefined,
    ideaNoteRootBoardId: board.id,
    currentPhase: input.currentPhase ?? 6,
    phases: input.phases as Project["phases"],
    createdAt: now,
    updatedAt: now,
  };

  return { project, board, assets: [] };
}
