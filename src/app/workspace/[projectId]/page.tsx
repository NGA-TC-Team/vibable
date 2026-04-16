import { EditorClient } from "./_components/editor-client";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <EditorClient projectId={projectId} />;
}
