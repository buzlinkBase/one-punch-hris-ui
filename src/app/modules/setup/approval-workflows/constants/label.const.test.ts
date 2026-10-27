import { describe, expect, it } from "vitest";
import { conditionMetricOptions, hasConditionMetrics } from "./label.const";

describe("step condition metrics per request type", () => {
  it("offers only the measures a request type has", () => {
    expect(conditionMetricOptions("Leave").map((o) => o.value)).toEqual([
      "None",
      "Days",
    ]);
    expect(conditionMetricOptions("Overtime").map((o) => o.value)).toEqual([
      "None",
      "Hours",
    ]);
    expect(
      conditionMetricOptions("OfficialBusiness").map((o) => o.value),
    ).toEqual(["None", "Days", "Amount"]);
    expect(conditionMetricOptions("Loan").map((o) => o.value)).toEqual([
      "None",
      "Amount",
    ]);
  });

  it("has none for types with no measurable request", () => {
    expect(hasConditionMetrics("Leave")).toBe(true);
    expect(hasConditionMetrics("Dtr")).toBe(false);
    expect(hasConditionMetrics("ProfileUpdate")).toBe(false);
    expect(conditionMetricOptions("Dtr").map((o) => o.value)).toEqual(["None"]);
  });
});
