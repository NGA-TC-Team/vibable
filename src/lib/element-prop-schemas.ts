import type { MockupElementType } from "@/types/phases";

export interface PropField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: string[];
}

export const ELEMENT_PROP_SCHEMAS: Partial<Record<MockupElementType, PropField[]>> = {
  heading: [
    { key: "text", label: "텍스트", type: "text", placeholder: "제목 텍스트" },
  ],
  text: [
    { key: "text", label: "본문 텍스트", type: "text", placeholder: "본문 내용" },
  ],
  button: [
    { key: "text", label: "버튼 텍스트", type: "text", placeholder: "Click me" },
  ],
  input: [
    { key: "placeholder", label: "플레이스홀더", type: "text", placeholder: "입력 힌트" },
  ],
  image: [
    { key: "src", label: "이미지 URL", type: "text", placeholder: "https://..." },
    { key: "alt", label: "대체 텍스트", type: "text", placeholder: "이미지 설명" },
  ],
  chart: [
    { key: "dataSource", label: "데이터 참조", type: "text", placeholder: "엔티티명 또는 API 경로" },
    { key: "chartType", label: "차트 유형", type: "select", options: ["bar", "line", "pie", "area"] },
  ],
  badge: [
    { key: "text", label: "뱃지 텍스트", type: "text", placeholder: "Badge" },
  ],
  grid: [
    { key: "columns", label: "열 수", type: "number", placeholder: "2" },
    { key: "gap", label: "간격(px)", type: "number", placeholder: "8" },
  ],
  hstack: [
    { key: "gap", label: "간격(px)", type: "number", placeholder: "8" },
  ],
  vstack: [
    { key: "gap", label: "간격(px)", type: "number", placeholder: "8" },
  ],
  dropdown: [
    { key: "placeholder", label: "플레이스홀더", type: "text", placeholder: "Select..." },
  ],
  searchbar: [
    { key: "placeholder", label: "플레이스홀더", type: "text", placeholder: "Search..." },
  ],
  table: [
    { key: "dataSource", label: "데이터 참조", type: "text", placeholder: "엔티티명 또는 API 경로" },
  ],
  list: [
    { key: "dataSource", label: "데이터 참조", type: "text", placeholder: "엔티티명 또는 API 경로" },
  ],
  video: [
    { key: "src", label: "영상 URL", type: "text", placeholder: "https://..." },
  ],
  map: [
    { key: "location", label: "위치/주소", type: "text", placeholder: "서울특별시..." },
  ],
  form: [
    { key: "action", label: "제출 대상", type: "text", placeholder: "API 엔드포인트" },
  ],
  carousel: [
    { key: "dataSource", label: "데이터 참조", type: "text", placeholder: "이미지 목록 소스" },
  ],
  progressbar: [
    { key: "value", label: "진행률(%)", type: "number", placeholder: "60" },
  ],
};

export const LAYOUT_TYPES = new Set<MockupElementType>(["grid", "hstack", "vstack"]);
