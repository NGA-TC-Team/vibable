import { IdeaNoteRedirect } from "./_components/idea-note-redirect";

export default async function IdeaNoteRootPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <IdeaNoteRedirect projectId={projectId} />;
}
