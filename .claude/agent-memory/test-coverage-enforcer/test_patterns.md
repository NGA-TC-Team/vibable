---
name: Test patterns
description: 이 프로젝트의 반복 테스트 패턴 — 팩토리 함수, 스키마 기반 픽스처, generator 테스트
type: project
---

## 픽스처 팩토리 패턴
- `makeProject()`, `makeOverview()` 같은 팩토리 함수를 테스트 파일 상단에 정의
- Zod 스키마의 `schema.parse({})` 로 기본값을 생성하고 overrides로 커스터마이징
- `createDefaultPhaseData()`, `createAgentProjectPhaseData("claude-subagent"|"openclaw")` 활용

## discriminatedUnion 스키마 주의
- agentArchitecture, agentBehavior, agentTools는 `kind` 필드로 분기되는 discriminatedUnion
- 테스트 픽스처 작성 시 `kind` 필드를 반드시 포함해야 함
- openclaw 계열은 `createAgentProjectPhaseData("openclaw")`로 초기화

## generator 함수 테스트 전략
- 반환값이 `Record<string, string>` 형식인 경우: 파일 키 존재 여부 + 내용 substring 검증
- JSON snippet 파일: `JSON.parse(result["*.json.snippet"])` 후 구조 검증
- 에러 케이스: kind 불일치 시 단일 README/힌트 파일만 반환하는 패턴

## 불변성 검증
- 함수 호출 전 원본 객체/배열의 스냅샷을 저장 후 함수 실행, 원본과 비교
- 스프레드 연산자·flatMap 기반의 순수 함수는 원본 참조 변경 없음을 검증

## 테스트 실행 제외 대상 (현재 커버 어려운 것들)
- `downloadBlob` — document.createElement 부수효과 포함
- React 커스텀 훅 — @testing-library/react 별도 설정 필요
- `agent-zip.ts` — fflate + Blob/URL API 복합 의존
