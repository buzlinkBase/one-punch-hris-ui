import { describe, expect, it } from "vitest";
import { formatManilaDate, formatMoney } from "./format";

describe("formatManilaDate", () => {
  it("shows the Philippine calendar date of a UTC instant", () => {
    // 20:00 UTC on Oct 8 is already Oct 9 in Manila (UTC+8).
    expect(formatManilaDate("2026-10-08T20:00:00Z")).toContain("9");
    expect(formatManilaDate("2026-10-08T20:00:00Z")).toContain("2026");
  });

  it("has a placeholder for no date", () => {
    expect(formatManilaDate(null)).toBe("--");
  });
});

describe("formatMoney", () => {
  it("formats pesos with two decimals", () => {
    expect(formatMoney(4999)).toContain("4,999.00");
  });
});
