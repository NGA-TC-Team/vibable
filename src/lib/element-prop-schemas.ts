import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Columns3,
  FileInput,
  GalleryHorizontal,
  Heading,
  ImageIcon,
  LayoutGrid,
  Loader,
  MapPin,
  Rows3,
  Search,
  Table2,
  TextCursorInput,
  Type,
  Video,
} from "lucide-react";
import type { MockupElementType } from "@/types/phases";

export interface PropField {
  key: string;
  label: string;
  icon?: LucideIcon;
  tooltip?: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: string[];
}

export const ELEMENT_PROP_SCHEMAS: Partial<Record<MockupElementType, PropField[]>> = {
  heading: [
    { key: "text", label: "텍스트", icon: Heading, tooltip: "헤딩에서 가장 강조할 제목 문구입니다.", type: "text", placeholder: "제목 텍스트" },
  ],
  text: [
    { key: "text", label: "본문 텍스트", icon: Type, tooltip: "설명 문단이나 보조 카피 내용을 적습니다.", type: "text", placeholder: "본문 내용" },
  ],
  button: [
    { key: "text", label: "버튼 텍스트", icon: TextCursorInput, tooltip: "버튼 안에 보이는 CTA 문구입니다.", type: "text", placeholder: "Click me" },
  ],
  input: [
    { key: "placeholder", label: "플레이스홀더", icon: TextCursorInput, tooltip: "입력 전 상태에서 보이는 예시 문구입니다.", type: "text", placeholder: "입력 힌트" },
  ],
  image: [
    { key: "src", label: "이미지 URL", icon: ImageIcon, tooltip: "참조할 이미지 주소 또는 에셋 경로입니다.", type: "text", placeholder: "https://..." },
    { key: "alt", label: "대체 텍스트", icon: Type, tooltip: "이미지 의미를 설명하는 접근성용 텍스트입니다.", type: "text", placeholder: "이미지 설명" },
  ],
  chart: [
    { key: "dataSource", label: "데이터 참조", icon: Table2, tooltip: "차트가 어떤 데이터 집합을 보여주는지 연결합니다.", type: "text", placeholder: "엔티티명 또는 API 경로" },
    { key: "chartType", label: "차트 유형", icon: BarChart3, tooltip: "데이터 표현 방식에 맞는 차트 타입을 고릅니다.", type: "select", options: ["bar", "line", "pie", "area"] },
  ],
  badge: [
    { key: "text", label: "뱃지 텍스트", icon: Type, tooltip: "짧은 상태 라벨이나 강조 문구입니다.", type: "text", placeholder: "Badge" },
  ],
  grid: [
    { key: "columns", label: "열 수", icon: LayoutGrid, tooltip: "한 줄에 배치할 컬럼 개수입니다.", type: "number", placeholder: "2" },
    { key: "gap", label: "간격(px)", icon: Columns3, tooltip: "각 셀 사이의 수평/수직 여백입니다.", type: "number", placeholder: "12" },
  ],
  hstack: [
    { key: "gap", label: "간격(px)", icon: Columns3, tooltip: "가로로 쌓인 요소들 사이의 거리입니다.", type: "number", placeholder: "12" },
  ],
  vstack: [
    { key: "gap", label: "간격(px)", icon: Rows3, tooltip: "세로로 쌓인 요소들 사이의 거리입니다.", type: "number", placeholder: "12" },
  ],
  dropdown: [
    { key: "placeholder", label: "플레이스홀더", icon: TextCursorInput, tooltip: "선택 전 기본 안내 문구입니다.", type: "text", placeholder: "Select..." },
  ],
  searchbar: [
    { key: "placeholder", label: "플레이스홀더", icon: Search, tooltip: "검색 전 상태에서 보이는 예시 키워드입니다.", type: "text", placeholder: "Search..." },
  ],
  table: [
    { key: "dataSource", label: "데이터 참조", icon: Table2, tooltip: "표가 참조하는 데이터 소스입니다.", type: "text", placeholder: "엔티티명 또는 API 경로" },
  ],
  list: [
    { key: "dataSource", label: "데이터 참조", icon: Table2, tooltip: "리스트를 채울 데이터 소스입니다.", type: "text", placeholder: "엔티티명 또는 API 경로" },
  ],
  video: [
    { key: "src", label: "영상 URL", icon: Video, tooltip: "삽입할 영상 주소 또는 미디어 경로입니다.", type: "text", placeholder: "https://..." },
  ],
  map: [
    { key: "location", label: "위치/주소", icon: MapPin, tooltip: "지도에 표시할 위치 또는 주소 정보입니다.", type: "text", placeholder: "서울특별시..." },
  ],
  form: [
    { key: "action", label: "제출 대상", icon: FileInput, tooltip: "폼 제출 시 연결될 목적지나 엔드포인트입니다.", type: "text", placeholder: "API 엔드포인트" },
  ],
  carousel: [
    { key: "dataSource", label: "데이터 참조", icon: GalleryHorizontal, tooltip: "캐러셀에 순서대로 노출할 이미지 또는 카드 소스입니다.", type: "text", placeholder: "이미지 목록 소스" },
  ],
  progressbar: [
    { key: "value", label: "진행률(%)", icon: Loader, tooltip: "현재 진행 상태를 퍼센트 값으로 나타냅니다.", type: "number", placeholder: "60" },
  ],
};

export const LAYOUT_TYPES = new Set<MockupElementType>(["grid", "hstack", "vstack"]);
