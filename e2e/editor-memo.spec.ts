import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

async function createProject(page: import("@playwright/test").Page) {
  await page.getByText("새 프로젝트").click();
  await page.getByLabel("프로젝트 이름").fill("메모 테스트");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page).toHaveURL(/\/workspace\/.+/);
}

test.describe("에디터 — 메모 CRUD", () => {
  test("메모 추가 → 편집 → 삭제", async ({ page }) => {
    await createProject(page);

    // 메모 모달 열기
    await page.getByRole("button", { name: /메모/ }).click();
    await expect(page.getByText("이 페이즈에 메모가 없습니다")).toBeVisible();

    // 새 메모 추가
    await page.getByRole("button", { name: "새 메모" }).click();
    await page.getByPlaceholder("메모를 입력하세요...").fill("테스트 메모 내용");

    // 모달 닫기 (ESC)
    await page.keyboard.press("Escape");

    // 메모 배지 카운트 확인
    const memoBadge = page.getByRole("button", { name: /메모/ }).locator("span").filter({ hasText: "1" });
    await expect(memoBadge).toBeVisible();

    // 모달 다시 열어 내용 확인
    await page.getByRole("button", { name: /메모/ }).click();
    await expect(
      page.getByPlaceholder("메모를 입력하세요..."),
    ).toHaveValue("테스트 메모 내용");

    // 메모 삭제
    await page.locator("button:has(svg.lucide-trash-2)").click();
    await expect(page.getByText("이 페이즈에 메모가 없습니다")).toBeVisible();
  });
});
