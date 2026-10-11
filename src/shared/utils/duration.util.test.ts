import { describe, expect, it } from "vitest";
import { buildEndDateTime, isCrossMidnight } from "./duration.util";

describe("isCrossMidnight", () => {
  it("is true when end is earlier than start", () => {
    expect(isCrossMidnight("22:00", "06:00")).toBe(true);
  });

  it("is true when end equals start (24h span)", () => {
    expect(isCrossMidnight("08:00", "08:00")).toBe(true);
  });

  it("is false when end is later than start", () => {
    expect(isCrossMidnight("08:00", "17:00")).toBe(false);
  });
});

describe("buildEndDateTime", () => {
  it("rolls the end to the next day when end equals start", () => {
    expect(buildEndDateTime("2026-10-04", "08:00", "08:00")).toBe(
      "2026-10-05T08:00:00",
    );
  });

  it("keeps the same day when end is later than start", () => {
    expect(buildEndDateTime("2026-10-04", "08:00", "17:00")).toBe(
      "2026-10-04T17:00:00",
    );
  });
});
