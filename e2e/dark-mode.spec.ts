import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

test.describe("다크 모드 전환", () => {
  test("라이트 → 다크 모드 전환 시 UI 정상 렌더링", async ({ page }) => {
    // 다크 모드 토글 (sr-only "Toggle theme")
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByText("Dark").click();

    // html 요소에 dark 클래스
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 프로젝트 생성
    await page.getByText("새 프로젝트").click();
    await page.getByLabel("프로젝트 이름").fill("다크모드 테스트");
    await page.getByRole("button", { name: "생성" }).click();
    await expect(page).toHaveURL(/\/workspace\/.+/);

    // 에디터 레이아웃 정상 렌더링 확인
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByText("다크모드 테스트")).toBeVisible();

    // 라이트 모드 복귀
    await page.goBack();
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByText("Light").click();
    await expect(page.locator("html")).toHaveClass(/light/);
  });
});
