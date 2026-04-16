"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { SitemapDiagram } from "./sitemap-diagram";
import { UserFlowDiagram } from "./user-flow-diagram";

export function InfoArchitecturePreview() {
  const { data } = usePhaseData("infoArchitecture");
  if (!data) return null;

  const hasSitemap = data.sitemap.length > 0;
  const hasFlows = data.userFlows.length > 0;
  const hasRules = data.globalNavRules.filter(Boolean).length > 0;

  if (!hasSitemap && !hasFlows && !hasRules) {
    return (
      <div className="space-y-6 text-sm">
        <p className="text-muted-foreground/50 italic">정보 구조를 추가하세요</p>
      </div>
    );
  }

  const defaultTab = hasSitemap ? "sitemap" : data.userFlows[0]?.id ?? "sitemap";

  return (
    <div className="space-y-4 text-sm">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {hasSitemap && <TabsTrigger value="sitemap">사이트맵</TabsTrigger>}
          {data.userFlows.map((flow) => (
            <TabsTrigger key={flow.id} value={flow.id}>
              {flow.name || "유저 플로우"}
            </TabsTrigger>
          ))}
        </TabsList>

        {hasSitemap && (
          <TabsContent value="sitemap" className="space-y-4">
            <SitemapDiagram sitemap={data.sitemap} />
            {hasRules && (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">네비게이션 규칙</h3>
                <ul className="ml-4 list-disc text-sm">
                  {data.globalNavRules.filter(Boolean).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>
            )}
          </TabsContent>
        )}

        {data.userFlows.map((flow) => (
          <TabsContent key={flow.id} value={flow.id}>
            <UserFlowDiagram flow={flow} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
