import { overviewTemplates } from "./overview";
import { userScenarioTemplates } from "./user-scenario";
import { requirementsTemplates } from "./requirements";
import { infoArchitectureTemplates } from "./info-architecture";
import { screenDesignTemplates } from "./screen-design";
import { dataModelTemplates } from "./data-model";
import { designSystemTemplates } from "./design-system";

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
}

export const templatesByPhase: Record<number, PhaseTemplate[]> = {
  0: overviewTemplates,
  1: userScenarioTemplates,
  2: requirementsTemplates,
  3: infoArchitectureTemplates,
  4: screenDesignTemplates,
  5: dataModelTemplates,
  6: designSystemTemplates,
};

export {
  overviewTemplates,
  userScenarioTemplates,
  requirementsTemplates,
  infoArchitectureTemplates,
  screenDesignTemplates,
  dataModelTemplates,
  designSystemTemplates,
};
