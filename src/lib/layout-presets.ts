import type { LayoutPresetKey, LayoutViewportWidths } from "@/types/phases";

export interface LayoutPreset {
  key: LayoutPresetKey;
  label: string;
  description: string;
  /** Custom은 유저가 직접 지정하므로 빌트인 값이 없다. */
  widths: LayoutViewportWidths | null;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    key: "mobile-first",
    label: "Mobile-first",
    description: "모바일을 기준으로 설계하고, 큰 화면에서도 콘텐츠 폭을 보수적으로 유지.",
    widths: { mobile: 360, tablet: 640, desktop: 840 },
  },
  {
    key: "saas",
    label: "SaaS",
    description: "일반 SaaS 대시보드/관리 콘솔 기준. 본문 영역 너비를 중간 정도로 잡는다.",
    widths: { mobile: 360, tablet: 720, desktop: 1080 },
  },
  {
    key: "dashboard",
    label: "Dashboard",
    description: "데이터 밀도가 높은 대시보드. 데스크톱에서 넓은 콘텐츠 영역 사용.",
    widths: { mobile: 360, tablet: 768, desktop: 1440 },
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "랜딩/마케팅 페이지. 히어로/섹션 구성을 위한 여유 있는 너비.",
    widths: { mobile: 360, tablet: 768, desktop: 1200 },
  },
  {
    key: "custom",
    label: "Custom",
    description: "프로젝트별로 3뷰포트 너비를 직접 지정.",
    widths: null,
  },
];

export const DEFAULT_CUSTOM_WIDTHS: LayoutViewportWidths = {
  mobile: 360,
  tablet: 720,
  desktop: 1120,
};

export function getPresetByKey(key: LayoutPresetKey | undefined): LayoutPreset | null {
  if (!key) return null;
  return LAYOUT_PRESETS.find((preset) => preset.key === key) ?? null;
}

/**
 * 저장된 프리셋 키와 customWidths를 가지고 실제 뷰포트별 너비를 결정한다.
 * 우선순위: presetKey='custom'이면 customWidths → 없으면 DEFAULT_CUSTOM_WIDTHS,
 * 외 프리셋이면 해당 프리셋 값, 모두 없으면 null.
 */
export function resolveLayoutWidths(
  presetKey: LayoutPresetKey | undefined,
  customWidths: LayoutViewportWidths | undefined,
): LayoutViewportWidths | null {
  if (!presetKey) return null;
  if (presetKey === "custom") {
    return customWidths ?? DEFAULT_CUSTOM_WIDTHS;
  }
  const preset = getPresetByKey(presetKey);
  return preset?.widths ?? null;
}
