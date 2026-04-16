"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

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
          <table className="w-full text-xs">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-1">이름</th><th className="text-left py-1">크기</th><th className="text-left py-1">두께</th></tr></thead>
            <tbody>
              {data.typography.scale.map((s, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-1">{s.name}</td><td className="py-1">{s.size}</td><td className="py-1">{s.weight}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* § 4 */}
      {data.components.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Components</h2>
          {data.components.map((c, i) => (
            <div key={i} className="rounded border p-2">
              <p className="font-medium">{c.component} <span className="text-xs text-muted-foreground">({c.borderRadius})</span></p>
              <p className="text-muted-foreground">{c.variants}</p>
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
          <table className="w-full text-xs">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-1">사용</th><th className="text-left py-1">피할 표현</th></tr></thead>
            <tbody>
              {data.uxWriting.glossary.map((g, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-1">{g.term}</td><td className="py-1">{g.avoid}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
