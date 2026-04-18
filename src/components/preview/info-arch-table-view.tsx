"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SCREEN_TYPE_LABELS } from "@/lib/constants";
import type { SitemapNode, UserFlow, ScreenType } from "@/types/phases";

interface SitemapRow {
  level: number;
  label: string;
  path: string;
  parent: string;
  screenType?: ScreenType;
  purpose: string;
  primaryTask: string;
  audience: string[];
  primaryEntity: string;
}

function flattenSitemap(
  nodes: SitemapNode[],
  depth: number,
  parentLabel: string,
): SitemapRow[] {
  return nodes.flatMap((node) => [
    {
      level: depth + 1,
      label: node.label || "(이름 없음)",
      path: node.path || "",
      parent: parentLabel || "—",
      screenType: node.screenType,
      purpose: node.purpose ?? "",
      primaryTask: node.primaryTask ?? "",
      audience: node.audience ?? [],
      primaryEntity: node.primaryEntity ?? "",
    },
    ...flattenSitemap(node.children, depth + 1, node.label || "(이름 없음)"),
  ]);
}

export function SitemapTableView({ sitemap }: { sitemap: SitemapNode[] }) {
  const rows = flattenSitemap(sitemap, 0, "");

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground/50 italic text-sm">
        사이트맵을 추가하세요
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">레벨</TableHead>
          <TableHead>페이지 이름</TableHead>
          <TableHead className="w-20">역할</TableHead>
          <TableHead>목적</TableHead>
          <TableHead>핵심 과업</TableHead>
          <TableHead>대상</TableHead>
          <TableHead>핵심 객체</TableHead>
          <TableHead>경로</TableHead>
          <TableHead>상위</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            <TableCell className="tabular-nums">{row.level}</TableCell>
            <TableCell>{row.label}</TableCell>
            <TableCell>
              {row.screenType ? (
                <Badge variant="secondary" className="text-[10px]">
                  {SCREEN_TYPE_LABELS[row.screenType]}
                </Badge>
              ) : (
                <span className="text-muted-foreground/60">—</span>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {row.purpose || "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {row.primaryTask || "—"}
            </TableCell>
            <TableCell className="text-xs">
              {row.audience.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {row.audience.map((a) => (
                    <Badge key={a} variant="outline" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground/60">—</span>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {row.primaryEntity || "—"}
            </TableCell>
            <TableCell className="font-mono text-xs">{row.path || "—"}</TableCell>
            <TableCell>{row.parent}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserFlowTableView({
  flow,
  sitemap,
}: {
  flow: UserFlow;
  sitemap?: SitemapNode[];
}) {
  if (flow.steps.length === 0) {
    return (
      <p className="text-muted-foreground/50 italic text-sm">
        스텝을 추가하세요
      </p>
    );
  }

  const sitemapLabelById = new Map<string, string>();
  const collect = (nodes: SitemapNode[]) => {
    nodes.forEach((n) => {
      sitemapLabelById.set(n.id, n.label || "(이름 없음)");
      collect(n.children);
    });
  };
  collect(sitemap ?? []);

  const stepIndexById = new Map(flow.steps.map((s, i) => [s.id, i + 1]));
  const successSet = new Set(flow.successEndings ?? []);
  const failureSet = new Set(flow.failureEndings ?? []);

  return (
    <div className="space-y-2">
      {(flow.goal || flow.primaryActor) && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {flow.primaryActor && (
            <Badge variant="outline" className="text-[10px]">
              수행자: {flow.primaryActor}
            </Badge>
          )}
          {flow.goal && <span>목표: {flow.goal}</span>}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>액션</TableHead>
            <TableHead>화면</TableHead>
            <TableHead>수행자</TableHead>
            <TableHead>다음 스텝</TableHead>
            <TableHead>종료</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flow.steps.map((step, i) => {
            const ref = step.screenRef?.trim() ?? "";
            const refLabel = ref ? sitemapLabelById.get(ref) ?? ref : "";
            const nextLabels =
              step.next.length > 0
                ? step.next
                    .map((id) => {
                      const idx = stepIndexById.get(id);
                      const target = flow.steps.find((s) => s.id === id);
                      if (!idx) return `❓${id}`;
                      return `${idx}. ${target?.action?.trim() || "(설명 없음)"}`;
                    })
                    .join(", ")
                : i < flow.steps.length - 1
                  ? `${i + 2}. ${flow.steps[i + 1].action || "(설명 없음)"}`
                  : "—";

            return (
              <TableRow key={step.id}>
                <TableCell className="tabular-nums">{i + 1}</TableCell>
                <TableCell>
                  <div>{step.action || "(미입력)"}</div>
                  {(step.condition || step.outcome) && (
                    <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                      {step.condition && <div>· 조건: {step.condition}</div>}
                      {step.outcome && <div>· 결과: {step.outcome}</div>}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {refLabel ? (
                    <Badge variant="outline" className="text-[10px]">
                      {refLabel}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {step.actor || "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {nextLabels}
                </TableCell>
                <TableCell>
                  {successSet.has(step.id) ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">
                      성공
                    </Badge>
                  ) : failureSet.has(step.id) ? (
                    <Badge className="bg-rose-500 text-white text-[10px]">
                      실패
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
