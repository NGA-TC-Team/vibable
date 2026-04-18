import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workspace");
  await page.evaluate(() => indexedDB.deleteDatabase("vibable"));
  await page.reload();
});

test.describe("아이디어 노트", () => {
  test("프로젝트 생성 → 아이디어 노트 진입 → 노트 노드 추가", async ({
    page,
  }) => {
    await page.getByText("새 프로젝트").click();
    await page.getByLabel("프로젝트 이름").fill("아이디어 테스트");
    await page.getByText("웹").first().click();
    await page.getByRole("button", { name: "생성" }).click();

    await expect(page).toHaveURL(/\/workspace\/.+/);

    // 에디터 헤더의 "아이디어 노트" 버튼 클릭
    // 사이드바 phase-nav 최상단의 "아이디어 노트" 링크
    await page.getByRole("link", { name: "아이디어 노트" }).click();

    // idea-note 라우트로 이동 + 루트 보드로 리다이렉트
    await expect(page).toHaveURL(/\/idea-note\/.+/);

    // 온보딩 샘플 노드가 보인다
    await expect(page.getByText("환영합니다")).toBeVisible();

    // 노트 도구 선택 후 빈 공간 클릭으로 노트 추가
    await page.getByRole("button", { name: "노트" }).click();

    const canvasArea = page.locator(".react-flow__pane").first();
    await canvasArea.click({ position: { x: 400, y: 400 } });

    // 추가 후 툴이 select로 자동 복귀(인디케이터 확인)
    await expect(page.getByText(/저장/)).toBeVisible({ timeout: 2000 });
  });

  test("에디터로 돌아가기", async ({ page }) => {
    await page.getByText("새 프로젝트").click();
    await page.getByLabel("프로젝트 이름").fill("복귀 테스트");
    await page.getByText("웹").first().click();
    await page.getByRole("button", { name: "생성" }).click();

    // 사이드바 phase-nav 최상단의 "아이디어 노트" 링크
    await page.getByRole("link", { name: "아이디어 노트" }).click();
    await expect(page).toHaveURL(/\/idea-note\/.+/);

    // 탑바의 "에디터로" 버튼
    await page.getByRole("link", { name: /에디터로/ }).click();
    await expect(page).not.toHaveURL(/\/idea-note\//);
  });
});
