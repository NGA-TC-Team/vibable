import { test, expect } from "@playwright/test";

test.use({
  permissions: ["clipboard-read", "clipboard-write"],
});

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createAndFillProject(page: import("@playwright/test").Page) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill("공유 테스트");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);

  await page.locator("#ov-project-name").fill("공유용 앱");
  await page.waitForTimeout(1000);
}

test.describe("프로젝트 공유 흐름", () => {
  test("공유 URL 생성 → 수신 → 읽기 전용", async ({ page, context }) => {
    await createAndFillProject(page);

    // 공유 버튼 클릭
    await page.getByRole("button", { name: "공유" }).click();
    await page.waitForTimeout(500);

    // 클립보드에서 URL 획득
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareUrl).toContain("/workspace/shared");

    // 새 페이지에서 공유 URL 열기
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);

    // 공유 페이지 확인 (name param = "공유 테스트")
    await expect(newPage.getByText("공유 테스트")).toBeVisible({ timeout: 15000 });

    // 읽기 전용 보기
    await newPage.getByRole("button", { name: /읽기 전용으로 보기/ }).click();
    await expect(newPage.getByText("읽기 전용")).toBeVisible();

    // 폼 필드 disabled 확인
    await expect(newPage.locator("#ov-project-name")).toBeDisabled();

    // 내보내기 버튼 존재 확인
    await expect(
      newPage.getByRole("button", { name: /내보내기/ }),
    ).toBeVisible();

    await newPage.close();
  });

  test("공유 URL → 복제", async ({ page, context }) => {
    await createAndFillProject(page);

    await page.getByRole("button", { name: "공유" }).click();
    await page.waitForTimeout(500);
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());

    const newPage = await context.newPage();
    await newPage.goto(shareUrl);

    await newPage.getByRole("button", { name: /내 워크스페이스에 복제/ }).click();
    await expect(newPage).toHaveURL(/\/workspace\/.+/);

    await newPage.close();
  });
});
