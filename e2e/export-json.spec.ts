import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createAndFillProject(page: import("@playwright/test").Page) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill("익스포트 테스트");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);

  await page.locator("#ov-project-name").fill("익스포트 앱");
  await page.waitForTimeout(1000);
}

test.describe("JSON 내보내기", () => {
  test("JSON 전체 내보내기 → 파일 내용 검증", async ({ page }) => {
    await createAndFillProject(page);

    // 내보내기 드롭다운 열기
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /내보내기/ }).click();
    await page.getByText("JSON 전체").click();
    const download = await downloadPromise;

    // 다운로드 파일 검증
    const content = await (await download.createReadStream()).toArray();
    const json = JSON.parse(Buffer.concat(content).toString());

    expect(json._meta).toBeDefined();
    expect(json._meta.appVersion).toBeDefined();
    expect(json.overview.projectName).toBe("익스포트 앱");
    expect(json.memos).toBeUndefined();
  });

  test("개별 페이즈 JSON 내보내기", async ({ page }) => {
    await createAndFillProject(page);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /내보내기/ }).click();
    await page.getByText(/JSON — 기획 개요/).click();
    const download = await downloadPromise;

    const content = await (await download.createReadStream()).toArray();
    const json = JSON.parse(Buffer.concat(content).toString());

    expect(json._meta).toBeDefined();
    expect(json._meta.phase).toBe("overview");
    expect(json.overview).toBeDefined();
  });
});
