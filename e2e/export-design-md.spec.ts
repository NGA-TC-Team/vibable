import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createProject(page: import("@playwright/test").Page) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill("디자인MD 테스트");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);
}

test.describe("DESIGN.md 내보내기", () => {
  test("디자인 시스템 페이즈 → DESIGN.md 다운로드", async ({ page }) => {
    await createProject(page);

    // Phase 6 (디자인 시스템) 이동
    await page.getByText("디자인 시스템").click();
    await expect(page).toHaveURL(/phase=6/);

    // DESIGN.md 내보내기
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /내보내기/ }).click();
    await page.getByText("DESIGN.md").click();
    const download = await downloadPromise;

    // 파일 이름 확인
    expect(download.suggestedFilename()).toBe("DESIGN.md");

    // 파일 내용 검증
    const content = await (await download.createReadStream()).toArray();
    const md = Buffer.concat(content).toString();

    expect(md).toContain("# DESIGN.md");
    for (let i = 1; i <= 9; i++) {
      expect(md).toContain(`## ${i}.`);
    }
  });
});
