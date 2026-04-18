import { describe, it, expect } from "vitest";
import { ELEMENT_PROP_SCHEMAS, LAYOUT_TYPES } from "../element-prop-schemas";

describe("ELEMENT_PROP_SCHEMAS", () => {
  it("정상: 객체로 정의되어 있음", () => {
    expect(ELEMENT_PROP_SCHEMAS).toBeDefined();
    expect(typeof ELEMENT_PROP_SCHEMAS).toBe("object");
  });

  it("정상: 각 엔트리는 PropField 배열임", () => {
    for (const [, fields] of Object.entries(ELEMENT_PROP_SCHEMAS)) {
      expect(Array.isArray(fields)).toBe(true);
      if (fields) {
        for (const field of fields) {
          expect(field).toHaveProperty("key");
          expect(field).toHaveProperty("label");
          expect(field).toHaveProperty("type");
          expect(["text", "number", "select"]).toContain(field.type);
        }
      }
    }
  });

  it("정상: heading 스키마는 text 타입의 text 필드를 가짐", () => {
    const fields = ELEMENT_PROP_SCHEMAS.heading;

    expect(fields).toBeDefined();
    expect(fields!.length).toBeGreaterThan(0);
    const textField = fields!.find((f) => f.key === "text");
    expect(textField).toBeDefined();
    expect(textField!.type).toBe("text");
  });

  it("정상: chart 스키마는 select 타입의 chartType 필드를 가짐", () => {
    const fields = ELEMENT_PROP_SCHEMAS.chart;

    expect(fields).toBeDefined();
    const chartTypeField = fields!.find((f) => f.key === "chartType");
    expect(chartTypeField).toBeDefined();
    expect(chartTypeField!.type).toBe("select");
    expect(chartTypeField!.options).toBeDefined();
    expect(chartTypeField!.options!.length).toBeGreaterThan(0);
  });

  it("정상: image 스키마는 src, alt 두 필드를 가짐", () => {
    const fields = ELEMENT_PROP_SCHEMAS.image;

    expect(fields).toBeDefined();
    const keys = fields!.map((f) => f.key);
    expect(keys).toContain("src");
    expect(keys).toContain("alt");
  });

  it("정상: grid 스키마는 number 타입의 columns 필드를 가짐", () => {
    const fields = ELEMENT_PROP_SCHEMAS.grid;

    expect(fields).toBeDefined();
    const columnsField = fields!.find((f) => f.key === "columns");
    expect(columnsField).toBeDefined();
    expect(columnsField!.type).toBe("number");
  });

  it("엣지: 모든 select 타입 필드에는 options 배열이 정의되어 있음", () => {
    for (const fields of Object.values(ELEMENT_PROP_SCHEMAS)) {
      if (!fields) continue;
      for (const field of fields) {
        if (field.type === "select") {
          expect(field.options).toBeDefined();
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("LAYOUT_TYPES", () => {
  it("정상: Set으로 정의됨", () => {
    expect(LAYOUT_TYPES).toBeInstanceOf(Set);
  });

  it("정상: grid, hstack, vstack 세 가지 레이아웃을 포함함", () => {
    expect(LAYOUT_TYPES.has("grid")).toBe(true);
    expect(LAYOUT_TYPES.has("hstack")).toBe(true);
    expect(LAYOUT_TYPES.has("vstack")).toBe(true);
  });

  it("엣지: 비레이아웃 타입은 포함하지 않음", () => {
    expect(LAYOUT_TYPES.has("heading")).toBe(false);
    expect(LAYOUT_TYPES.has("button")).toBe(false);
    expect(LAYOUT_TYPES.has("image")).toBe(false);
  });

  it("불변성: 조회 후 크기가 변하지 않음", () => {
    const sizeBefore = LAYOUT_TYPES.size;

    LAYOUT_TYPES.has("grid");

    expect(LAYOUT_TYPES.size).toBe(sizeBefore);
  });
});
