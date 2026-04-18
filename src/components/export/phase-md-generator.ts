"use client";

import { generateDesignMd } from "@/components/export/design-md-generator";
import {
  flattenOverviewSuccessMetrics,
  flattenOverviewTimeline,
} from "@/lib/overview-groups";
import {
  AGENT_PHASE_KEYS,
  AGENT_PHASE_LABELS,
  PHASE_LABELS,
  type AgentPhaseKey,
  type DataModelPhase,
  type EntityField,
  type PhaseData,
  type PhaseKey,
} from "@/types/phases";

const AGENT_MD_KEYS: AgentPhaseKey[] = [
  "agentRequirements",
  "agentArchitecture",
  "agentBehavior",
  "agentTools",
  "agentSafety",
];

export type PhaseMarkdownExportKey = Exclude<PhaseKey, "screenDesign"> | AgentPhaseKey;

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

function formatOptionalBullets(title: string, items: string[]) {
  const visibleItems = items.filter(Boolean);
  if (visibleItems.length === 0) return [];

  return [`- ${title}:`, ...visibleItems.map((item) => `  - ${item}`)];
}

function formatPersonaMarkdown(persona: PhaseData["userScenario"]["personas"][number]) {
  return [
    `### ${persona.name || "이름 없는 페르소나"}`,
    `- 역할: ${persona.role || "없음"}`,
    ...(persona.demographics?.trim()
      ? [`- 배경 정보: ${persona.demographics.trim()}`]
      : []),
    ...(persona.context?.trim() ? [`- 사용 맥락: ${persona.context.trim()}`] : []),
    ...(persona.techProficiency?.trim()
      ? [`- 디지털 숙련도: ${persona.techProficiency.trim()}`]
      : []),
    ...formatOptionalBullets("행동 패턴", persona.behaviors ?? []),
    ...formatOptionalBullets("동기", persona.motivations ?? []),
    ...formatOptionalBullets("핵심 니즈", persona.needs ?? []),
    ...formatOptionalBullets("목표", persona.goals ?? []),
    ...formatOptionalBullets("페인 포인트", persona.painPoints ?? []),
    ...formatOptionalBullets("좌절 포인트", persona.frustrations ?? []),
    ...formatOptionalBullets("성공 기준", persona.successCriteria ?? []),
    ...(persona.quote?.trim() ? [`- 대표 발화: "${persona.quote.trim()}"`] : []),
    "",
  ];
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
  phaseKey: PhaseMarkdownExportKey,
) {
  if (AGENT_MD_KEYS.includes(phaseKey as AgentPhaseKey)) {
    const idx = AGENT_PHASE_KEYS.indexOf(phaseKey as AgentPhaseKey);
    const label = AGENT_PHASE_LABELS[idx] ?? phaseKey;
    const slice = phases[phaseKey as keyof PhaseData];
    return [
      `# ${projectName} - ${label}`,
      "",
      "```json",
      JSON.stringify(slice ?? {}, null, 2),
      "```",
      "",
    ].join("\n");
  }

  const legacyKey = phaseKey as Exclude<PhaseKey, "screenDesign">;

  if (legacyKey === "designSystem") {
    return generateDesignMd(projectName, phases.designSystem);
  }

  const lines = [`# ${projectName} - ${PHASE_LABELS[
    ["overview", "userScenario", "requirements", "infoArchitecture", "screenDesign", "dataModel", "designSystem"].indexOf(legacyKey)
  ]}`, "", `- 프로젝트: ${projectName}`, `- 페이즈: ${legacyKey}`, ""];

  switch (legacyKey) {
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
      {
        const metrics = flattenOverviewSuccessMetrics(overview);
        const milestones = flattenOverviewTimeline(overview);
        pushSection(
          lines,
          "성공지표",
          metrics.length > 0
            ? metrics.map(
                (item) =>
                  `- ${item.metric}: 목표 ${item.target || "없음"} / 측정 ${item.measurement || "없음"}`,
              )
            : ["- 없음"],
        );
        pushSection(
          lines,
          "타임라인",
          milestones.length > 0
            ? milestones.map(
                (item) =>
                  `- ${item.milestone}: ${item.date || "미정"} / ${item.description || "설명 없음"}`,
              )
            : ["- 없음"],
        );
      }
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
      pushSection(lines, "페르소나 작성 모드", [
        `- 모드: ${userScenario.personaDetailLevel === "detailed" ? "상세형" : "간편형"}`,
      ]);
      pushSection(
        lines,
        "페르소나",
        userScenario.personas.length > 0
          ? userScenario.personas.flatMap((persona) => formatPersonaMarkdown(persona))
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
      const constraints = requirements.constraints ?? [];
      const glossary = requirements.glossary ?? [];
      const clarifications = requirements.clarifications ?? [];
      pushSection(
        lines,
        "기능 요구사항",
        requirements.functional.length > 0
          ? requirements.functional.flatMap((item) => [
              `### ${item.title || "이름 없는 요구사항"}`,
              `- ID: ${item.id}`,
              `- 우선순위: ${item.priority}`,
              ...(item.statement?.trim() ? [`- 규격 문장: ${item.statement.trim()}`] : []),
              `- 설명: ${item.description || "없음"}`,
              ...(item.rationale?.trim() ? [`- 근거: ${item.rationale.trim()}`] : []),
              ...(item.source?.trim() ? [`- 출처: ${item.source.trim()}`] : []),
              `- 수용 기준: ${(item.acceptanceCriteria ?? []).join(", ") || "없음"}`,
              ...((item.relatedGoalIds ?? []).length > 0
                ? [`- 관련 비즈니스 목표: ${item.relatedGoalIds.join(", ")}`]
                : []),
              "",
            ])
          : ["- 없음"],
      );
      pushSection(
        lines,
        "용어 정의",
        glossary.length > 0
          ? glossary.map((item) => {
              const aliasPart =
                item.aliases.length > 0 ? ` _(${item.aliases.join(", ")})_` : "";
              return `- **${item.term || "(용어 미입력)"}** (${item.kind}): ${
                item.definition || "정의 없음"
              }${aliasPart}`;
            })
          : ["- 없음"],
      );
      pushSection(
        lines,
        "제약조건",
        constraints.length > 0
          ? constraints.map((item) => {
              const extras = [
                item.source?.trim() ? `출처: ${item.source.trim()}` : null,
                item.impact?.trim() ? `영향: ${item.impact.trim()}` : null,
              ].filter(Boolean) as string[];
              return `- [${item.category}] ${item.description || "설명 없음"}${
                extras.length > 0 ? ` _(${extras.join(" · ")})_` : ""
              }`;
            })
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
      pushSection(
        lines,
        "미해결 · 확인 필요",
        clarifications.length > 0
          ? clarifications.map((item) => {
              const meta = [
                item.owner?.trim() ? `담당: ${item.owner.trim()}` : null,
                item.context?.trim() ? `맥락: ${item.context.trim()}` : null,
                (item.blocksRequirementIds ?? []).length > 0
                  ? `영향: ${item.blocksRequirementIds.join(", ")}`
                  : null,
              ].filter(Boolean) as string[];
              const tail = item.answer?.trim() ? ` → ${item.answer.trim()}` : "";
              return `- [${item.status}] ${item.question || "질문 미입력"}${tail}${
                meta.length > 0 ? ` _(${meta.join(" · ")})_` : ""
              }`;
            })
          : ["- 없음"],
      );
      break;
    }
    case "infoArchitecture": {
      const { infoArchitecture } = phases;
      const sitemapLabelById = new Map<string, string>();
      const collectLabels = (nodes: typeof infoArchitecture.sitemap) => {
        nodes.forEach((n) => {
          sitemapLabelById.set(n.id, n.label || "이름 없는 노드");
          collectLabels(n.children);
        });
      };
      collectLabels(infoArchitecture.sitemap);

      const flattenSitemap = (
        nodes: typeof infoArchitecture.sitemap,
        depth = 0,
      ): string[] =>
        nodes.flatMap((node) => {
          const audiencePart =
            (node.audience ?? []).length > 0
              ? `👤${node.audience!.join("/")}`
              : null;
          const entityPart = node.primaryEntity
            ? `📦${node.primaryEntity}`
            : null;
          const meta = [
            node.screenType,
            node.primaryTask?.trim() || null,
            audiencePart,
            entityPart,
          ].filter(Boolean) as string[];
          const header = `${"  ".repeat(depth)}- ${node.label || "이름 없는 노드"}${
            node.path ? ` (${node.path})` : ""
          }${meta.length > 0 ? ` · ${meta.join(" · ")}` : ""}`;
          const purpose = node.purpose?.trim();
          return [
            header,
            ...(purpose ? [`${"  ".repeat(depth + 1)}· ${purpose}`] : []),
            ...flattenSitemap(node.children, depth + 1),
          ];
        });
      pushSection(lines, "사이트맵", flattenSitemap(infoArchitecture.sitemap));
      pushSection(
        lines,
        "유저 플로우",
        infoArchitecture.userFlows.length > 0
          ? infoArchitecture.userFlows.flatMap((flow) => {
              const stepIndexById = new Map(
                flow.steps.map((s, i) => [s.id, i + 1] as const),
              );
              const successSet = new Set(flow.successEndings ?? []);
              const failureSet = new Set(flow.failureEndings ?? []);
              const headerMeta = [
                flow.primaryActor ? `by ${flow.primaryActor}` : null,
                flow.goal ? `목표: ${flow.goal}` : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return [
                `### ${flow.name || "이름 없는 플로우"}${headerMeta ? ` — ${headerMeta}` : ""}`,
                ...(flow.steps.length > 0
                  ? flow.steps.map((step, index) => {
                      const refLabel = step.screenRef
                        ? sitemapLabelById.get(step.screenRef) ?? step.screenRef
                        : null;
                      const nextLabels = step.next
                        .map((id) => {
                          const idx = stepIndexById.get(id);
                          return idx ? `${idx}` : `❓${id}`;
                        })
                        .join(", ");
                      const endingBadge = successSet.has(step.id)
                        ? "✅성공종료"
                        : failureSet.has(step.id)
                          ? "⛔실패종료"
                          : null;
                      const meta = [
                        refLabel ? `@${refLabel}` : null,
                        nextLabels ? `→ ${nextLabels}` : null,
                        step.intent ? `의도:${step.intent}` : null,
                        step.actor ? `by ${step.actor}` : null,
                        endingBadge,
                      ].filter(Boolean);
                      const line = `- ${index + 1}. ${step.action || "설명 없음"}${
                        meta.length > 0 ? `  [${meta.join(" ")}]` : ""
                      }`;
                      const sub: string[] = [];
                      if (step.condition?.trim())
                        sub.push(`  · 조건: ${step.condition.trim()}`);
                      if (step.outcome?.trim())
                        sub.push(`  · 결과: ${step.outcome.trim()}`);
                      return [line, ...sub].join("\n");
                    })
                  : ["- 스텝 없음"]),
                "",
              ];
            })
          : ["- 없음"],
      );
      pushSection(
        lines,
        "글로벌 네비게이션 규칙",
        infoArchitecture.globalNavRules.length > 0
          ? infoArchitecture.globalNavRules
              .filter((r) => r.rule)
              .map((r) => {
                const prefix = [
                  r.severity ? `[${r.severity}]` : null,
                  r.title || null,
                ]
                  .filter(Boolean)
                  .join(" ");
                const body = prefix ? `${prefix} — ${r.rule}` : r.rule;
                return `- ${body}${r.rationale ? ` _(${r.rationale})_` : ""}`;
              })
          : ["- 없음"],
      );
      const roles = infoArchitecture.roles ?? [];
      if (roles.length > 0) {
        pushSection(
          lines,
          "역할",
          roles
            .filter((r) => r.name)
            .map(
              (r) =>
                `- **${r.name}**${r.description ? ` — ${r.description}` : ""}`,
            ),
        );
      }
      const entities = infoArchitecture.entities ?? [];
      if (entities.length > 0) {
        pushSection(
          lines,
          "엔티티",
          entities
            .filter((e) => e.name)
            .map((e) => {
              const states = (e.states ?? []).length > 0
                ? ` · 상태: ${e.states!.join(", ")}`
                : "";
              return `- **${e.name}**${e.description ? ` — ${e.description}` : ""}${states}`;
            }),
        );
      }
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
