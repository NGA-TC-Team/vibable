import { describe, it, expect } from "vitest";
import { exportFilenameTimestamp } from "../download";

describe("exportFilenameTimestamp", () => {
  it("정상: 날짜 구분자 콜론·점이 없는 문자열 반환", () => {
    const result = exportFilenameTimestamp();

    expect(result).not.toContain(":");
    expect(result).not.toContain(".");
  });

  it("정상: 길이가 정확히 19자임 (YYYY-MM-DDTHH-MM-SS)", () => {
    const result = exportFilenameTimestamp();

    expect(result).toHaveLength(19);
  });

  it("정상: 파일명에 허용되는 문자만 포함 (숫자, 하이픈, T)", () => {
    const result = exportFilenameTimestamp();

    expect(result).toMatch(/^[\d\-T]+$/);
  });

  it("엣지: 연속 호출 결과가 동일한 초 안에서 같거나 미래 값임", () => {
    const first = exportFilenameTimestamp();
    const second = exportFilenameTimestamp();

    // 어휘 순 정렬이 시간 순과 일치해야 함
    expect(second >= first).toBe(true);
  });

  it("형식: T 구분자를 포함한 ISO-like 포맷 확인", () => {
    const result = exportFilenameTimestamp();

    // 형식: 2026-04-17T15-22-08
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
  });
});
