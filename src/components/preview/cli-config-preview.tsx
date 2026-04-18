"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function CliConfigPreview() {
  const { data } = usePhaseData("cliConfig");

  if (!data) return null;

  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="mb-1 text-base font-semibold">파일시스템</h3>
        <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-xs font-mono">
          <dt className="text-muted-foreground">configDir</dt>
          <dd>{data.fsLayout.configDir}</dd>
          <dt className="text-muted-foreground">cacheDir</dt>
          <dd>{data.fsLayout.cacheDir}</dd>
          <dt className="text-muted-foreground">stateDir</dt>
          <dd>{data.fsLayout.stateDir}</dd>
          <dt className="text-muted-foreground">logsDir</dt>
          <dd>{data.fsLayout.logsDir}</dd>
        </dl>
      </section>

      {data.configFiles.length > 0 && (
        <section>
          <h3 className="mb-1 text-base font-semibold">설정 파일 (우선순위)</h3>
          <div className="space-y-2">
            {data.configFiles.map((cf) => (
              <div key={cf.id} className="rounded border p-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    {cf.format}
                  </span>
                  <span className="text-muted-foreground">
                    병합: {cf.mergeStrategy}
                  </span>
                  <span>— {cf.description}</span>
                </div>
                <ol className="mt-1 ml-4 list-decimal text-xs font-mono">
                  {cf.locationPriority.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.envVars.length > 0 && (
        <section>
          <h3 className="mb-1 text-base font-semibold">환경 변수</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-1 text-left">이름</th>
                <th className="p-1 text-left">용도</th>
                <th className="p-1 text-left">필수</th>
                <th className="p-1 text-left">민감</th>
              </tr>
            </thead>
            <tbody>
              {data.envVars.map((ev) => (
                <tr key={ev.id} className="border-b">
                  <td className="p-1 font-mono">{ev.name}</td>
                  <td className="p-1">{ev.purpose}</td>
                  <td className="p-1">{ev.required ? "✓" : "—"}</td>
                  <td className="p-1">{ev.sensitive ? "🔒" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section>
        <h3 className="mb-1 text-base font-semibold">시크릿</h3>
        <ul className="space-y-0.5 text-xs">
          <li>선호 저장소: <code>{data.secrets.preferredStore}</code></li>
          <li>
            지원 저장소:{" "}
            {data.secrets.supportedStores
              .map((s) => `<${s}>`)
              .join(", ") || "—"}
          </li>
          <li>로그 마스킹: {data.secrets.redactInLogs ? "✓" : "✗"}</li>
          {data.secrets.rotationPolicy && (
            <li>회전: {data.secrets.rotationPolicy}</li>
          )}
        </ul>
      </section>

      {data.outputSchemas.length > 0 && (
        <section>
          <h3 className="mb-1 text-base font-semibold">--json 출력 스키마</h3>
          <ul className="space-y-1 text-xs">
            {data.outputSchemas.map((os) => (
              <li key={os.id} className="rounded border p-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{os.describes}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                    v{os.version}
                  </span>
                  <span className="text-muted-foreground">
                    — {os.stabilityGuarantee}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
