import { db } from "@/lib/db";
import type { SeededProject } from "./helpers";
import { generateWebExample } from "./web-example";
import { generateMobileExample } from "./mobile-example";
import { generateCliHumanExample } from "./cli-human-example";
import { generateCliAgentExample } from "./cli-agent-example";
import { generateCliHybridExample } from "./cli-hybrid-example";
import { generateAgentClaudeExample } from "./agent-claude-example";
import { generateAgentOpenclawExample } from "./agent-openclaw-example";

type Generator = (workspaceId: string) => SeededProject;

const GENERATORS: Generator[] = [
  generateWebExample,
  generateMobileExample,
  generateCliHumanExample,
  generateCliAgentExample,
  generateCliHybridExample,
  generateAgentClaudeExample,
  generateAgentOpenclawExample,
];

/**
 * 기본 워크스페이스에 예제 프로젝트 7종을 일괄 시드한다.
 * - 이미 hasSeededExamples=true 인 워크스페이스에는 아무 작업도 하지 않는다.
 * - 프로젝트가 하나라도 있으면 시드하지 않는다 (기존 사용자 보호).
 * 반환: 실제로 삽입한 프로젝트 수
 */
export async function seedDemoProjectsOnce(
  workspaceId: string,
): Promise<number> {
  const workspace = await db.workspaces.get(workspaceId);
  if (!workspace) return 0;
  if (workspace.hasSeededExamples) return 0;

  const existingCount = await db.projects
    .where("workspaceId")
    .equals(workspaceId)
    .count();
  if (existingCount > 0) {
    await db.workspaces.update(workspaceId, { hasSeededExamples: true });
    return 0;
  }

  const seeded = GENERATORS.map((gen) => gen(workspaceId));

  await db.transaction(
    "rw",
    db.workspaces,
    db.projects,
    db.ideaBoards,
    db.ideaAssets,
    async () => {
      await db.projects.bulkAdd(seeded.map((s) => s.project));
      await db.ideaBoards.bulkAdd(seeded.map((s) => s.board));
      const allAssets = seeded.flatMap((s) => s.assets);
      if (allAssets.length > 0) {
        await db.ideaAssets.bulkAdd(allAssets);
      }
      await db.workspaces.update(workspaceId, {
        hasSeededExamples: true,
        updatedAt: Date.now(),
      });
    },
  );

  return seeded.length;
}
