"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { SitemapDiagram } from "./sitemap-diagram";
import { UserFlowDiagram } from "./user-flow-diagram";
import { SitemapTableView, UserFlowTableView } from "./info-arch-table-view";
import { InfoArchDiagnosticsView } from "./info-arch-diagnostics-view";

export function InfoArchitecturePreview() {
  const { data } = usePhaseData("infoArchitecture");
  const infoArchView = useEditorStore((s) => s.infoArchView);
  const setInfoArchView = useEditorStore((s) => s.setInfoArchView);
  const displayMode = useEditorStore((s) => s.infoArchDisplayMode);
  const setDisplayMode = useEditorStore((s) => s.setInfoArchDisplayMode);
  const selectedFlowId = useEditorStore((s) => s.selectedFlowId);
  const setSelectedFlowId = useEditorStore((s) => s.setSelectedFlowId);

  if (!data) return null;

  const hasSitemap = data.sitemap.length > 0;
  const hasFlows = data.userFlows.length > 0;
  const hasRules = data.globalNavRules.filter((r) => r.rule).length > 0;

  if (!hasSitemap && !hasFlows && !hasRules) {
    return (
      <div className="space-y-6 text-sm">
        <p className="text-muted-foreground/50 italic">정보 구조를 추가하세요</p>
      </div>
    );
  }

  const activeFlowId = selectedFlowId ?? data.userFlows[0]?.id ?? null;
  const activeFlow = data.userFlows.find((f) => f.id === activeFlowId);

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-between">
        <ToggleGroup
          type="single"
          value={infoArchView}
          onValueChange={(v) => {
            if (v === "sitemap" || v === "userFlow" || v === "diagnostics")
              setInfoArchView(v);
          }}
          className="self-start"
        >
          <ToggleGroupItem value="sitemap" className="text-xs">
            사이트맵
          </ToggleGroupItem>
          <ToggleGroupItem value="userFlow" className="text-xs">
            유저 플로우
          </ToggleGroupItem>
          <ToggleGroupItem value="diagnostics" className="text-xs">
            진단
          </ToggleGroupItem>
        </ToggleGroup>

        {infoArchView !== "diagnostics" && (
          <ToggleGroup
            type="single"
            value={displayMode}
            onValueChange={(v) => {
              if (v === "diagram" || v === "table") setDisplayMode(v);
            }}
          >
            <ToggleGroupItem value="diagram" className="text-xs">
              다이어그램
            </ToggleGroupItem>
            <ToggleGroupItem value="table" className="text-xs">
              표
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      {infoArchView === "sitemap" && (
        <div className="space-y-4">
          {hasSitemap ? (
            displayMode === "diagram" ? (
              <SitemapDiagram sitemap={data.sitemap} />
            ) : (
              <SitemapTableView sitemap={data.sitemap} />
            )
          ) : (
            <p className="text-muted-foreground/50 italic">사이트맵을 추가하세요</p>
          )}
          {hasRules && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">네비게이션 규칙</h3>
              <ul className="ml-4 list-disc text-sm">
                {data.globalNavRules
                  .filter((r) => r.rule)
                  .map((r) => (
                    <li key={r.id}>
                      {r.title && (
                        <span className="font-medium">{r.title} — </span>
                      )}
                      {r.rule}
                      {r.rationale && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({r.rationale})
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {infoArchView === "userFlow" && (
        <div className="space-y-3">
          {hasFlows ? (
            <>
              <Select value={activeFlowId ?? undefined} onValueChange={setSelectedFlowId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="플로우 선택" />
                </SelectTrigger>
                <SelectContent>
                  {data.userFlows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name || "유저 플로우"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeFlow && (
                displayMode === "diagram" ? (
                  <UserFlowDiagram flow={activeFlow} sitemap={data.sitemap} />
                ) : (
                  <UserFlowTableView flow={activeFlow} sitemap={data.sitemap} />
                )
              )}
            </>
          ) : (
            <p className="text-muted-foreground/50 italic">유저 플로우를 추가하세요</p>
          )}
        </div>
      )}

      {infoArchView === "diagnostics" && <InfoArchDiagnosticsView ia={data} />}
    </div>
  );
}
