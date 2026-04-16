"use client";

import React from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { PHASE_LABELS, type Project } from "@/types/phases";
import { stripMemos } from "@/lib/strip-memos";

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: "/fonts/NotoSansKR-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansKR-Bold.ttf", fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 50,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 8,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 9, color: "#888" },
  headerPhase: { fontSize: 9, color: "#888" },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: { fontSize: 8, color: "#999" },
  coverPage: {
    fontFamily: "NotoSansKR",
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  coverTitle: { fontSize: 28, fontWeight: 700, marginBottom: 12 },
  coverSub: { fontSize: 14, color: "#666", marginBottom: 6 },
  coverMeta: { fontSize: 10, color: "#999", marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#111" },
  subTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#333" },
  paragraph: { fontSize: 10, lineHeight: 1.6, marginBottom: 6 },
  listItem: { fontSize: 10, lineHeight: 1.6, marginBottom: 3, paddingLeft: 12 },
  table: { marginBottom: 12 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingVertical: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableCell: { flex: 1, fontSize: 9 },
  tableCellBold: { flex: 1, fontSize: 9, fontWeight: 700 },
  badge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
    marginVertical: 12,
  },
  card: {
    borderWidth: 0.5,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
});

const TYPE_LABELS: Record<string, string> = {
  web: "웹 앱",
  mobile: "모바일 앱",
  cli: "CLI",
};

const PRIORITY_LABELS: Record<string, string> = {
  must: "Must",
  should: "Should",
  could: "Could",
  wont: "Won't",
};

function PageHeader({ projectName, phaseName }: { projectName: string; phaseName: string }) {
  return (
    <View style={s.header} fixed>
      <Text style={s.headerTitle}>{projectName}</Text>
      <Text style={s.headerPhase}>{phaseName}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function CoverPage({ project }: { project: Project }) {
  return (
    <Page size="A4" orientation="landscape" style={s.coverPage}>
      <Text style={s.coverTitle}>{project.name}</Text>
      {project.phases.overview.elevatorPitch && (
        <Text style={[s.coverSub, { marginBottom: 12 }]}>{project.phases.overview.elevatorPitch}</Text>
      )}
      <Text style={s.coverSub}>{TYPE_LABELS[project.type] ?? project.type} 기획서</Text>
      <Text style={s.coverMeta}>
        생성일: {new Date(project.createdAt).toLocaleDateString("ko-KR")}
      </Text>
      <Text style={s.coverMeta}>
        내보내기: {new Date().toLocaleDateString("ko-KR")}
      </Text>
      <PageFooter />
    </Page>
  );
}

function OverviewPage({ project }: { project: Project }) {
  const d = project.phases.overview;
  const SCOPE_LABELS: Record<string, string> = { mvp: "MVP", full: "Full", prototype: "Prototype" };
  return (
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[0]} />
      <Text style={s.sectionTitle}>기획 개요</Text>
      <Text style={s.subTitle}>프로젝트명</Text>
      <Text style={s.paragraph}>{d.projectName || "-"}</Text>
      {d.elevatorPitch && (
        <>
          <Text style={s.subTitle}>한줄 소개</Text>
          <Text style={s.paragraph}>{d.elevatorPitch}</Text>
        </>
      )}
      <Text style={s.subTitle}>개발 배경</Text>
      <Text style={s.paragraph}>{d.background || "-"}</Text>
      {d.coreValueProposition && (
        <>
          <Text style={s.subTitle}>핵심 가치 제안</Text>
          <Text style={s.paragraph}>{d.coreValueProposition}</Text>
        </>
      )}
      <Text style={s.subTitle}>비즈니스 목표</Text>
      {d.businessGoals.filter(Boolean).map((g, i) => (
        <Text key={i} style={s.listItem}>• {g}</Text>
      ))}
      {d.businessGoals.filter(Boolean).length === 0 && <Text style={s.paragraph}>-</Text>}
      <Text style={s.subTitle}>타깃 유저</Text>
      <Text style={s.paragraph}>{d.targetUsers || "-"}</Text>
      {d.scope?.details && (
        <>
          <Text style={s.subTitle}>프로젝트 범위</Text>
          <Text style={s.badge}>{SCOPE_LABELS[d.scope.type] ?? d.scope.type}</Text>
          <Text style={s.paragraph}>{d.scope.details}</Text>
        </>
      )}
      {(d.competitors?.length ?? 0) > 0 && (
        <>
          <Text style={s.subTitle} minPresenceAhead={40}>경쟁사 / 대안</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableCellBold}>서비스명</Text>
              <Text style={s.tableCellBold}>강점</Text>
              <Text style={s.tableCellBold}>약점</Text>
            </View>
            {d.competitors!.map((c) => (
              <View key={c.id} style={s.tableRow} wrap={false}>
                <Text style={s.tableCell}>{c.name}</Text>
                <Text style={s.tableCell}>{c.strength}</Text>
                <Text style={s.tableCell}>{c.weakness}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      {(d.constraints?.length ?? 0) > 0 && (
        <>
          <Text style={s.subTitle}>제약사항</Text>
          {d.constraints!.filter(Boolean).map((c, i) => (
            <Text key={i} style={s.listItem}>• {c}</Text>
          ))}
        </>
      )}
      {(d.successMetrics?.length ?? 0) > 0 && (
        <>
          <Text style={s.subTitle} minPresenceAhead={40}>성공 지표</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableCellBold}>지표</Text>
              <Text style={s.tableCellBold}>목표</Text>
              <Text style={s.tableCellBold}>측정 방법</Text>
            </View>
            {d.successMetrics!.map((m) => (
              <View key={m.id} style={s.tableRow} wrap={false}>
                <Text style={s.tableCell}>{m.metric}</Text>
                <Text style={s.tableCell}>{m.target}</Text>
                <Text style={s.tableCell}>{m.measurement}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      {(d.timeline?.length ?? 0) > 0 && (
        <>
          <Text style={s.subTitle} minPresenceAhead={40}>일정</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableCellBold}>마일스톤</Text>
              <Text style={s.tableCellBold}>일정</Text>
              <Text style={s.tableCellBold}>설명</Text>
            </View>
            {d.timeline!.map((m) => (
              <View key={m.id} style={s.tableRow} wrap={false}>
                <Text style={s.tableCell}>{m.milestone}</Text>
                <Text style={s.tableCell}>{m.date}</Text>
                <Text style={s.tableCell}>{m.description}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      {(d.references?.length ?? 0) > 0 && (
        <>
          <Text style={s.subTitle}>참고 자료</Text>
          {d.references!.map((r) => (
            <Text key={r.id} style={s.listItem}>• {r.title}{r.notes ? ` — ${r.notes}` : ""}</Text>
          ))}
        </>
      )}
      {d.techStack && (
        <>
          <Text style={s.subTitle}>기술 스택</Text>
          <Text style={s.paragraph}>{d.techStack}</Text>
        </>
      )}
      <PageFooter />
    </Page>
  );
}

function UserScenarioPage({ project }: { project: Project }) {
  const d = project.phases.userScenario;
  return (
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[1]} />
      <Text style={s.sectionTitle}>유저 시나리오</Text>

      {d.personas.length > 0 && (
        <>
          <Text style={s.subTitle}>페르소나</Text>
          {d.personas.map((p) => (
            <View key={p.id} style={s.card} wrap={false}>
              <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{p.name} — {p.role}</Text>
              {p.painPoints.filter(Boolean).length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: "#666", marginBottom: 2 }}>페인 포인트:</Text>
                  {p.painPoints.filter(Boolean).map((pp, i) => (
                    <Text key={i} style={s.listItem}>• {pp}</Text>
                  ))}
                </>
              )}
              {p.goals.filter(Boolean).length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: "#666", marginBottom: 2 }}>목표:</Text>
                  {p.goals.filter(Boolean).map((g, i) => (
                    <Text key={i} style={s.listItem}>• {g}</Text>
                  ))}
                </>
              )}
            </View>
          ))}
        </>
      )}

      {d.userStories.length > 0 && (
        <>
          <Text style={s.subTitle}>유저 스토리</Text>
          {d.userStories.map((us) => (
            <View key={us.id} style={s.card} wrap={false}>
              <Text style={s.paragraph}>As a {us.asA || "..."}, I want {us.iWant || "..."}, So that {us.soThat || "..."}</Text>
            </View>
          ))}
        </>
      )}

      {d.successScenarios.filter(Boolean).length > 0 && (
        <>
          <Text style={s.subTitle}>성공 시나리오</Text>
          {d.successScenarios.filter(Boolean).map((sc, i) => (
            <Text key={i} style={s.listItem}>• {sc}</Text>
          ))}
        </>
      )}

      {d.failureScenarios.filter(Boolean).length > 0 && (
        <>
          <Text style={s.subTitle}>실패 시나리오</Text>
          {d.failureScenarios.filter(Boolean).map((sc, i) => (
            <Text key={i} style={s.listItem}>• {sc}</Text>
          ))}
        </>
      )}
      <PageFooter />
    </Page>
  );
}

function RequirementsPage({ project }: { project: Project }) {
  const d = project.phases.requirements;
  return (
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[2]} />
      <Text style={s.sectionTitle}>요구사항 명세</Text>

      {d.functional.length > 0 && (
        <>
          <Text style={s.subTitle} minPresenceAhead={40}>기능 요구사항</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>ID</Text>
              <Text style={s.tableCellBold}>제목</Text>
              <Text style={[s.tableCellBold, { flex: 2 }]}>설명</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>우선순위</Text>
            </View>
            {d.functional.map((r) => (
              <View key={r.id} style={s.tableRow} wrap={false}>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{r.id}</Text>
                <Text style={s.tableCell}>{r.title}</Text>
                <Text style={[s.tableCell, { flex: 2 }]}>{r.description}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{PRIORITY_LABELS[r.priority] ?? r.priority}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {d.nonFunctional.length > 0 && (
        <>
          <Text style={s.subTitle} minPresenceAhead={40}>비기능 요구사항</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>ID</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>카테고리</Text>
              <Text style={[s.tableCellBold, { flex: 2 }]}>설명</Text>
            </View>
            {d.nonFunctional.map((r) => (
              <View key={r.id} style={s.tableRow} wrap={false}>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{r.id}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{r.category}</Text>
                <Text style={[s.tableCell, { flex: 2 }]}>{r.description}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <PageFooter />
    </Page>
  );
}

function renderSitemapTree(nodes: Project["phases"]["infoArchitecture"]["sitemap"], depth = 0): React.JSX.Element[] {
  return nodes.flatMap((node) => [
    <Text key={node.id} style={[s.listItem, { paddingLeft: 12 + depth * 16 }]}>
      {"  ".repeat(depth)}{"├─ "}{node.label}{node.path ? ` (${node.path})` : ""}
    </Text>,
    ...renderSitemapTree(node.children, depth + 1),
  ]);
}

function InfoArchitecturePage({ project }: { project: Project }) {
  const d = project.phases.infoArchitecture;
  return (
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[3]} />
      <Text style={s.sectionTitle}>정보 구조</Text>

      {d.sitemap.length > 0 && (
        <>
          <Text style={s.subTitle}>사이트맵</Text>
          {renderSitemapTree(d.sitemap)}
          <View style={s.divider} />
        </>
      )}

      {d.userFlows.length > 0 && (
        <>
          <Text style={s.subTitle}>유저 플로우</Text>
          {d.userFlows.map((flow) => (
            <View key={flow.id} style={s.card} wrap={false}>
              <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{flow.name}</Text>
              {flow.steps.map((step, i) => (
                <Text key={step.id} style={s.listItem}>
                  {i + 1}. {step.action}{step.next.length > 0 ? ` → ${step.next.join(", ")}` : ""}
                </Text>
              ))}
            </View>
          ))}
        </>
      )}

      {d.globalNavRules.filter(Boolean).length > 0 && (
        <>
          <Text style={s.subTitle}>글로벌 네비게이션 규칙</Text>
          {d.globalNavRules.filter(Boolean).map((rule, i) => (
            <Text key={i} style={s.listItem}>• {rule}</Text>
          ))}
        </>
      )}
      <PageFooter />
    </Page>
  );
}

function ScreenDesignPage({ project }: { project: Project }) {
  const d = project.phases.screenDesign;

  return (
    <>
      {d.pages.map((page) => (
        <React.Fragment key={page.id}>
          <Page size="A4" orientation="landscape" style={s.page} wrap>
            <PageHeader projectName={project.name} phaseName={`${PHASE_LABELS[4]} — ${page.name || "이름 없음"}`} />
            <Text style={s.sectionTitle}>{page.name || "이름 없음"}{page.route ? ` (${page.route})` : ""}</Text>
            <View style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e5e5e5",
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 12, color: "#999" }}>화면 목업 (Placeholder)</Text>
            </View>
            <PageFooter />
          </Page>

          <Page size="A4" orientation="landscape" style={s.page} wrap>
            <PageHeader projectName={project.name} phaseName={`${PHASE_LABELS[4]} — ${page.name || "이름 없음"} (상세)`} />

            {(page.uxIntent.userGoal || page.uxIntent.businessIntent) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={s.subTitle}>UX 의도</Text>
                <View style={s.table}>
                  <View style={s.tableHeader}>
                    <Text style={s.tableCellBold}>유저 목표</Text>
                    <Text style={s.tableCellBold}>비즈니스 의도</Text>
                  </View>
                  <View style={s.tableRow}>
                    <Text style={s.tableCell}>{page.uxIntent.userGoal || "-"}</Text>
                    <Text style={s.tableCell}>{page.uxIntent.businessIntent || "-"}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <Text style={s.subTitle}>상태별 UI</Text>
              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={s.tableCellBold}>상태</Text>
                  <Text style={[s.tableCellBold, { flex: 3 }]}>설명</Text>
                </View>
                {page.states.idle ? (
                  <View style={s.tableRow}>
                    <Text style={s.tableCell}>Idle</Text>
                    <Text style={[s.tableCell, { flex: 3 }]}>{page.states.idle}</Text>
                  </View>
                ) : null}
                {page.states.loading ? (
                  <View style={s.tableRow}>
                    <Text style={s.tableCell}>Loading</Text>
                    <Text style={[s.tableCell, { flex: 3 }]}>{page.states.loading}</Text>
                  </View>
                ) : null}
                {page.states.offline ? (
                  <View style={s.tableRow}>
                    <Text style={s.tableCell}>Offline</Text>
                    <Text style={[s.tableCell, { flex: 3 }]}>{page.states.offline}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {page.states.errors.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={s.subTitle}>에러 상태</Text>
                <View style={s.table}>
                  <View style={s.tableHeader}>
                    <Text style={[s.tableCellBold, { flex: 0.5 }]}>타입</Text>
                    <Text style={[s.tableCellBold, { flex: 2 }]}>설명</Text>
                  </View>
                  {page.states.errors.map((err, i) => (
                    <View key={i} style={s.tableRow}>
                      <Text style={[s.tableCell, { flex: 0.5 }]}>{err.type}</Text>
                      <Text style={[s.tableCell, { flex: 2 }]}>{err.description}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {page.interactions.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={s.subTitle}>인터랙션</Text>
                <View style={s.table}>
                  <View style={s.tableHeader}>
                    <Text style={s.tableCellBold}>요소</Text>
                    <Text style={s.tableCellBold}>트리거</Text>
                    <Text style={s.tableCellBold}>액션</Text>
                  </View>
                  {page.interactions.map((ia, i) => (
                    <View key={i} style={s.tableRow}>
                      <Text style={s.tableCell}>{ia.element}</Text>
                      <Text style={s.tableCell}>{ia.trigger}</Text>
                      <Text style={s.tableCell}>{ia.action}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(page.inPages.filter(Boolean).length > 0 || page.outPages.filter(Boolean).length > 0) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={s.subTitle}>연결 페이지</Text>
                {page.inPages.filter(Boolean).length > 0 && (
                  <Text style={s.paragraph}>In: {page.inPages.filter(Boolean).join(", ")}</Text>
                )}
                {page.outPages.filter(Boolean).length > 0 && (
                  <Text style={s.paragraph}>Out: {page.outPages.filter(Boolean).join(", ")}</Text>
                )}
              </View>
            )}

            <PageFooter />
          </Page>
        </React.Fragment>
      ))}
    </>
  );
}

function DataModelPage({ project }: { project: Project }) {
  const d = project.phases.dataModel;
  return (
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[5]} />
      <Text style={s.sectionTitle}>데이터 모델</Text>

      <Text style={s.paragraph}>저장 전략: {d.storageStrategy}{d.storageNotes ? ` — ${d.storageNotes}` : ""}</Text>
      <View style={s.divider} />

      {d.entities.map((entity) => (
        <View key={entity.id} style={{ marginBottom: 12 }} wrap={false}>
          <Text style={s.subTitle}>{entity.name}</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableCellBold}>필드명</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>타입</Text>
              <Text style={[s.tableCellBold, { flex: 0.3 }]}>필수</Text>
              <Text style={[s.tableCellBold, { flex: 1.5 }]}>설명</Text>
            </View>
            {entity.fields.map((field, i) => (
              <View key={i} style={s.tableRow} wrap={false}>
                <Text style={s.tableCell}>{field.name}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>
                  {field.type}
                  {field.type === "relation" && field.relationTarget ? ` → ${field.relationTarget}` : ""}
                  {field.type === "relation" && field.relationType ? ` (${field.relationType})` : ""}
                </Text>
                <Text style={[s.tableCell, { flex: 0.3 }]}>{field.required ? "✓" : ""}</Text>
                <Text style={[s.tableCell, { flex: 1.5 }]}>
                  {field.description || ""}
                  {field.type === "enum" && field.enumValues?.length ? ` [${field.enumValues.join(", ")}]` : ""}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <PageFooter />
    </Page>
  );
}

function DesignSystemPage({ project }: { project: Project }) {
  const d = project.phases.designSystem;
  return (
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[6]} />
      <Text style={s.sectionTitle}>디자인 시스템 & UX 라이팅</Text>

      <Text style={s.subTitle}>Visual Theme</Text>
      <Text style={s.paragraph}>분위기: {d.visualTheme.mood || "-"}</Text>
      <Text style={s.paragraph}>밀도: {d.visualTheme.density} | 철학: {d.visualTheme.philosophy || "-"}</Text>
      <View style={s.divider} />

      {d.colorPalette.length > 0 && (
        <>
          <Text style={s.subTitle}>Color Palette</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableCellBold}>이름</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>Hex</Text>
              <Text style={[s.tableCellBold, { flex: 1.5 }]}>역할</Text>
            </View>
            {d.colorPalette.map((c, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={s.tableCell}>{c.name}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{c.hex}</Text>
                <Text style={[s.tableCell, { flex: 1.5 }]}>{c.role}</Text>
              </View>
            ))}
          </View>
          <View style={s.divider} />
        </>
      )}

      {d.typography.scale.length > 0 && (
        <>
          <Text style={s.subTitle}>Typography</Text>
          {d.typography.fontFamilies.map((f, i) => (
            <Text key={i} style={s.listItem}>• {f.role}: {f.family} ({f.fallback})</Text>
          ))}
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableCellBold}>레벨</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>크기</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>굵기</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>행간</Text>
            </View>
            {d.typography.scale.map((t, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={s.tableCell}>{t.name}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{t.size}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{t.weight}</Text>
                <Text style={[s.tableCell, { flex: 0.5 }]}>{t.lineHeight}</Text>
              </View>
            ))}
          </View>
          <View style={s.divider} />
        </>
      )}

      <Text style={s.subTitle}>UX 라이팅</Text>
      <Text style={s.paragraph}>톤 레벨: {d.uxWriting.toneLevel}/5 | 에러 메시지 스타일: {d.uxWriting.errorMessageStyle}</Text>
      {d.uxWriting.glossary.length > 0 && (
        <>
          <Text style={{ fontSize: 9, color: "#666", marginTop: 4, marginBottom: 2 }}>용어 사전:</Text>
          {d.uxWriting.glossary.map((g, i) => (
            <Text key={i} style={s.listItem}>• "{g.term}" 사용 (❌ "{g.avoid}"){g.context ? ` — ${g.context}` : ""}</Text>
          ))}
        </>
      )}
      <PageFooter />
    </Page>
  );
}

function PdfDocument({ project }: { project: Project }) {
  return (
    <Document
      title={`${project.name} 기획서`}
      author="vibable"
      subject={`${project.name} — ${TYPE_LABELS[project.type] ?? project.type} 기획서`}
    >
      <CoverPage project={project} />
      <OverviewPage project={project} />
      <UserScenarioPage project={project} />
      <RequirementsPage project={project} />
      <InfoArchitecturePage project={project} />
      <ScreenDesignPage project={project} />
      <DataModelPage project={project} />
      {project.type !== "cli" && <DesignSystemPage project={project} />}
    </Document>
  );
}

export async function generatePdfBlob(project: Project): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  return pdf(<PdfDocument project={project} />).toBlob();
}
