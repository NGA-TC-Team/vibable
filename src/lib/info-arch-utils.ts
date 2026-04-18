import type { SitemapNode } from "@/types/phases";

export interface FlatSitemapNode {
  id: string;
  label: string;
  path: string;
  depth: number;
  parentId: string | null;
}

export function flattenSitemap(nodes: SitemapNode[]): FlatSitemapNode[] {
  const walk = (
    current: SitemapNode[],
    depth: number,
    parentId: string | null,
  ): FlatSitemapNode[] =>
    current.flatMap((n) => [
      {
        id: n.id,
        label: n.label,
        path: n.path ?? "",
        depth,
        parentId,
      },
      ...walk(n.children, depth + 1, n.id),
    ]);
  return walk(nodes, 0, null);
}

export function findSitemapNode(
  nodes: SitemapNode[],
  id: string,
): SitemapNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = findSitemapNode(n.children, id);
    if (hit) return hit;
  }
  return null;
}
