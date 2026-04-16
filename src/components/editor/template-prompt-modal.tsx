"use client";

import { Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/services/store/editor-store";
import { getTemplates } from "@/lib/templates";
import { AiProviderLinks } from "./ai-provider-links";

export function TemplatePromptModal() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const projectType = useEditorStore((s) => s.projectType);
  const agentSubType = useEditorStore((s) => s.agentSubType);
  const templates = getTemplates({
    projectType,
    agentSubType,
    phase: currentPhase,
  });

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    toast.success("프롬프트가 클립보드에 복사되었습니다");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="size-4" />
          AI 템플릿
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[min(96vw,72rem)] md:w-[min(96vw,80rem)] max-w-5xl flex-col overflow-hidden p-0">
        <DialogHeader className="gap-2 border-b px-6 py-5">
          <DialogTitle className="text-xl">AI 템플릿 프롬프트</DialogTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            각 템플릿은 few-shot 예시가 포함된 완결형 프롬프트입니다. 펼쳐서
            그대로 복사한 뒤 AI에 붙여넣으세요.
          </p>
          <AiProviderLinks />
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4 px-6 py-5">
            <Accordion type="multiple" className="w-full space-y-4">
              {templates.map((t) => (
                <AccordionItem
                  key={t.id}
                  value={t.id}
                  className="overflow-hidden rounded-2xl border bg-card"
                >
                  <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
                    <div className="space-y-1 pr-4">
                      <p className="text-sm font-semibold md:text-base">
                        {t.name}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-5 pb-5">
                    <div className="overflow-hidden rounded-xl border bg-muted/35">
                      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          Prompt
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPrompt(t.promptTemplate)}
                          className="gap-1.5"
                        >
                          <Copy className="size-3.5" />
                          프롬프트 복사
                        </Button>
                      </div>
                      <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap wrap-break-word px-4 py-4 font-mono text-sm leading-7 text-foreground md:text-[15px]">
                        {t.promptTemplate}
                      </pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>

        <p className="border-t px-6 py-4 text-sm leading-6 text-muted-foreground">
          AI에서 받은 JSON을 복사한 뒤, 오른쪽 폼의 아무 입력 필드에
          붙여넣으면 자동으로 적용됩니다.
        </p>
      </DialogContent>
    </Dialog>
  );
}
