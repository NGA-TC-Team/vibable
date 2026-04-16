"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseShareUrl, type ParsedShare } from "@/hooks/use-share.hook";
import { useCreateProject } from "@/hooks/use-project.hook";
import { DEFAULT_WORKSPACE_ID } from "@/lib/db";
import { useEditorStore } from "@/services/store/editor-store";
import { EditorLayout } from "@/components/editor/editor-layout";
import { toast } from "sonner";
import type { PhaseData, Project } from "@/types/phases";
import { phaseDataSchema } from "@/lib/schemas/phase-data";

type ViewMode = "choose" | "readonly";

export function SharedClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createProject = useCreateProject();
  const [parsed, setParsed] = useState<ParsedShare | null | undefined>(
    undefined,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("choose");

  const setPhaseData = useEditorStore((s) => s.setPhaseData);
  const setReadOnly = useEditorStore((s) => s.setReadOnly);
  const setPhase = useEditorStore((s) => s.setPhase);
  const setProjectType = useEditorStore((s) => s.setProjectType);
  const setAgentSubType = useEditorStore((s) => s.setAgentSubType);
  const reset = useEditorStore((s) => s.reset);

  useEffect(() => {
    const result = parseShareUrl(searchParams);
    setParsed(result);
  }, [searchParams]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (parsed === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (parsed === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">유효하지 않은 공유 링크입니다</p>
        <p className="text-sm text-muted-foreground">
          링크가 올바른지 확인해 주세요. 링크가 열리지 않으면 JSON 파일을
          요청하세요.
        </p>
        <Button variant="outline" asChild>
          <Link href="/workspace">
            <ArrowLeft className="size-4" />
            워크스페이스로 이동
          </Link>
        </Button>
      </div>
    );
  }

  const handleClone = () => {
    createProject.mutate(
      {
        workspaceId: DEFAULT_WORKSPACE_ID,
        name: `${parsed.name} (복제)`,
        type: parsed.type,
        ...(parsed.type === "agent" && parsed.agentSubType
          ? { agentSubType: parsed.agentSubType }
          : {}),
      },
      {
        onSuccess: async (project) => {
          const { db } = await import("@/lib/db");
          await db.projects.update(project.id, {
            phases: parsed.phases,
          });
          toast.success("프로젝트가 복제되었습니다");
          router.push(`/workspace/${project.id}`);
        },
      },
    );
  };

  const handleReadOnly = () => {
    setPhaseData(phaseDataSchema.parse(parsed.phases) as PhaseData);
    setProjectType(parsed.type);
    setAgentSubType(parsed.agentSubType ?? null);
    setReadOnly(true);
    setPhase(0);
    setViewMode("readonly");
  };

  if (viewMode === "readonly") {
    const fakeProject: Project = {
      id: "shared-readonly",
      workspaceId: "",
      name: parsed.name,
      type: parsed.type,
      ...(parsed.type === "agent" && parsed.agentSubType
        ? { agentSubType: parsed.agentSubType }
        : {}),
      currentPhase: 0,
      phases: parsed.phases,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return (
      <EditorLayout
        project={fakeProject}
        onPhaseChange={(phase) => setPhase(phase)}
      />
    );
  }

  const typeLabel = {
    web: "웹",
    mobile: "모바일",
    cli: "CLI",
    agent: parsed.agentSubType === "openclaw" ? "OpenClaw" : "AI 에이전트",
  }[parsed.type];

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {parsed.name}
            <Badge variant="secondary">{typeLabel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            공유된 프로젝트입니다. 어떻게 하시겠습니까?
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleClone} disabled={createProject.isPending}>
              <Copy className="size-4" />
              내 워크스페이스에 복제
            </Button>
            <Button variant="outline" onClick={handleReadOnly}>
              <Eye className="size-4" />
              읽기 전용으로 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
