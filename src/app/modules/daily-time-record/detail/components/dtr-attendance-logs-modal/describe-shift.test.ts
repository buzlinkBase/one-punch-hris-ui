import { describe, expect, it } from "vitest";
import { describeShift } from "./describe-shift";

describe("describeShift", () => {
  it("shows a same-day shift as times only", () => {
    expect(
      describeShift("Dayshift", "2026-10-07T08:00:00", "2026-10-07T17:00:00"),
    ).toBe("Dayshift · 08:00:00 – 17:00:00");
  });

  it("dates both ends of a shift that runs past midnight", () => {
    expect(
      describeShift("Nightshift", "2026-10-07T22:00:00", "2026-10-08T06:00:00"),
    ).toBe("Nightshift · Oct 7 22:00:00 – Oct 8 06:00:00");
  });

  it("falls back to the name, or nothing, without times", () => {
    expect(describeShift("Dayshift", null, null)).toBe("Dayshift");
    expect(describeShift(null, null, null)).toBeNull();
  });
});
