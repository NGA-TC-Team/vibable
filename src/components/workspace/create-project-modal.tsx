"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROJECT_TYPES } from "@/lib/project-types";
import { useCreateProject } from "@/hooks/use-project.hook";
import type { AgentSubType, ProjectType } from "@/types/phases";

function sinePath(yCenter: number, amplitude: number, periods: number): string {
  const totalWidth = 1200;
  const steps = 400;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * totalWidth;
    const y = yCenter + amplitude * Math.sin((i / steps) * Math.PI * 2 * periods);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const COLOR_CYCLE = [
  "#38bdf8", // sky-400
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
  "#f472b6", // pink-400
  "#60a5fa", // blue-400
  "#fb923c", // orange-400
  "#2dd4bf", // teal-400
  "#818cf8", // indigo-400
  "#38bdf8", // sky-400 (loop back)
];

const WATER_WAVES = [
  // 원경 (far) — 희미하고 얇게
  { yCenter: 28,  amp: 3, duration: 7.3, opacity: 0.10, sw: 0.7, delay: 0.0, colorDuration: 14, colorDelay: 0.0 },
  { yCenter: 46,  amp: 4, duration: 5.7, opacity: 0.13, sw: 0.9, delay: 1.1, colorDuration: 17, colorDelay: 1.8 },
  // 중경 (mid) — 중간 선명도
  { yCenter: 72,  amp: 6, duration: 3.8, opacity: 0.22, sw: 1.2, delay: 0.4, colorDuration: 11, colorDelay: 3.5 },
  { yCenter: 90,  amp: 7, duration: 6.1, opacity: 0.25, sw: 1.3, delay: 1.8, colorDuration: 15, colorDelay: 0.9 },
  { yCenter: 108, amp: 7, duration: 4.6, opacity: 0.25, sw: 1.3, delay: 0.9, colorDuration: 12, colorDelay: 2.6 },
  // 전경 (near) — 선명하고 굵게
  { yCenter: 128, amp: 8, duration: 2.9, opacity: 0.32, sw: 1.7, delay: 0.3, colorDuration: 10, colorDelay: 4.2 },
  { yCenter: 144, amp: 9, duration: 8.5, opacity: 0.35, sw: 1.9, delay: 1.5, colorDuration: 13, colorDelay: 1.4 },
  { yCenter: 160, amp: 8, duration: 3.3, opacity: 0.38, sw: 2.1, delay: 2.2, colorDuration: 16, colorDelay: 5.1 },
];

const WAVE_PATHS = WATER_WAVES.map((w) => sinePath(w.yCenter, w.amp, 3));

function WaterSurface() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {WATER_WAVES.map((wave, i) => (
        <motion.div
          key={i}
          className="absolute left-0 top-0 h-full"
          style={{ width: "300%" }}
          initial={{ x: "0%" }}
          animate={{ x: "-33.33%" }}
          transition={{
            duration: wave.duration,
            ease: "linear",
            repeat: Infinity,
            delay: wave.delay,
          }}
        >
          <svg viewBox="0 0 1200 180" width="100%" height="100%" preserveAspectRatio="none">
            <motion.path
              d={WAVE_PATHS[i]}
              fill="none"
              strokeWidth={wave.sw}
              opacity={wave.opacity}
              animate={{ stroke: COLOR_CYCLE }}
              transition={{
                duration: wave.colorDuration,
                ease: "linear",
                repeat: Infinity,
                delay: wave.colorDelay,
              }}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

const AGENT_SUB_OPTIONS: {
  value: AgentSubType;
  label: string;
  desc: string;
}[] = [
  {
    value: "claude-subagent",
    label: "Claude Subagent",
    desc: ".claude/agents YAML + 프롬프트",
  },
  {
    value: "openclaw",
    label: "OpenClaw",
    desc: "워크스페이스 마크다운 + 설정",
  },
];

interface CreateProjectModalProps {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateProjectModal({
  workspaceId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CreateProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("web");
  const [agentSubType, setAgentSubType] = useState<AgentSubType>("claude-subagent");
  const router = useRouter();
  const createProject = useCreateProject();

  const handleCreate = () => {
    if (!name.trim()) return;
    if (type === "agent" && !agentSubType) return;

    createProject.mutate(
      {
        workspaceId,
        name: name.trim(),
        type,
        agentSubType: type === "agent" ? agentSubType : undefined,
      },
      {
        onSuccess: (project) => {
          setOpen(false);
          setName("");
          setType("web");
          setAgentSubType("claude-subagent");
          router.push(`/workspace/${project.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        trigger
      ) : (
        <DialogTrigger asChild>
          <button className="relative flex h-full min-h-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-4xl border-2 border-dashed border-muted-foreground/25 bg-background transition-colors hover:border-muted-foreground/50 hover:bg-muted/30">
            <WaterSurface />
            <div className="relative z-10 flex flex-col items-center gap-2 text-foreground">
              <Plus className="size-8" />
              <span className="text-sm font-medium">새 프로젝트</span>
            </div>
          </button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트 이름</Label>
            <Input
              id="project-name"
              placeholder="예: 차세대 커머스 앱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>프로젝트 유형</Label>
            <div className="grid grid-cols-2 gap-3">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setType(pt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors sm:p-4",
                    type === pt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50",
                  )}
                >
                  {pt.icon}
                  <span className="text-sm font-medium">{pt.label}</span>
                  <span className="text-center text-xs text-muted-foreground">
                    {pt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {type === "agent" && (
            <div className="space-y-2">
              <Label>에이전트 하위 유형</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {AGENT_SUB_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAgentSubType(opt.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors",
                      agentSubType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createProject.isPending}
          >
            {createProject.isPending ? "생성 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
