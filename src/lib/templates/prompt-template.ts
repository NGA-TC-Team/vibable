type PromptTemplateOptions = {
  role: string;
  objective: string;
  inputFields: string[];
  outputRules?: string[];
  exampleInput: string[];
  exampleOutput: unknown;
  closingInstruction?: string;
};

const baseOutputRules = [
  "반드시 JSON 객체 하나만 반환하고, JSON 바깥의 설명이나 마크다운 코드펜스는 쓰지 마.",
  "예시의 최상위 키와 중첩 키를 그대로 유지하고, 키 이름을 임의로 바꾸거나 생략하지 마.",
  "값이 비어 있어도 필드를 생략하지 말고 빈 문자열, 빈 배열, false 중 적절한 기본값으로 채워.",
  "사람이 읽는 설명형 문자열은 한국어로 작성하고, id/path/enum 같은 기술 식별자는 영문 slug 또는 camelCase를 사용해.",
  "배열 항목은 최소 1개 이상 제안하되, 실제 입력상 근거가 전혀 없으면 빈 배열로 둬.",
  "예시 JSON은 형식을 보여주기 위한 few-shot 참조이므로, 실제 응답에서는 입력 맥락에 맞는 내용으로 다시 작성해.",
];

export function buildPromptTemplate({
  role,
  objective,
  inputFields,
  outputRules = [],
  exampleInput,
  exampleOutput,
  closingInstruction = "이제 위 실제 입력을 반영해서 JSON 객체 하나만 반환해.",
}: PromptTemplateOptions): string {
  const allRules = [...baseOutputRules, ...outputRules];

  return [
    `너는 ${role}.`,
    "",
    "[해야 할 일]",
    objective,
    "",
    "[실제 입력]",
    ...inputFields.map((field) => `- ${field}`),
    "",
    "[출력 규칙]",
    ...allRules.map((rule) => `- ${rule}`),
    "",
    "[예시 입력]",
    ...exampleInput.map((field) => `- ${field}`),
    "",
    "[예시 응답(JSON)]",
    JSON.stringify(exampleOutput, null, 2),
    "",
    closingInstruction,
  ].join("\n");
}
