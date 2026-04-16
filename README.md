<p align="center">
  <img src="public/vibable-logo.png" width="128" height="128" alt="Vibable logo" />
</p>

<h1 align="center">Vibable</h1>

<p align="center">
  <strong>바이브코딩·에이전트 설계를 위한 7단계 기획 도구</strong><br />
  <em>Plan it before you prompt it.</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm&logoColor=white" alt="pnpm 10" />
</p>

<br />

> **Vibable**은 AI 코딩(바이브코딩)이나 **Claude Subagent / OpenClaw** 스택으로 넘기기 전, 기획서를 체계적으로 적을 수 있는 **로컬 우선 웹 에디터**입니다.
> 프로젝트 유형에 따라 **앱 기획 트랙**(웹 · 모바일 · CLI)과 **AI 에이전트 트랙** 중 하나의 7단계 페이즈가 열립니다.
> **JSON**(전체·현재 페이즈) · **PDF** · **DESIGN.md**(웹/모바일)에 더해, 에이전트 프로젝트는 **번들 ZIP**(Claude용 / OpenClaw 워크스페이스용)과 에디터의 **페이즈별 마크다운**(복사·다운로드)을 쓸 수 있습니다.
> 서버가 필요 없습니다 — 모든 데이터는 브라우저의 IndexedDB에 저장됩니다.

<br />

<!-- TODO: 실제 스크린샷으로 교체 -->
<!-- <p align="center">
  <img src="docs/screenshot.png" width="720" alt="Vibable screenshot" />
</p> -->

---

## Features

- **프로젝트 유형** — 웹 · 모바일 · CLI · **AI 에이전트**(생성 시 **Claude Subagent** 또는 **OpenClaw** 선택)
- **7단계 페이즈 (앱 트랙)** — 기획 개요 → 유저 시나리오 → 요구사항 → 정보 구조 → 화면 설계 → 데이터 모델 → 디자인 시스템
- **7단계 페이즈 (에이전트 트랙)** — 기획 개요 → 유저 시나리오 → 에이전트 요구사항 → 아키텍처 → 행동 설계 → 연동·도구 → 안전·테스트
- **실시간 미리보기** — React Flow, 목업·디바이스 프레임(앱); 에이전트는 페이즈별 전용 프리뷰
- **보내기** — JSON · PDF · DESIGN.md(웹/모바일만); 에이전트는 **에이전트 번들 ZIP** + **현재 페이즈 마크다운**
- **URL 공유** — lz-string 압축 링크로 기획서를 즉시 공유
- **100% 클라이언트 사이드** — IndexedDB(Dexie), 오프라인 사용 가능
- **다크 모드** — 시스템 연동 및 수동 전환

---

## Tech Stack

| 영역       | 기술                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) · [React 19](https://react.dev)                                                            |
| Language   | [TypeScript 5](https://typescriptlang.org)                                                                                  |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com)                                              |
| State      | [Zustand](https://github.com/pmndrs/zustand) · [TanStack Query](https://tanstack.com/query) · [nuqs](https://nuqs.47ng.com) |
| Storage    | [Dexie](https://dexie.org) (IndexedDB)                                                                                      |
| Diagrams   | [React Flow](https://reactflow.dev) · [dagre](https://github.com/dagrejs/dagre)                                             |
| DnD        | [dnd-kit](https://dndkit.com)                                                                                               |
| Animation  | [Framer Motion](https://www.framer.com/motion)                                                                              |
| Charts     | [Recharts](https://recharts.org)                                                                                            |
| Validation | [Zod](https://zod.dev)                                                                                                      |
| Export     | [@react-pdf/renderer](https://react-pdf.org) · [lz-string](https://github.com/pieroxy/lz-string) · [fflate](https://github.com/101arrowz/fflate) (ZIP) |
| Testing    | [Vitest](https://vitest.dev) · [Playwright](https://playwright.dev)                                                         |

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+

### Installation

```bash
# 저장소 클론
git clone https://github.com/user/vibable.git
cd vibable

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 바로 사용할 수 있습니다.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router (pages, layout, metadata)
├── components/
│   ├── editor/           # 에디터 셸 (레이아웃, 페이즈 네비, 사이드바, 보내기 UI)
│   ├── phases/           # 페이즈별 폼 (앱 + 에이전트·Claude·OpenClaw 전용 폼 포함)
│   ├── preview/          # 미리보기 (다이어그램, 목업, 에이전트 페이즈 프리뷰)
│   ├── export/           # PDF, DESIGN.md, 페이즈 MD, Claude/OpenClaw ZIP 생성
│   ├── workspace/        # 프로젝트 목록 · 생성/수정/가져오기
│   └── ui/               # shadcn/ui 프리미티브
├── hooks/                # 커스텀 훅 (*.hook.ts)
├── services/
│   ├── store/            # Zustand 스토어
│   └── providers/        # React context providers
├── lib/
│   ├── schemas/          # Zod 스키마 (앱 도메인 + 에이전트 페이즈)
│   ├── templates/        # 프로젝트 타입별 기본 템플릿
│   ├── agent-zip.ts      # 에이전트 번들 ZIP 유틸
│   └── ...               # export 범위, 페이즈 맵, 상수, DB
└── types/                # TypeScript 타입 (ProjectType, PhaseData 등)
```

---

## Scripts

| 설명                  | pnpm              | npm                   | yarn              | bun               |
| --------------------- | ----------------- | --------------------- | ----------------- | ----------------- |
| 개발 서버 실행        | `pnpm dev`        | `npm run dev`         | `yarn dev`        | `bun run dev`     |
| 프로덕션 빌드         | `pnpm build`      | `npm run build`       | `yarn build`      | `bun run build`   |
| 프로덕션 서버 실행    | `pnpm start`      | `npm start`           | `yarn start`      | `bun run start`   |
| ESLint 실행           | `pnpm lint`       | `npm run lint`        | `yarn lint`       | `bun run lint`    |
| Vitest 유닛 테스트    | `pnpm test`       | `npm test`            | `yarn test`       | `bun run test`    |
| Vitest 워치 모드      | `pnpm test:watch` | `npm run test:watch` | `yarn test:watch` | `bun run test:watch` |
| Playwright E2E 테스트 | `pnpm test:e2e`   | `npm run test:e2e`   | `yarn test:e2e`   | `bun run test:e2e` |
| 유닛 + E2E 전체 실행  | `pnpm test:all`   | `npm run test:all`   | `yarn test:all`   | `bun run test:all` |

---

## Third-Party Licenses

이 프로젝트에서 사용하는 주요 오픈소스 라이브러리와 라이선스입니다.

| License        | Packages                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MIT**        | react, react-dom, next, zustand, zod, framer-motion, @xyflow/react, @dnd-kit/core, @dnd-kit/sortable, recharts, @react-pdf/renderer, @tanstack/react-query, tailwindcss, radix-ui, shadcn, sonner, vaul, cmdk, embla-carousel-react, nuqs, next-themes, react-resizable-panels, react-pdf, react-day-picker, lz-string, date-fns, clsx, tailwind-merge, dagre, input-otp, @base-ui/react, fflate, vitest, eslint |
| **Apache-2.0** | class-variance-authority, dexie, @playwright/test, typescript                                                                                                                                                                                                                                                                                                                                            |
| **ISC**        | lucide-react                                                                                                                                                                                                                                                                                                                                                                                             |

---

## Contributing

기여를 환영합니다! 다음 규칙을 지켜주세요:

1. 이슈를 먼저 열어 변경 사항을 논의해 주세요.
2. 코드 스타일은 프로젝트의 ESLint / Prettier 설정을 따릅니다.
3. 모든 순수 함수와 유틸에는 Vitest 테스트를 작성합니다.
4. 함수형 코딩 스타일을 준수합니다 — 클래스 컴포넌트, 명령형 패턴은 사용하지 않습니다.

---

## License

[MIT](LICENSE) &copy; 2026 Vibable Contributors
