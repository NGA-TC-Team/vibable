import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createProject(page: import("@playwright/test").Page) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill("네비 테스트");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);
}

test.describe("에디터 — 페이즈 네비게이션 + 자동 저장", () => {
  test("기획 개요 작성 → 페이즈 이동 → 새로고침 → 데이터 유지", async ({
    page,
  }) => {
    await createProject(page);

    // Phase 0 폼 작성
    await page.locator("#ov-project-name").fill("네비 프로젝트");
    await page.locator("#ov-background").fill("개발 배경 텍스트");
    await page.getByRole("button", { name: "추가" }).click();
    await page.getByPlaceholder("목표 1").fill("매출 100억");

    // 자동 저장 대기
    await page.waitForTimeout(1000);
    await expect(page.getByText("저장됨")).toBeVisible();

    // Phase 1 이동
    await page.getByText("유저 시나리오").click();
    await expect(page).toHaveURL(/phase=1/);

    // Phase 0 복귀 후 데이터 유지
    await page.getByText("기획 개요").click();
    await expect(page.locator("#ov-project-name")).toHaveValue("네비 프로젝트");
    await expect(page.locator("#ov-background")).toHaveValue(
      "개발 배경 텍스트",
    );

    // 새로고침 후 데이터 유지
    await page.reload();
    await expect(page.locator("#ov-project-name")).toHaveValue("네비 프로젝트");
  });
});
