import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createProjectWithOverview(
  page: import("@playwright/test").Page,
  name: string,
  overview: string,
) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill(name);
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);

  await page.locator("#ov-project-name").fill(overview);
  await page.waitForTimeout(1000);
}

test.describe("다중 프로젝트 데이터 격리", () => {
  test("프로젝트 A/B 간 전환 시 데이터 격리", async ({ page }) => {
    // 프로젝트 A 생성
    await createProjectWithOverview(page, "프로젝트 A", "프로젝트 A 내용");
    await page.getByRole("link", { name: /워크스페이스/ }).click();

    // 프로젝트 B 생성
    await createProjectWithOverview(page, "프로젝트 B", "프로젝트 B 내용");
    await page.getByRole("link", { name: /워크스페이스/ }).click();

    // 프로젝트 A 확인
    await page.getByText("프로젝트 A").first().click();
    await expect(page.locator("#ov-project-name")).toHaveValue(
      "프로젝트 A 내용",
    );

    await page.getByRole("link", { name: /워크스페이스/ }).click();

    // 프로젝트 B 확인
    await page.getByText("프로젝트 B").first().click();
    await expect(page.locator("#ov-project-name")).toHaveValue(
      "프로젝트 B 내용",
    );
  });
});
