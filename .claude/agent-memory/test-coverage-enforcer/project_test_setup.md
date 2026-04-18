---
name: Project test setup
description: bun test(내장 러너)와 bun run test(vitest run) 구분, vitest.config include 범위
type: project
---

`bun test`는 Bun 내장 테스트 러너로 vitest.config.ts를 무시하고 프로젝트 전체의 *.test.ts/*.spec.ts를 찾는다.
올바른 유닛 테스트 실행 명령어는 `bun run test` (→ `vitest run`)이다.

**Why:** vitest.config.ts의 `include: ["src/**/*.test.ts"]` 설정이 있어도 `bun test`로는 e2e/*.spec.ts까지 로딩되어 Playwright 관련 에러가 발생한다.

**How to apply:** 유닛 테스트 실행 시 항상 `bun run test`를 사용한다. e2e 테스트는 `bun run test:e2e` (playwright test).
