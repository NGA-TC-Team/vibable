export interface ElementLabelResult {
  label: string;
  typeLabel: string;
  hasAlias: boolean;
}

interface ElementLabelInput {
  type: string;
  alias?: string;
}

/**
 * 목업 요소를 사람이 읽을 수 있는 라벨로 해석한다.
 * 사용자 지정 alias가 있으면 최우선, 없으면 `Type N` 형태의 폴백을 돌려준다.
 */
export function resolveElementLabel(
  element: ElementLabelInput,
  fallbackIndex: number,
  typeLabelMap: Record<string, string> = {},
): ElementLabelResult {
  const typeLabel = typeLabelMap[element.type] ?? element.type;
  const alias = element.alias?.trim();

  return {
    label: alias || `${typeLabel} ${fallbackIndex}`,
    typeLabel,
    hasAlias: Boolean(alias),
  };
}
