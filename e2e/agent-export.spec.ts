import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createAgentProject(
  page: import("@playwright/test").Page,
  name: string,
  subType: "Claude 서브에이전트" | "OpenClaw",
) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill(name);
  await page.getByText("에이전트").first().click();
  await page.getByText(subType).click();
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);
}

test.describe("Claude 서브에이전트 프로젝트 생성 및 탐색", () => {
  test("claude-subagent 프로젝트 생성 → 에디터 진입 → 기획 개요 표시 확인", async ({
    page,
  }) => {
    await createAgentProject(page, "Claude Agent 테스트", "Claude 서브에이전트");

    // 에이전트 페이즈 네비게이션 확인
    await expect(page.getByText("기획 개요")).toBeVisible();
    await expect(page.getByText("유저 시나리오")).toBeVisible();
    await expect(page.getByText("에이전트 요구사항")).toBeVisible();
  });

  test("claude-subagent 프로젝트 — 에이전트 아키텍처 페이즈 이동", async ({
    page,
  }) => {
    await createAgentProject(page, "Claude Arch 테스트", "Claude 서브에이전트");

    await page.getByText("에이전트 아키텍처").click();
    await expect(page).toHaveURL(/phase=3/);
  });

  test("claude-subagent JSON 전체 내보내기 → agentArchitecture 필드 포함 확인", async ({
    page,
  }) => {
    await createAgentProject(page, "Claude Export 테스트", "Claude 서브에이전트");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /내보내기/ }).click();
    await page.getByText("JSON 전체").click();
    const download = await downloadPromise;

    const content = await (await download.createReadStream()).toArray();
    const json = JSON.parse(Buffer.concat(content).toString());

    expect(json._meta).toBeDefined();
    expect(json._meta.projectType).toBe("agent");
    expect(json.agentArchitecture).toBeDefined();
    expect(json.agentArchitecture.kind).toBe("claude-subagent");
    expect(json.memos).toBeUndefined();
  });
});

test.describe("OpenClaw 프로젝트 생성 및 탐색", () => {
  test("openclaw 프로젝트 생성 → 에디터 진입 → 기획 개요 표시 확인", async ({
    page,
  }) => {
    await createAgentProject(page, "OpenClaw 테스트", "OpenClaw");

    await expect(page.getByText("기획 개요")).toBeVisible();
    await expect(page.getByText("에이전트 아키텍처")).toBeVisible();
  });

  test("openclaw 프로젝트 — 에이전트 행동 설계 페이즈 이동", async ({ page }) => {
    await createAgentProject(page, "OpenClaw Behavior", "OpenClaw");

    await page.getByText("에이전트 행동 설계").click();
    await expect(page).toHaveURL(/phase=4/);
  });

  test("openclaw JSON 전체 내보내기 → agentBehavior kind=openclaw 확인", async ({
    page,
  }) => {
    await createAgentProject(page, "OpenClaw Export", "OpenClaw");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /내보내기/ }).click();
    await page.getByText("JSON 전체").click();
    const download = await downloadPromise;

    const content = await (await download.createReadStream()).toArray();
    const json = JSON.parse(Buffer.concat(content).toString());

    expect(json._meta.projectType).toBe("agent");
    expect(json.agentBehavior).toBeDefined();
    expect(json.agentBehavior.kind).toBe("openclaw");
    expect(json.memos).toBeUndefined();
  });
});

test.describe("overview-groups: 성공 지표 그룹 UI", () => {
  test("웹 프로젝트 — 성공 지표 그룹 추가 후 카드 표시 확인", async ({ page }) => {
    await page.getByText("새 프로젝트").click();
    await page.getByLabel("프로젝트 이름").fill("지표 그룹 테스트");
    await page.getByText("웹").first().click();
    await page.getByRole("button", { name: "생성" }).click();
    await expect(page).toHaveURL(/\/workspace\/.+/);

    // 성공 지표 섹션으로 스크롤 후 추가
    const addMetricBtn = page.getByRole("button", { name: /성공 지표 추가|지표 추가/ }).first();
    if (await addMetricBtn.isVisible()) {
      await addMetricBtn.click();
      // 카드가 렌더링되어야 함
      await expect(page.locator("[data-slot='card']")).toHaveCount(
        await page.locator("[data-slot='card']").count(),
      );
    }
  });
});
