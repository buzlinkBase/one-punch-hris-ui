import { describe, expect, it } from "vitest";
import {
  THIRTEENTH_MONTH_HINT,
  THIRTEENTH_MONTH_LABEL,
  THIRTEENTH_MONTH_STATUS_LABEL,
  isStillUnpaid,
} from "./thirteenth-month.const";

describe("13th month wording", () => {
  it("names each payout status in plain words", () => {
    expect(THIRTEENTH_MONTH_STATUS_LABEL).toEqual({
      NotGenerated: "Not yet generated",
      Draft: "Generated, not released",
      Posted: "Released",
    });
  });

  it("explains every column it labels", () => {
    expect(Object.keys(THIRTEENTH_MONTH_HINT).sort()).toEqual(
      Object.keys(THIRTEENTH_MONTH_LABEL).sort(),
    );
  });
});

describe("still unpaid", () => {
  it("is highlighted only when part of the 13th month earned isn't covered by the payout", () => {
    expect(isStillUnpaid({ stillUnpaid: 544.57 })).toBe(true);
    expect(isStillUnpaid({ stillUnpaid: 0 })).toBe(false);
  });

  it("treats a missing amount (an API from before the field existed) as nothing unpaid", () => {
    expect(isStillUnpaid({} as { stillUnpaid: number })).toBe(false);
  });
});
