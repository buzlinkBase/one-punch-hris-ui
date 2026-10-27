import { describe, expect, it } from "vitest";
import { formatMoney, roundMoney } from "./money.util";

describe("formatMoney", () => {
  it("always shows exactly two decimals", () => {
    expect(formatMoney(1234.5)).toBe("1,234.50");
    expect(formatMoney(1234.5678)).toBe("1,234.57");
    expect(formatMoney(0)).toBe("0.00");
  });

  it("treats a missing amount as zero", () => {
    expect(formatMoney(undefined)).toBe("0.00");
    expect(formatMoney(null)).toBe("0.00");
  });
});

describe("roundMoney", () => {
  it("rounds to the centavo", () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(2.344)).toBe(2.34);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});
