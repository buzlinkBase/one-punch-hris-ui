import { describe, expect, it } from "vitest";
import { formatDecimal } from "./number.util";

describe("formatDecimal", () => {
  it("keeps minute-level OT visible (62 min -> 1.03)", () => {
    expect(formatDecimal(62 / 60)).toBe("1.03");
  });

  it("pads whole hours to 2 decimals", () => {
    expect(formatDecimal(8)).toBe("8.00");
  });

  it("pads partial hours to 2 decimals", () => {
    expect(formatDecimal(0.5)).toBe("0.50");
  });

  it("absorbs floating-point noise from summed hours", () => {
    expect(formatDecimal(7.9999999)).toBe("8.00");
  });

  it("honours a custom digit count", () => {
    expect(formatDecimal(5.6, 0)).toBe("6");
  });
});
