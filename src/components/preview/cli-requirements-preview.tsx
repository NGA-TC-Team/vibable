"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function CliRequirementsPreview() {
  const { data } = usePhaseData("cliRequirements");

  if (!data) return null;

  const platform = data.platformMatrix;
  const policy = data.destructivePolicy;
  const slo = data.performance;

  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="mb-1 text-base font-semibold">기능 요구사항</h3>
        {data.functional.length === 0 ? (
          <p className="text-xs text-muted-foreground">요구사항이 없습니다.</p>
        ) : (
          <ul className="space-y-1">
            {data.functional.map((f) => (
              <li key={f.id} className="flex items-start gap-2 text-xs">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  {f.priority}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{f.title || f.id}</span>
                  {f.description && (
                    <span className="ml-1 text-muted-foreground">— {f.description}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {platform && (
        <section>
          <h3 className="mb-1 text-base font-semibold">실행 환경</h3>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">OS</dt>
              <dd>{platform.os.join(", ") || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">ARCH</dt>
              <dd>{platform.arch.join(", ") || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">쉘</dt>
              <dd>{platform.shells.join(", ") || "—"}</dd>
            </div>
          </dl>
        </section>
      )}

      {policy && (
        <section>
          <h3 className="mb-1 text-base font-semibold">파괴적 작업 정책</h3>
          <ul className="space-y-0.5 text-xs">
            <li>확인 요구: {policy.requiresConfirmation ? "Yes" : "No"}</li>
            <li>확인 플래그: <code>{policy.confirmationFlag}</code></li>
            <li>--dry-run: {policy.dryRunSupported ? "지원" : "미지원"}</li>
            <li>감사 로그: {policy.auditTrail}</li>
          </ul>
        </section>
      )}

      {slo && (slo.coldStartMs || slo.p95CommandMs || slo.binarySizeMb) && (
        <section>
          <h3 className="mb-1 text-base font-semibold">성능 SLO</h3>
          <ul className="space-y-0.5 text-xs">
            {slo.coldStartMs && <li>Cold start ≤ {slo.coldStartMs}ms</li>}
            {slo.p95CommandMs && <li>P95 ≤ {slo.p95CommandMs}ms</li>}
            {slo.streamingLatencyMs && (
              <li>스트리밍 레이턴시 ≤ {slo.streamingLatencyMs}ms</li>
            )}
            {slo.binarySizeMb && <li>바이너리 ≤ {slo.binarySizeMb}MB</li>}
          </ul>
        </section>
      )}

      {data.authMethods && data.authMethods.length > 0 && (
        <section>
          <h3 className="mb-1 text-base font-semibold">인증</h3>
          <div className="flex flex-wrap gap-1">
            {data.authMethods.map((m) => (
              <span key={m} className="rounded bg-muted px-2 py-0.5 text-xs">
                {m}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
