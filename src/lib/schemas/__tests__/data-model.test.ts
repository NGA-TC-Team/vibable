import { describe, it, expect } from "vitest";
import { dataModelSchema } from "../data-model";

describe("dataModelSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = dataModelSchema.parse({});

    expect(result).toEqual({
      entities: [],
      storageStrategy: "local",
      distributedStrategy: undefined,
      storageNotes: "",
    });
  });

  it("parses valid entity data", () => {
    const valid = {
      entities: [
        {
          id: "e1",
          name: "User",
          fields: [
            {
              name: "email",
              type: "string" as const,
              required: true,
              description: "User email",
            },
          ],
        },
        {
          id: "e2",
          name: "Post",
          fields: [
            {
              name: "authorId",
              type: "relation" as const,
              required: true,
              relationTarget: "User",
              relationTargetField: "id",
              relationType: "1:N" as const,
              onDelete: "restrict" as const,
              onUpdate: "cascade" as const,
            },
          ],
        },
      ],
      storageStrategy: "distributed" as const,
      distributedStrategy: "primaryReplica" as const,
      storageNotes: "Primary write, replica read",
    };

    const result = dataModelSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid storage strategy", () => {
    const result = dataModelSchema.safeParse({
      storageStrategy: "cloud",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid FK action", () => {
    const result = dataModelSchema.safeParse({
      entities: [
        {
          id: "e1",
          name: "Post",
          fields: [
            {
              name: "authorId",
              type: "relation",
              required: true,
              relationTarget: "User",
              relationTargetField: "id",
              relationType: "1:N",
              onDelete: "archive",
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = dataModelSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
