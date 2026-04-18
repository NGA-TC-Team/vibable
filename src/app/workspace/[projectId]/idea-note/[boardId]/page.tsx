import { IdeaNoteClient } from "./_components/idea-note-client";

export default async function IdeaNoteBoardPage({
  params,
}: {
  params: Promise<{ projectId: string; boardId: string }>;
}) {
  const { projectId, boardId } = await params;
  return <IdeaNoteClient projectId={projectId} boardId={boardId} />;
}
