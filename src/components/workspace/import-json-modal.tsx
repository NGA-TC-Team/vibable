"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PROJECT_TYPES } from "@/lib/project-types";
import { useCreateProject } from "@/hooks/use-project.hook";
import { phaseDataSchema } from "@/lib/schemas/phase-data";
import { SCHEMA_VERSION } from "@/lib/constants";
import type { AgentSubType, PhaseData, ProjectType } from "@/types/phases";

interface ImportJsonModalProps {
  workspaceId: string;
}

interface ParsedResult {
  phases: PhaseData;
  projectType?: ProjectType;
  agentSubType?: AgentSubType;
  schemaVersion?: number;
}

function tryParseImportJson(raw: string): ParsedResult | string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return "유효하지 않은 JSON 형식입니다.";
  }

  if (typeof parsed !== "object" || parsed === null) {
    return "유효하지 않은 기획서 JSON 파일입니다. vibable에서 내보낸 JSON 파일을 사용해 주세요.";
  }

  const obj = parsed as Record<string, unknown>;
  const meta = obj._meta as Record<string, unknown> | undefined;

  const { _meta: _, ...phaseFields } = obj;
  const result = phaseDataSchema.safeParse(phaseFields);

  if (!result.success) {
    return "유효하지 않은 기획서 JSON 파일입니다. vibable에서 내보낸 JSON 파일을 사용해 주세요.";
  }

  const projectType = meta?.projectType as ProjectType | undefined;
  const schemaVersion = meta?.schemaVersion as number | undefined;
  const agentSubTypeRaw = meta?.agentSubType as string | undefined;
  const agentSubType =
    projectType === "agent" &&
    agentSubTypeRaw &&
    ["claude-subagent", "openclaw"].includes(agentSubTypeRaw)
      ? (agentSubTypeRaw as AgentSubType)
      : undefined;

  return {
    phases: result.data as PhaseData,
    projectType:
      projectType && ["web", "mobile", "cli", "agent"].includes(projectType)
        ? projectType
        : undefined,
    ...(agentSubType ? { agentSubType } : {}),
    schemaVersion,
  };
}

export function ImportJsonModal({ workspaceId }: ImportJsonModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("web");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [versionWarning, setVersionWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const createProject = useCreateProject();

  const resetState = () => {
    setName("");
    setType("web");
    setJsonText("");
    setError("");
    setParsedResult(null);
    setShowTypeSelect(false);
    setVersionWarning(false);
  };

  const processJson = (raw: string) => {
    setError("");
    setParsedResult(null);
    setShowTypeSelect(false);
    setVersionWarning(false);

    const result = tryParseImportJson(raw);
    if (typeof result === "string") {
      setError(result);
      return;
    }

    setParsedResult(result);

    if (result.projectType) {
      setType(result.projectType);
      setShowTypeSelect(false);
    } else {
      setShowTypeSelect(true);
    }

    if (
      result.schemaVersion !== undefined &&
      result.schemaVersion !== SCHEMA_VERSION
    ) {
      setVersionWarning(true);
    }

    if (!name) {
      setName("가져온 프로젝트");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setJsonText(text);
      processJson(text);
    };
    reader.readAsText(file);

    e.target.value = "";
  };

  const handleTextProcess = () => {
    if (!jsonText.trim()) return;
    processJson(jsonText);
  };

  const handleImport = () => {
    if (!parsedResult || !name.trim()) return;

    createProject.mutate(
      {
        workspaceId,
        name: name.trim(),
        type,
        ...(type === "agent"
          ? { agentSubType: parsedResult.agentSubType ?? "claude-subagent" }
          : {}),
        initialPhases: parsedResult.phases,
      },
      {
        onSuccess: (project) => {
          setOpen(false);
          resetState();
          router.push(`/workspace/${project.id}`);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <button className="flex h-full min-h-[180px] cursor-pointer items-center justify-center rounded-4xl border-2 border-dashed border-muted-foreground/25 bg-background transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileUp className="size-8" />
            <span className="text-sm font-medium">JSON 가져오기</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>JSON 가져오기</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">
              파일 선택
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1">
              텍스트 붙여넣기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              .json 파일 선택
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-3 pt-2">
            <Textarea
              placeholder="JSON을 붙여넣으세요..."
              className="min-h-[120px] font-mono text-xs"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleTextProcess}
              disabled={!jsonText.trim()}
            >
              검증하기
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {versionWarning && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="size-4 shrink-0" />
            <span>스키마 버전이 다릅니다. 일부 데이터가 누락될 수 있습니다.</span>
          </div>
        )}

        {parsedResult && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-name">프로젝트 이름</Label>
              <Input
                id="import-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImport()}
                autoFocus
              />
            </div>

            {showTypeSelect && (
              <div className="space-y-2">
                <Label>프로젝트 유형</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => setType(pt.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors",
                        type === pt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50",
                      )}
                    >
                      {pt.icon}
                      <span className="text-sm font-medium">{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={!parsedResult || !name.trim() || createProject.isPending}
          >
            {createProject.isPending ? "가져오는 중..." : "가져오기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
