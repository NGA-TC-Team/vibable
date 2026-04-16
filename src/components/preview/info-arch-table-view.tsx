"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SitemapNode, UserFlow } from "@/types/phases";

function flattenSitemap(
  nodes: SitemapNode[],
  depth: number,
  parentLabel: string,
): { level: number; label: string; path: string; parent: string }[] {
  return nodes.flatMap((node) => [
    {
      level: depth + 1,
      label: node.label || "(이름 없음)",
      path: node.path || "",
      parent: parentLabel || "—",
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
          <TableHead className="w-16">레벨</TableHead>
          <TableHead>페이지 이름</TableHead>
          <TableHead>경로</TableHead>
          <TableHead>상위 페이지</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            <TableCell className="tabular-nums">{row.level}</TableCell>
            <TableCell>{row.label}</TableCell>
            <TableCell className="font-mono text-xs">{row.path || "—"}</TableCell>
            <TableCell>{row.parent}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserFlowTableView({ flow }: { flow: UserFlow }) {
  if (flow.steps.length === 0) {
    return (
      <p className="text-muted-foreground/50 italic text-sm">
        스텝을 추가하세요
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>액션</TableHead>
          <TableHead>다음 스텝</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flow.steps.map((step, i) => (
          <TableRow key={step.id}>
            <TableCell className="tabular-nums">{i + 1}</TableCell>
            <TableCell>{step.action || "(미입력)"}</TableCell>
            <TableCell>
              {step.next.length > 0 ? step.next.join(", ") : i < flow.steps.length - 1 ? String(i + 2) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
