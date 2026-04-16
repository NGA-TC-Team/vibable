"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComponentStylePreview } from "@/components/phases/component-style-preview";

export function DesignSystemPreview() {
  const { data } = usePhaseData("designSystem");
  if (!data) return null;

  return (
    <div className="space-y-6 text-sm">
      {/* § 1 */}
      <section className="space-y-1">
        <h2 className="text-base font-semibold">Visual Theme</h2>
        <p>{data.visualTheme.mood || <span className="text-muted-foreground/50 italic">분위기를 입력하세요</span>}</p>
        <p className="text-muted-foreground">밀도: {data.visualTheme.density} · {data.visualTheme.philosophy}</p>
      </section>

      {/* § 2 */}
      {data.colorPalette.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Color Palette</h2>
          <div className="flex flex-wrap gap-2">
            {data.colorPalette.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-5 rounded ring-1 ring-border" style={{ backgroundColor: c.hex }} />
                <span>{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.hex}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* § 3 */}
      {data.typography.scale.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Typography</h2>
          <Table className="text-xs">
            <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>크기</TableHead><TableHead>두께</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.typography.scale.map((s, i) => (
                <TableRow key={i}><TableCell>{s.name}</TableCell><TableCell>{s.size}</TableCell><TableCell>{s.weight}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {/* § 4 */}
      {data.components.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Components</h2>
          {data.components.map((c, i) => (
            <div key={i} className="rounded border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {c.category ?? "custom"}
                </span>
                <span className="text-sm font-medium">{c.component}</span>
                <span className="text-xs text-muted-foreground">
                  radius: {c.borderRadius}
                </span>
              </div>
              <ComponentStylePreview style={c} />
              {c.variants && (
                <p className="text-xs text-muted-foreground">{c.variants}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* § 7 */}
      {(data.guidelines.dos.length > 0 || data.guidelines.donts.length > 0) && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Do&apos;s and Don&apos;ts</h2>
          {data.guidelines.dos.map((d, i) => <p key={i} className="text-green-600 dark:text-green-400">✓ {d}</p>)}
          {data.guidelines.donts.map((d, i) => <p key={i} className="text-red-500 dark:text-red-400">✗ {d}</p>)}
        </section>
      )}

      {/* UX Writing */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold">UX Writing</h2>
        <p className="text-muted-foreground">톤: {data.uxWriting.toneLevel}/5 · 에러 스타일: {data.uxWriting.errorMessageStyle}</p>
        {data.uxWriting.glossary.length > 0 && (
          <Table className="text-xs">
            <TableHeader><TableRow><TableHead>사용</TableHead><TableHead>피할 표현</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.uxWriting.glossary.map((g, i) => (
                <TableRow key={i}><TableCell>{g.term}</TableCell><TableCell>{g.avoid}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
