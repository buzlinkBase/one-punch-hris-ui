import { describe, expect, it } from "vitest";
import {
  describeDelegationDates,
  describeDelegationType,
} from "./delegation-describe.util";

describe("describeDelegationDates", () => {
  it("shows a closed range", () => {
    expect(
      describeDelegationDates({ fromDate: "2026-10-05", toDate: "2026-10-09" }),
    ).toBe("Oct 5, 2026 – Oct 9, 2026");
  });

  it("shows open-ended and one-sided ranges", () => {
    expect(describeDelegationDates({ fromDate: "2026-10-05" })).toBe(
      "From Oct 5, 2026",
    );
    expect(describeDelegationDates({ toDate: "2026-10-09" })).toBe(
      "Until Oct 9, 2026",
    );
    expect(describeDelegationDates({})).toBe("Until switched off");
  });
});

describe("describeDelegationType", () => {
  it("names the type, or all requests", () => {
    expect(describeDelegationType({ applicationType: "Leave" })).toBe("Leave");
    expect(describeDelegationType({ applicationType: null })).toBe(
      "All requests",
    );
  });
});
