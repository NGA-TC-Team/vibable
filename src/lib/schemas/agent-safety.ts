import { z } from "zod";

export const riskScenarioSchema = z.object({
  id: z.string(),
  scenario: z.string().default(""),
  impact: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  mitigation: z.string().default(""),
});

export const agentTestCaseSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  input: z.string().default(""),
  expectedBehavior: z.string().default(""),
  forbiddenBehavior: z.string().default(""),
});

export const agentSafetyPhaseSchema = z.object({
  riskScenarios: z.array(riskScenarioSchema).default([]),
  humanInTheLoop: z.array(z.string()).default([]),
  testCases: z.array(agentTestCaseSchema).default([]),
  rollbackPlan: z.string().default(""),
});

export type AgentSafetySchemaType = z.infer<typeof agentSafetyPhaseSchema>;
