import { describe, expect, it } from "vitest";
import { formatClock, formatClockDateTime } from "./clock-format.util";

describe("clock-format.util", () => {
  it("formats time with seconds", () => {
    expect(formatClock("2026-01-05T13:05:09")).toBe("13:05:09");
    expect(formatClockDateTime("2026-01-05T13:05:09")).toBe(
      "2026-01-05 13:05:09",
    );
  });

  it("returns empty for missing or invalid values", () => {
    expect(formatClock(undefined)).toBe("");
    expect(formatClock(null)).toBe("");
    expect(formatClock("not a date")).toBe("");
    expect(formatClockDateTime("")).toBe("");
  });
});
