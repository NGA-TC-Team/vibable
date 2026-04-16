import { describe, it, expect } from "vitest";
import {
  APP_VERSION,
  SCHEMA_VERSION,
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_RETRY_DELAY_MS,
  AUTOSAVE_MAX_RETRIES,
  SHARE_URL_MAX_BYTES,
} from "../constants";

describe("constants", () => {
  it("AUTOSAVE_DEBOUNCE_MS is 500", () => {
    expect(AUTOSAVE_DEBOUNCE_MS).toBe(500);
  });

  it("AUTOSAVE_MAX_RETRIES is 3", () => {
    expect(AUTOSAVE_MAX_RETRIES).toBe(3);
  });

  it("SHARE_URL_MAX_BYTES is 64 * 1024", () => {
    expect(SHARE_URL_MAX_BYTES).toBe(64 * 1024);
  });

  it("invariant: all numeric constants are positive", () => {
    const numericConstants = [
      SCHEMA_VERSION,
      AUTOSAVE_DEBOUNCE_MS,
      AUTOSAVE_RETRY_DELAY_MS,
      AUTOSAVE_MAX_RETRIES,
      SHARE_URL_MAX_BYTES,
    ];

    for (const val of numericConstants) {
      expect(val).toBeGreaterThan(0);
    }
  });

  it("APP_VERSION is a semver-like string", () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
