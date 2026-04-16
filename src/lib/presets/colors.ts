import type { ColorToken } from "@/types/phases";

export interface ColorPreset {
  id: string;
  label: string;
  primaryHex: string;
  primaryOklch: string;
}

export const colorPresets: ColorPreset[] = [
  { id: "blue", label: "파랑", primaryHex: "#2563EB", primaryOklch: "oklch(0.55 0.24 264)" },
  { id: "coral", label: "코랄", primaryHex: "#F97066", primaryOklch: "oklch(0.65 0.18 20)" },
  { id: "violet", label: "보라", primaryHex: "#7C3AED", primaryOklch: "oklch(0.50 0.25 290)" },
  { id: "forest", label: "숲", primaryHex: "#16A34A", primaryOklch: "oklch(0.60 0.18 150)" },
  { id: "amber", label: "앰버", primaryHex: "#F59E0B", primaryOklch: "oklch(0.75 0.17 80)" },
  { id: "slate", label: "슬레이트", primaryHex: "#475569", primaryOklch: "oklch(0.45 0.02 260)" },
  { id: "rose", label: "로즈", primaryHex: "#E11D48", primaryOklch: "oklch(0.55 0.22 10)" },
  { id: "teal", label: "틸", primaryHex: "#0D9488", primaryOklch: "oklch(0.60 0.13 180)" },
];

export function deriveColorTokens(preset: ColorPreset, darkMode = false): ColorToken[] {
  const bg = darkMode ? "#0f172a" : "#ffffff";
  const surface = darkMode ? "#1e293b" : "#f8fafc";
  const text = darkMode ? "#f1f5f9" : "#0f172a";

  return [
    { name: "Primary", hex: preset.primaryHex, oklch: preset.primaryOklch, role: "CTA 버튼, 링크, 강조" },
    { name: "Background", hex: bg, role: "페이지 배경" },
    { name: "Surface", hex: surface, role: "카드, 패널 배경" },
    { name: "Text", hex: text, role: "본문 텍스트" },
    { name: "Secondary", hex: darkMode ? "#334155" : "#e2e8f0", role: "보조 버튼, 비활성 영역" },
    { name: "Error", hex: "#ef4444", role: "에러 상태, 삭제 액션" },
    { name: "Success", hex: "#22c55e", role: "성공 상태, 확인" },
    { name: "Warning", hex: "#f59e0b", role: "경고, 주의 표시" },
  ];
}
