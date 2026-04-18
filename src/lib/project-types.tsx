import { Bot, Globe, Smartphone, Terminal } from "lucide-react";
import type { ProjectType } from "@/types/phases";

export interface ProjectTypeOption {
  value: ProjectType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    value: "web",
    label: "웹",
    desc: "웹 애플리케이션",
    icon: <Globe className="size-5" />,
  },
  {
    value: "mobile",
    label: "모바일",
    desc: "모바일 앱",
    icon: <Smartphone className="size-5" />,
  },
  {
    value: "cli",
    label: "CLI",
    desc: "인간·AI 에이전트 겸용",
    icon: <Terminal className="size-5" />,
  },
  {
    value: "agent",
    label: "AI 에이전트",
    desc: "Claude Subagent · OpenClaw",
    icon: <Bot className="size-5" />,
  },
];
