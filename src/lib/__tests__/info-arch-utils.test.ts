import { describe, it, expect } from "vitest";
import { flattenSitemap, findSitemapNode } from "../info-arch-utils";
import type { SitemapNode } from "@/types/phases";

function makeNode(
  id: string,
  children: SitemapNode[] = [],
  overrides?: Partial<SitemapNode>,
): SitemapNode {
  return {
    id,
    label: `label-${id}`,
    path: `/${id}`,
    children,
    ...overrides,
  };
}

describe("flattenSitemap", () => {
  it("빈 입력은 빈 배열을 반환한다", () => {
    expect(flattenSitemap([])).toEqual([]);
  });

  it("깊이 우선 순서로 평탄화하고 depth/parentId를 채운다", () => {
    const tree: SitemapNode[] = [
      makeNode("a", [makeNode("a1"), makeNode("a2", [makeNode("a2a")])]),
      makeNode("b"),
    ];
    const flat = flattenSitemap(tree);
    expect(flat.map((n) => n.id)).toEqual(["a", "a1", "a2", "a2a", "b"]);
    expect(flat.map((n) => n.depth)).toEqual([0, 1, 1, 2, 0]);
    expect(flat.map((n) => n.parentId)).toEqual([null, "a", "a", "a2", null]);
  });

  it("path이 없으면 빈 문자열로 채운다", () => {
    const tree: SitemapNode[] = [makeNode("x", [], { path: undefined })];
    expect(flattenSitemap(tree)[0].path).toBe("");
  });
});

describe("findSitemapNode", () => {
  const tree: SitemapNode[] = [
    makeNode("a", [makeNode("a1", [makeNode("a1a")])]),
    makeNode("b"),
  ];

  it("최상위 노드를 찾는다", () => {
    expect(findSitemapNode(tree, "b")?.id).toBe("b");
  });

  it("깊은 노드를 찾는다", () => {
    expect(findSitemapNode(tree, "a1a")?.id).toBe("a1a");
  });

  it("존재하지 않는 id에는 null을 반환한다", () => {
    expect(findSitemapNode(tree, "nope")).toBeNull();
  });
});
