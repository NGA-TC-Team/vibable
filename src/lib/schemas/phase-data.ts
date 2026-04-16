import { z } from "zod";
import { overviewSchema } from "./overview";
import { userScenarioSchema } from "./user-scenario";
import { requirementsSchema } from "./requirements";
import { infoArchitectureSchema } from "./info-architecture";
import { screenDesignSchema } from "./screen-design";
import { dataModelSchema } from "./data-model";
import { designSystemSchema } from "./design-system";

export const memoSchema = z.object({
  id: z.string(),
  content: z.string().default(""),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const phaseMemosSchema = z
  .record(z.coerce.number(), z.array(memoSchema))
  .default({});

export const phaseDataSchema = z.object({
  overview: overviewSchema.default(() => overviewSchema.parse({})),
  userScenario: userScenarioSchema.default(() =>
    userScenarioSchema.parse({}),
  ),
  requirements: requirementsSchema.default(() =>
    requirementsSchema.parse({}),
  ),
  infoArchitecture: infoArchitectureSchema.default(() =>
    infoArchitectureSchema.parse({}),
  ),
  screenDesign: screenDesignSchema.default(() =>
    screenDesignSchema.parse({}),
  ),
  dataModel: dataModelSchema.default(() => dataModelSchema.parse({})),
  designSystem: designSystemSchema.default(() =>
    designSystemSchema.parse({}),
  ),
  memos: phaseMemosSchema,
});

export type PhaseDataSchemaType = z.infer<typeof phaseDataSchema>;

export function createDefaultPhaseData(): PhaseDataSchemaType {
  return phaseDataSchema.parse({});
}
