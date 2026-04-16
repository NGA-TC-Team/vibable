<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Coding Style

- **함수형 코딩 스타일 준수**: 클래스 컴포넌트, 명령형 패턴 금지. 순수 함수, 불변 데이터, 선언적 패턴을 기본으로 한다. `for`/`while` 루프 대신 `map`/`filter`/`reduce` 사용. 부수효과는 명시적으로 분리한다.

## Testing

- **유닛 테스트**: Vitest 사용. 모든 순수 함수, 유틸, 커스텀 훅에 대해 유닛 테스트를 작성한다.
- **통합/E2E 테스트**: Playwright 사용. 주요 사용자 시나리오에 대해 통합 테스트를 작성한다.

## Page & Component Architecture

- **최상위 `page.tsx`에 `"use client"` 금지**: `page.tsx`는 Server Component로 유지한다. 클라이언트 로직이 필요하면 별도 컴포넌트(예: `{PageName}Client.tsx`)를 만들어 `page.tsx`에서 import하여 사용한다.

```
// ✅ Good
// app/dashboard/page.tsx (Server Component)
import { DashboardClient } from "./_components/DashboardClient";
export default function DashboardPage() {
  return <DashboardClient />;
}

// app/dashboard/_components/DashboardClient.tsx
"use client";
export function DashboardClient() { ... }

// ❌ Bad
// app/dashboard/page.tsx
"use client"; // 금지
export default function DashboardPage() { ... }
```

## Custom Hooks

- **훅은 반드시 `{name}.hook.ts` 파일로 분리**: 페이지나 컴포넌트 파일 안에 훅 로직을 직접 작성하지 않는다. 커스텀 훅을 `{name}.hook.ts` 파일로 만들어 import하여 사용한다.

```
// ✅ Good
// hooks/use-dashboard.hook.ts
export function useDashboard() { ... }

// _components/DashboardClient.tsx
import { useDashboard } from "@/hooks/use-dashboard.hook";

// ❌ Bad
// _components/DashboardClient.tsx
function DashboardClient() {
  const [state, setState] = useState(...); // 훅 로직을 컴포넌트에 직접 작성
  useEffect(() => { ... }, []);
  ...
}
```
