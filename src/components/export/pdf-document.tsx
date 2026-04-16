"use client";

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
  family: "Pretendard",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Regular.subset.woff2",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.subset.woff2",
      fontWeight: 700,
    },
  ],
});

const s = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
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
    fontFamily: "Pretendard",
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
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[0]} />
      <Text style={s.sectionTitle}>기획 개요</Text>
      <Text style={s.subTitle}>프로젝트명</Text>
      <Text style={s.paragraph}>{d.projectName || "-"}</Text>
      <Text style={s.subTitle}>개발 배경</Text>
      <Text style={s.paragraph}>{d.background || "-"}</Text>
      <Text style={s.subTitle}>비즈니스 목표</Text>
      {d.businessGoals.filter(Boolean).map((g, i) => (
        <Text key={i} style={s.listItem}>• {g}</Text>
      ))}
      {d.businessGoals.filter(Boolean).length === 0 && <Text style={s.paragraph}>-</Text>}
      <Text style={s.subTitle}>타깃 유저</Text>
      <Text style={s.paragraph}>{d.targetUsers || "-"}</Text>
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
          <Text style={s.subTitle}>기능 요구사항</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>ID</Text>
              <Text style={s.tableCellBold}>제목</Text>
              <Text style={[s.tableCellBold, { flex: 2 }]}>설명</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>우선순위</Text>
            </View>
            {d.functional.map((r) => (
              <View key={r.id} style={s.tableRow}>
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
          <Text style={s.subTitle}>비기능 요구사항</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>ID</Text>
              <Text style={[s.tableCellBold, { flex: 0.5 }]}>카테고리</Text>
              <Text style={[s.tableCellBold, { flex: 2 }]}>설명</Text>
            </View>
            {d.nonFunctional.map((r) => (
              <View key={r.id} style={s.tableRow}>
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
    <Page size="A4" orientation="landscape" style={s.page} wrap>
      <PageHeader projectName={project.name} phaseName={PHASE_LABELS[4]} />
      <Text style={s.sectionTitle}>화면 설계</Text>

      {d.pages.map((page) => (
        <View key={page.id} style={s.card} wrap={false}>
          <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
            {page.name}{page.route ? ` (${page.route})` : ""}
          </Text>
          {(page.uxIntent.userGoal || page.uxIntent.businessIntent) && (
            <Text style={s.paragraph}>
              유저 목표: {page.uxIntent.userGoal || "-"} | 비즈니스 의도: {page.uxIntent.businessIntent || "-"}
            </Text>
          )}
          {page.states.idle && <Text style={s.listItem}>• Idle: {page.states.idle}</Text>}
          {page.states.loading && <Text style={s.listItem}>• Loading: {page.states.loading}</Text>}
          {page.states.offline && <Text style={s.listItem}>• Offline: {page.states.offline}</Text>}
          {page.states.errors.length > 0 && page.states.errors.map((err, i) => (
            <Text key={i} style={s.listItem}>• Error ({err.type}): {err.description}</Text>
          ))}
          {page.interactions.length > 0 && (
            <>
              <Text style={{ fontSize: 9, color: "#666", marginTop: 4, marginBottom: 2 }}>인터랙션:</Text>
              {page.interactions.map((ia, i) => (
                <Text key={i} style={s.listItem}>• {ia.element} → {ia.trigger} → {ia.action}</Text>
              ))}
            </>
          )}
        </View>
      ))}
      <PageFooter />
    </Page>
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
              <View key={i} style={s.tableRow}>
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
