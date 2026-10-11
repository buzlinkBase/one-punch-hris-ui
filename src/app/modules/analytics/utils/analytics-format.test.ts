import { describe, expect, it } from "vitest";
import { formatAxisValue, formatValue, kpiChange } from "./analytics-format";

describe("formatValue", () => {
  it("formats each unit", () => {
    expect(formatValue(1250000, "Currency")).toBe("₱1,250,000");
    expect(formatValue(92.4, "Percent")).toBe("92.4%");
    expect(formatValue(12.5, "Hours")).toBe("12.5 hrs");
    expect(formatValue(3, "Days")).toBe("3 days");
    expect(formatValue(1200, "Count")).toBe("1,200");
  });

  it("shortens axis ticks", () => {
    expect(formatAxisValue(1_200_000, "Currency")).toBe("₱1.2M");
    expect(formatAxisValue(95, "Percent")).toBe("95%");
  });
});

describe("kpiChange", () => {
  it("shows the change as a percent of the previous value", () => {
    expect(
      kpiChange({ value: 110, previous: 100, unit: "Count" }, "up-is-good"),
    ).toEqual({ text: "+10%", trend: "up", tone: "good" });
    expect(
      kpiChange({ value: 90, previous: 100, unit: "Hours" }, "down-is-good"),
    ).toEqual({ text: "−10%", trend: "down", tone: "good" });
  });

  it("marks a change in the wrong direction as bad", () => {
    expect(
      kpiChange({ value: 12, previous: 10, unit: "Days" }, "down-is-good").tone,
    ).toBe("bad");
  });

  it("shows percent figures in percentage points", () => {
    expect(
      kpiChange({ value: 92.5, previous: 94, unit: "Percent" }, "up-is-good"),
    ).toEqual({ text: "−1.5 pts", trend: "down", tone: "bad" });
  });

  it("stays neutral without a direction, and flat without a change", () => {
    expect(kpiChange({ value: 5, previous: 4, unit: "Count" }).tone).toBe(
      "neutral",
    );
    expect(
      kpiChange({ value: 4, previous: 4, unit: "Count" }, "up-is-good"),
    ).toEqual({ text: "0%", trend: "flat", tone: "flat" });
  });

  it("says New from zero, and nothing without an earlier period", () => {
    expect(kpiChange({ value: 3, previous: 0, unit: "Count" }).text).toBe(
      "New",
    );
    expect(kpiChange({ value: 3, previous: null, unit: "Count" }).text).toBe(
      null,
    );
  });
});
