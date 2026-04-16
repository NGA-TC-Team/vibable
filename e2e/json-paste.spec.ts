import { test, expect } from "@playwright/test";

test.use({
  permissions: ["clipboard-read", "clipboard-write"],
});

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createProject(page: import("@playwright/test").Page) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill("붙여넣기 테스트");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);
}

test.describe("JSON 붙여넣기 자동 채우기", () => {
  test("유효한 JSON 붙여넣기 → 폼 자동 채우기", async ({ page }) => {
    await createProject(page);

    const validJson = JSON.stringify({
      projectName: "붙여넣기 앱",
      background: "JSON으로 채워진 배경",
      businessGoals: ["목표1"],
      targetUsers: "개발자",
      techStack: "React",
    });

    // 클립보드에 JSON 복사 후 붙여넣기
    await page.evaluate((json) => {
      navigator.clipboard.writeText(json);
    }, validJson);
    await page.waitForTimeout(200);
    await page.keyboard.press("ControlOrMeta+KeyV");

    // 토스트 확인
    await expect(page.getByText("AI 응답이 적용되었습니다")).toBeVisible({
      timeout: 5000,
    });

    // 폼 필드 검증
    await expect(page.locator("#ov-project-name")).toHaveValue("붙여넣기 앱");
  });

  test("잘못된 JSON 붙여넣기 → 토스트 없음", async ({ page }) => {
    await createProject(page);

    await page.evaluate(() => {
      navigator.clipboard.writeText("not valid json {{{");
    });
    await page.waitForTimeout(200);
    await page.keyboard.press("ControlOrMeta+KeyV");

    // 토스트가 나타나지 않음
    await page.waitForTimeout(2000);
    await expect(
      page.getByText("AI 응답이 적용되었습니다"),
    ).not.toBeVisible();
  });
});
