import type { DesignSystemPhase } from "@/types/phases";

export interface MoodPreset {
  id: string;
  name: string;
  mood: string;
  density: DesignSystemPhase["visualTheme"]["density"];
  borderRadius: string;
  shadowLevel: string;
  fontFamily: string;
  philosophy: string;
}

export const moodPresets: MoodPreset[] = [
  {
    id: "clean",
    name: "깔끔",
    mood: "Minimal, structured, trustworthy",
    density: "spacious",
    borderRadius: "8px",
    shadowLevel: "낮음",
    fontFamily: "Pretendard",
    philosophy: "불필요한 장식을 배제하고 구조적 명확성을 추구한다",
  },
  {
    id: "warm",
    name: "따뜻한",
    mood: "Friendly, approachable, soft",
    density: "comfortable",
    borderRadius: "16px",
    shadowLevel: "중간, 확산",
    fontFamily: "Pretendard",
    philosophy: "유저에게 친근하고 안정적인 인상을 준다",
  },
  {
    id: "bold",
    name: "강렬한",
    mood: "Confident, high-contrast, direct",
    density: "compact",
    borderRadius: "4px",
    shadowLevel: "없음",
    fontFamily: "Inter",
    philosophy: "강한 대비와 직접적인 시각 언어로 자신감을 표현한다",
  },
  {
    id: "playful",
    name: "경쾌한",
    mood: "Energetic, colorful, light",
    density: "comfortable",
    borderRadius: "20px",
    shadowLevel: "중간, 컬러",
    fontFamily: "Nunito",
    philosophy: "에너지 넘치는 색채와 둥근 형태로 활기를 전달한다",
  },
  {
    id: "elegant",
    name: "세련된",
    mood: "Refined, restrained, luxurious",
    density: "spacious",
    borderRadius: "2px",
    shadowLevel: "낮음",
    fontFamily: "Noto Serif KR",
    philosophy: "절제된 표현과 넉넉한 여백으로 고급스러움을 연출한다",
  },
  {
    id: "tech",
    name: "기술적",
    mood: "Precise, futuristic, data-rich",
    density: "compact",
    borderRadius: "0px",
    shadowLevel: "미미",
    fontFamily: "JetBrains Mono",
    philosophy: "데이터 밀도를 극대화하고 정밀한 시각 체계를 구축한다",
  },
];
