"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { SitemapNode, UserFlow, FlowStep } from "@/types/phases";

export function InfoArchitectureForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { data, patchData } = usePhaseData("infoArchitecture");
  if (!data) return null;

  const addSitemapNode = () => {
    const node: SitemapNode = {
      id: crypto.randomUUID(),
      label: "",
      path: "",
      children: [],
    };
    patchData({ sitemap: [...data.sitemap, node] });
  };

  const updateNode = (index: number, patch: Partial<SitemapNode>) => {
    const sitemap = [...data.sitemap];
    sitemap[index] = { ...sitemap[index], ...patch };
    patchData({ sitemap });
  };

  const addChildNode = (parentIndex: number) => {
    const sitemap = [...data.sitemap];
    const child: SitemapNode = {
      id: crypto.randomUUID(),
      label: "",
      path: "",
      children: [],
    };
    sitemap[parentIndex] = {
      ...sitemap[parentIndex],
      children: [...sitemap[parentIndex].children, child],
    };
    patchData({ sitemap });
  };

  const updateChildNode = (
    parentIndex: number,
    childIndex: number,
    patch: Partial<SitemapNode>,
  ) => {
    const sitemap = [...data.sitemap];
    const children = [...sitemap[parentIndex].children];
    children[childIndex] = { ...children[childIndex], ...patch };
    sitemap[parentIndex] = { ...sitemap[parentIndex], children };
    patchData({ sitemap });
  };

  const removeNode = (index: number) => {
    patchData({ sitemap: data.sitemap.filter((_, i) => i !== index) });
  };

  const removeChildNode = (parentIndex: number, childIndex: number) => {
    const sitemap = [...data.sitemap];
    sitemap[parentIndex] = {
      ...sitemap[parentIndex],
      children: sitemap[parentIndex].children.filter(
        (_, i) => i !== childIndex,
      ),
    };
    patchData({ sitemap });
  };

  const addFlow = () => {
    const flow: UserFlow = {
      id: crypto.randomUUID(),
      name: "",
      steps: [],
    };
    patchData({ userFlows: [...data.userFlows, flow] });
  };

  const updateFlow = (index: number, patch: Partial<UserFlow>) => {
    const flows = [...data.userFlows];
    flows[index] = { ...flows[index], ...patch };
    patchData({ userFlows: flows });
  };

  const removeFlow = (index: number) => {
    patchData({ userFlows: data.userFlows.filter((_, i) => i !== index) });
  };

  const addStep = (flowIndex: number) => {
    const flows = [...data.userFlows];
    const step: FlowStep = {
      id: crypto.randomUUID(),
      action: "",
      next: [],
    };
    flows[flowIndex] = {
      ...flows[flowIndex],
      steps: [...flows[flowIndex].steps, step],
    };
    patchData({ userFlows: flows });
  };

  const updateStep = (
    flowIndex: number,
    stepIndex: number,
    patch: Partial<FlowStep>,
  ) => {
    const flows = [...data.userFlows];
    const steps = [...flows[flowIndex].steps];
    steps[stepIndex] = { ...steps[stepIndex], ...patch };
    flows[flowIndex] = { ...flows[flowIndex], steps };
    patchData({ userFlows: flows });
  };

  const removeStep = (flowIndex: number, stepIndex: number) => {
    const flows = [...data.userFlows];
    flows[flowIndex] = {
      ...flows[flowIndex],
      steps: flows[flowIndex].steps.filter((_, i) => i !== stepIndex),
    };
    patchData({ userFlows: flows });
  };

  return (
    <div className="space-y-6">
      {/* Sitemap */}
      <section className="space-y-3">
        <SectionHeader title="사이트맵" tooltip={SECTION_TOOLTIPS["infoArchitecture.sitemap"]}>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addSitemapNode}>
              <Plus className="size-3.5" />
              노드 추가
            </Button>
          )}
        </SectionHeader>
        {data.sitemap.map((node, i) => (
          <div key={node.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="페이지 이름"
                value={node.label}
                onChange={(e) => updateNode(i, { label: e.target.value })}
                disabled={disabled}
              />
              <Input
                placeholder="경로 (예: /dashboard)"
                value={node.path ?? ""}
                onChange={(e) => updateNode(i, { path: e.target.value })}
                disabled={disabled}
                className="w-40"
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeNode(i)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <div className="ml-4 space-y-2">
              {node.children.map((child, ci) => (
                <div key={child.id} className="flex gap-2">
                  <Input
                    placeholder="하위 페이지"
                    value={child.label}
                    onChange={(e) =>
                      updateChildNode(i, ci, { label: e.target.value })
                    }
                    disabled={disabled}
                  />
                  <Input
                    placeholder="경로"
                    value={child.path ?? ""}
                    onChange={(e) =>
                      updateChildNode(i, ci, { path: e.target.value })
                    }
                    disabled={disabled}
                    className="w-40"
                  />
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeChildNode(i, ci)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => addChildNode(i)}
                >
                  <Plus className="size-3" />
                  하위 추가
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* User Flows */}
      <section className="space-y-3">
        <SectionHeader title="유저 플로우" tooltip={SECTION_TOOLTIPS["infoArchitecture.userFlows"]}>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addFlow}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        {data.userFlows.map((flow, fi) => (
          <div key={flow.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="플로우 이름"
                value={flow.name}
                onChange={(e) => updateFlow(fi, { name: e.target.value })}
                disabled={disabled}
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeFlow(fi)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            {flow.steps.map((step, si) => (
              <div key={step.id} className="ml-4 flex gap-2">
                <span className="mt-2 text-xs text-muted-foreground">
                  {si + 1}.
                </span>
                <Input
                  placeholder="액션"
                  value={step.action}
                  onChange={(e) =>
                    updateStep(fi, si, { action: e.target.value })
                  }
                  disabled={disabled}
                />
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeStep(fi, si)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {!disabled && (
              <Button
                variant="ghost"
                size="xs"
                className="ml-4"
                onClick={() => addStep(fi)}
              >
                <Plus className="size-3" />
                스텝 추가
              </Button>
            )}
          </div>
        ))}
      </section>

      {/* Global Nav Rules */}
      <section className="space-y-2">
        <SectionHeader title="글로벌 네비게이션 규칙" tooltip={SECTION_TOOLTIPS["infoArchitecture.navRules"]} />
        <StringList
          items={data.globalNavRules}
          onChange={(globalNavRules) => patchData({ globalNavRules })}
          placeholder="규칙"
          disabled={disabled}
        />
      </section>
    </div>
  );
}
