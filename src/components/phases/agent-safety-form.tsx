"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { AgentTestCase, RiskScenario } from "@/types/phases";

export function AgentSafetyForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData, patchData } = usePhaseData("agentSafety");

  if (!data) return null;

  const addRisk = () => {
    const r: RiskScenario = {
      id: crypto.randomUUID(),
      scenario: "",
      impact: "medium",
      mitigation: "",
    };
    setData({ ...data, riskScenarios: [...data.riskScenarios, r] });
  };

  const updateRisk = (index: number, patch: Partial<RiskScenario>) => {
    const riskScenarios = [...data.riskScenarios];
    riskScenarios[index] = { ...riskScenarios[index], ...patch };
    setData({ ...data, riskScenarios });
  };

  const removeRisk = (index: number) => {
    setData({
      ...data,
      riskScenarios: data.riskScenarios.filter((_, i) => i !== index),
    });
  };

  const addTest = () => {
    const t: AgentTestCase = {
      id: crypto.randomUUID(),
      name: "",
      input: "",
      expectedBehavior: "",
      forbiddenBehavior: "",
    };
    setData({ ...data, testCases: [...data.testCases, t] });
  };

  const updateTest = (index: number, patch: Partial<AgentTestCase>) => {
    const testCases = [...data.testCases];
    testCases[index] = { ...testCases[index], ...patch };
    setData({ ...data, testCases });
  };

  const removeTest = (index: number) => {
    setData({
      ...data,
      testCases: data.testCases.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="위험 시나리오">
        {data.riskScenarios.map((r, i) => (
          <div key={r.id} className="mb-3 space-y-2 rounded-lg border p-3">
            <Textarea
              disabled={disabled}
              placeholder="시나리오"
              value={r.scenario}
              onChange={(e) => updateRisk(i, { scenario: e.target.value })}
              rows={2}
            />
            <select
              className="h-10 max-w-xs rounded-md border border-input bg-background px-3 text-sm"
              disabled={disabled}
              value={r.impact}
              onChange={(e) =>
                updateRisk(i, { impact: e.target.value as RiskScenario["impact"] })
              }
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
            <Textarea
              disabled={disabled}
              placeholder="완화 조치"
              value={r.mitigation}
              onChange={(e) => updateRisk(i, { mitigation: e.target.value })}
              rows={2}
            />
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeRisk(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addRisk}>
          <Plus className="mr-1 size-4" />
          시나리오 추가
        </Button>
      </SectionGroup>

      <SectionGroup title="Human-in-the-Loop">
        <StringList
          disabled={disabled}
          items={data.humanInTheLoop}
          onChange={(humanInTheLoop) => patchData({ humanInTheLoop })}
          placeholder="사람 확인 지점"
        />
      </SectionGroup>

      <SectionGroup title="테스트 케이스">
        {data.testCases.map((t, i) => (
          <div key={t.id} className="mb-3 space-y-2 rounded-lg border p-3">
            <Input
              disabled={disabled}
              placeholder="이름"
              value={t.name}
              onChange={(e) => updateTest(i, { name: e.target.value })}
            />
            <Textarea
              disabled={disabled}
              placeholder="입력(프롬프트)"
              value={t.input}
              onChange={(e) => updateTest(i, { input: e.target.value })}
              rows={2}
            />
            <Textarea
              disabled={disabled}
              placeholder="기대 동작"
              value={t.expectedBehavior}
              onChange={(e) => updateTest(i, { expectedBehavior: e.target.value })}
              rows={2}
            />
            <Textarea
              disabled={disabled}
              placeholder="금지 동작"
              value={t.forbiddenBehavior}
              onChange={(e) => updateTest(i, { forbiddenBehavior: e.target.value })}
              rows={2}
            />
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeTest(i)}>
              삭제
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addTest}>
          테스트 추가
        </Button>
      </SectionGroup>

      <SectionGroup title="롤백 계획">
        <FieldLabel>에이전트 오작동 시 복구</FieldLabel>
        <Textarea
          disabled={disabled}
          value={data.rollbackPlan}
          onChange={(e) => patchData({ rollbackPlan: e.target.value })}
          rows={4}
        />
      </SectionGroup>
    </div>
  );
}
