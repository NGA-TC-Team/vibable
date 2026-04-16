<p align="center">
  <img src="public/vibable-logo.png" width="128" height="128" alt="Vibable logo" />
</p>

<h1 align="center">Vibable</h1>

<p align="center">
  <strong>바이브코딩을 위한 7단계 소프트웨어 기획 도구</strong><br />
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

> **Vibable**은 AI 코딩(바이브코딩)에 넘기기 전, 소프트웨어 기획서를 체계적으로 작성할 수 있는 **로컬 우선 웹 에디터**입니다.
> 7단계 페이즈를 따라 기획하고, 완성된 결과물을 **JSON · PDF · DESIGN.md**로 내보내세요.
> 서버가 필요 없습니다 — 모든 데이터는 브라우저의 IndexedDB에 저장됩니다.

<br />

<!-- TODO: 실제 스크린샷으로 교체 -->
<!-- <p align="center">
  <img src="docs/screenshot.png" width="720" alt="Vibable screenshot" />
</p> -->

---

## Features

- **7단계 페이즈 에디터** — 기획 개요 → 유저 시나리오 → 요구사항 → 정보 구조 → 화면 설계 → 데이터 모델 → 디자인 시스템
- **실시간 미리보기** — React Flow 다이어그램, 드래그 앤 드롭 목업 빌더, 디바이스 프레임 프리뷰
- **다중 내보내기** — JSON(전체/페이즈별) · PDF · DESIGN.md를 한 번에
- **URL 공유** — lz-string 압축 링크로 기획서를 즉시 공유
- **100% 클라이언트 사이드** — IndexedDB(Dexie) 기반, 서버 불필요, 오프라인 사용 가능
- **다크 모드** — 시스템 테마 자동 감지, 수동 전환 지원

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
| Export     | [@react-pdf/renderer](https://react-pdf.org) · [lz-string](https://github.com/pieroxy/lz-string)                            |
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
│   ├── editor/           # 에디터 셸 (레이아웃, 페이즈 네비, 패널)
│   ├── phases/           # 페이즈별 입력 폼
│   ├── preview/          # 실시간 미리보기 (다이어그램, 목업, 디바이스 프레임)
│   ├── export/           # PDF · Markdown 생성기
│   ├── workspace/        # 프로젝트 목록 · 관리
│   └── ui/               # shadcn/ui 프리미티브
├── hooks/                # 커스텀 훅 (*.hook.ts)
├── services/
│   ├── store/            # Zustand 스토어
│   └── providers/        # React context providers
├── lib/
│   ├── schemas/          # Zod 스키마
│   ├── templates/        # 기본 데이터 템플릿
│   └── ...               # 유틸리티, 상수, DB
└── types/                # TypeScript 타입 정의
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
| **MIT**        | react, react-dom, next, zustand, zod, framer-motion, @xyflow/react, @dnd-kit/core, @dnd-kit/sortable, recharts, @react-pdf/renderer, @tanstack/react-query, tailwindcss, radix-ui, shadcn, sonner, vaul, cmdk, embla-carousel-react, nuqs, next-themes, react-resizable-panels, react-pdf, react-day-picker, lz-string, date-fns, clsx, tailwind-merge, dagre, input-otp, @base-ui/react, vitest, eslint |
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

[MIT](LICENSE) &copy; 2025 Vibable Contributors
