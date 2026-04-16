"use client";

import { generateDesignMd } from "@/components/export/design-md-generator";
import {
  PHASE_LABELS,
  type DataModelPhase,
  type EntityField,
  type PhaseData,
  type PhaseKey,
} from "@/types/phases";

function pushSection(lines: string[], title: string, body: string[]) {
  lines.push(`## ${title}`, "");
  lines.push(...body.filter(Boolean));
  lines.push("");
}

function formatBullets(items: string[]) {
  return items.length > 0 ? items.map((item) => `- ${item}`) : ["- 없음"];
}

function formatParagraph(value?: string) {
  return value?.trim() ? [value.trim()] : ["없음"];
}

function formatKeyValue(entries: Array<[string, string | number | undefined]>) {
  return entries.map(([label, value]) => `- ${label}: ${value || "없음"}`);
}

function formatDataModelField(field: EntityField) {
  const parts = [
    `${field.name || "이름 없는 필드"}: ${field.type}${field.required ? " / required" : ""}`,
  ];

  if (field.type === "relation") {
    const target =
      field.relationTarget && field.relationTargetField
        ? `${field.relationTarget}.${field.relationTargetField}`
        : field.relationTarget;

    if (target) parts.push(`target=${target}`);
    if (field.relationType) parts.push(`relation=${field.relationType}`);
    if (field.onDelete) parts.push(`onDelete=${field.onDelete}`);
    if (field.onUpdate) parts.push(`onUpdate=${field.onUpdate}`);
  }

  if (field.type === "enum" && field.enumValues?.length) {
    parts.push(`enum=[${field.enumValues.join(", ")}]`);
  }

  if (field.description?.trim()) {
    parts.push(`desc=${field.description.trim()}`);
  }

  return `- ${parts.join(" / ")}`;
}

function formatStorageStrategy(dataModel: DataModelPhase) {
  if (
    dataModel.storageStrategy === "distributed" &&
    dataModel.distributedStrategy
  ) {
    return `${dataModel.storageStrategy} (${dataModel.distributedStrategy})`;
  }

  return dataModel.storageStrategy;
}

export function generatePhaseMarkdown(
  projectName: string,
  phases: PhaseData,
  phaseKey: Exclude<PhaseKey, "screenDesign">,
) {
  if (phaseKey === "designSystem") {
    return generateDesignMd(projectName, phases.designSystem);
  }

  const lines = [`# ${projectName} - ${PHASE_LABELS[
    ["overview", "userScenario", "requirements", "infoArchitecture", "screenDesign", "dataModel", "designSystem"].indexOf(phaseKey)
  ]}`, "", `- 프로젝트: ${projectName}`, `- 페이즈: ${phaseKey}`, ""];

  switch (phaseKey) {
    case "overview": {
      const { overview } = phases;
      pushSection(lines, "프로젝트 개요", [
        ...formatKeyValue([
          ["프로젝트명", overview.projectName],
          ["엘리베이터 피치", overview.elevatorPitch],
          ["타깃 유저", overview.targetUsers],
          ["기술 스택", overview.techStack],
        ]),
      ]);
      pushSection(lines, "배경", formatParagraph(overview.background));
      pushSection(lines, "핵심 가치 제안", formatParagraph(overview.coreValueProposition));
      pushSection(lines, "비즈니스 목표", formatBullets(overview.businessGoals));
      pushSection(lines, "제약사항", formatBullets(overview.constraints));
      pushSection(
        lines,
        "경쟁사",
        overview.competitors.length > 0
          ? overview.competitors.map(
              (item) =>
                `- ${item.name}: 강점 ${item.strength || "없음"} / 약점 ${item.weakness || "없음"}${item.url ? ` / ${item.url}` : ""}`,
            )
          : ["- 없음"],
      );
      pushSection(
        lines,
        "성공지표",
        overview.successMetrics.length > 0
          ? overview.successMetrics.map(
              (item) =>
                `- ${item.metric}: 목표 ${item.target || "없음"} / 측정 ${item.measurement || "없음"}`,
            )
          : ["- 없음"],
      );
      pushSection(
        lines,
        "타임라인",
        overview.timeline.length > 0
          ? overview.timeline.map(
              (item) =>
                `- ${item.milestone}: ${item.date || "미정"} / ${item.description || "설명 없음"}`,
            )
          : ["- 없음"],
      );
      pushSection(
        lines,
        "참고 자료",
        overview.references.length > 0
          ? overview.references.map(
              (item) =>
                `- ${item.title}${item.url ? ` (${item.url})` : ""}${item.notes ? ` - ${item.notes}` : ""}`,
            )
          : ["- 없음"],
      );
      break;
    }
    case "userScenario": {
      const { userScenario } = phases;
      pushSection(
        lines,
        "페르소나",
        userScenario.personas.length > 0
          ? userScenario.personas.flatMap((persona) => [
              `### ${persona.name || "이름 없는 페르소나"}`,
              `- 역할: ${persona.role || "없음"}`,
              `- 목표: ${(persona.goals ?? []).join(", ") || "없음"}`,
              `- 페인 포인트: ${(persona.painPoints ?? []).join(", ") || "없음"}`,
              "",
            ])
          : ["- 없음"],
      );
      pushSection(
        lines,
        "유저 스토리",
        userScenario.userStories.length > 0
          ? userScenario.userStories.map(
              (story) =>
                `- ${story.asA || "사용자"}는 ${story.iWant || "무언가를 원하고"} 그래서 ${story.soThat || "가치를 얻는다"}`,
            )
          : ["- 없음"],
      );
      pushSection(lines, "성공 시나리오", formatBullets(userScenario.successScenarios));
      pushSection(lines, "실패 시나리오", formatBullets(userScenario.failureScenarios));
      break;
    }
    case "requirements": {
      const { requirements } = phases;
      pushSection(
        lines,
        "기능 요구사항",
        requirements.functional.length > 0
          ? requirements.functional.flatMap((item) => [
              `### ${item.title || "이름 없는 요구사항"}`,
              `- 우선순위: ${item.priority}`,
              `- 설명: ${item.description || "없음"}`,
              `- 수용 기준: ${(item.acceptanceCriteria ?? []).join(", ") || "없음"}`,
              "",
            ])
          : ["- 없음"],
      );
      pushSection(
        lines,
        "비기능 요구사항",
        requirements.nonFunctional.length > 0
          ? requirements.nonFunctional.map(
              (item) => `- ${item.category}: ${item.description || "없음"}`,
            )
          : ["- 없음"],
      );
      break;
    }
    case "infoArchitecture": {
      const { infoArchitecture } = phases;
      const flattenSitemap = (
        nodes: typeof infoArchitecture.sitemap,
        depth = 0,
      ): string[] =>
        nodes.flatMap((node) => [
          `${"  ".repeat(depth)}- ${node.label || "이름 없는 노드"}${node.path ? ` (${node.path})` : ""}`,
          ...flattenSitemap(node.children, depth + 1),
        ]);
      pushSection(lines, "사이트맵", flattenSitemap(infoArchitecture.sitemap));
      pushSection(
        lines,
        "유저 플로우",
        infoArchitecture.userFlows.length > 0
          ? infoArchitecture.userFlows.flatMap((flow) => [
              `### ${flow.name || "이름 없는 플로우"}`,
              ...(flow.steps.length > 0
                ? flow.steps.map((step, index) => `- ${index + 1}. ${step.action || "설명 없음"}`)
                : ["- 스텝 없음"]),
              "",
            ])
          : ["- 없음"],
      );
      pushSection(lines, "글로벌 네비게이션 규칙", formatBullets(infoArchitecture.globalNavRules));
      break;
    }
    case "dataModel": {
      const { dataModel } = phases;
      pushSection(
        lines,
        "엔티티",
        dataModel.entities.length > 0
          ? dataModel.entities.flatMap((entity) => [
              `### ${entity.name || "이름 없는 엔티티"}`,
              ...(entity.fields.length > 0
                ? entity.fields.map((field) => formatDataModelField(field))
                : ["- 필드 없음"]),
              "",
            ])
          : ["- 없음"],
      );
      pushSection(
        lines,
        "저장 전략",
        formatKeyValue([
          ["전략", formatStorageStrategy(dataModel)],
          ["메모", dataModel.storageNotes],
        ]),
      );
      break;
    }
  }

  return lines.join("\n").trimEnd() + "\n";
}
