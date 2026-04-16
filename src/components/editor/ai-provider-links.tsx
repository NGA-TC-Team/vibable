"use client";

import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const providers = [
  { name: "ChatGPT", icon: "/ai-provider-logo/openai.svg", url: "https://chatgpt.com" },
  { name: "Claude", icon: "/ai-provider-logo/claude.svg", url: "https://claude.ai/new" },
  { name: "Gemini", icon: "/ai-provider-logo/gemini.svg", url: "https://gemini.google.com" },
  { name: "Grok", icon: "/ai-provider-logo/grok.svg", url: "https://x.com/i/grok" },
] as const;

export function AiProviderLinks() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {providers.map((p) => (
          <Tooltip key={p.name}>
            <TooltipTrigger asChild>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full border bg-background transition-colors hover:bg-accent"
              >
                <Image src={p.icon} alt={p.name} width={18} height={18} />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{p.name}에서 열기</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
