import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  pickRange,
  rangeKey,
  shownRange,
  type DateRange,
} from "./mobile-range-draft";

const jan1 = dayjs("2026-01-01");
const jan15 = dayjs("2026-01-15");

describe("pickRange", () => {
  it("holds a one-sided pick as a draft instead of emitting a half range", () => {
    expect(pickRange([jan1, null])).toEqual({
      kind: "draft",
      range: [jan1, null],
    });
    expect(pickRange([null, jan15])).toEqual({
      kind: "draft",
      range: [null, jan15],
    });
  });

  it("emits once both ends are picked, and null when both are cleared", () => {
    expect(pickRange([jan1, jan15])).toEqual({
      kind: "emit",
      range: [jan1, jan15],
    });
    expect(pickRange([null, null])).toEqual({ kind: "emit", range: null });
  });
});

describe("shownRange", () => {
  it("shows the draft while the caller's value is still the one it was picked on", () => {
    expect(
      shownRange(null, { range: [jan1, null], basis: rangeKey(null) }),
    ).toEqual([jan1, null]);
    // Recreated Dayjs objects for the same dates still count as the same value.
    const value: DateRange = [jan1, jan15];
    expect(
      shownRange([dayjs("2026-01-01"), dayjs("2026-01-15")], {
        range: [null, jan15],
        basis: rangeKey(value),
      }),
    ).toEqual([null, jan15]);
  });

  it("drops the draft once the caller's value changes", () => {
    const value: DateRange = [jan1, jan15];
    expect(shownRange(value, { range: [jan1, null], basis: "" })).toBe(value);
  });
});
