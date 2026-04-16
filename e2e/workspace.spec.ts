import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

test.describe("워크스페이스 기본 흐름", () => {
  test("프로젝트 생성 → 에디터 진입 → 워크스페이스 복귀 → 삭제", async ({
    page,
  }) => {
    // 새 프로젝트 생성
    await page.getByText("새 프로젝트").click();
    await page.getByLabel("프로젝트 이름").fill("테스트 프로젝트");
    await page.getByText("웹").first().click();
    await page.getByRole("button", { name: "생성" }).click();

    // 에디터 페이지 리다이렉트
    await expect(page).toHaveURL(/\/workspace\/.+/);
    await expect(page.getByText("테스트 프로젝트")).toBeVisible();

    // 워크스페이스로 복귀
    await page.getByRole("link", { name: /워크스페이스/ }).click();
    await expect(page).toHaveURL("/workspace");
    await expect(page.getByText("테스트 프로젝트")).toBeVisible();

    // 프로젝트 삭제 — kebab 메뉴 (MoreVertical icon button)
    await page.locator("[data-slot='card']").first().locator("button").first().click();
    await page.getByRole("menuitem", { name: "삭제" }).click();

    // AlertDialog 확인
    await page.getByRole("button", { name: "삭제" }).click();
    await expect(page.getByText("프로젝트가 삭제되었습니다")).toBeVisible();
  });
});
