import { describe, expect, it } from "vitest";
import { displayHoursOf, toDisplayHours } from "./dtr-hours-display";
import { GROUPED_COLS as DETAIL_COLS } from "./dtr-export.utils";
import { GROUPED_COLS as SUMMARY_COLS } from "../../summary/utils/dtr-summary-export.utils";

describe("toDisplayHours", () => {
  it("folds ND-OT into Hrs, ND and OT", () => {
    const r = toDisplayHours({
      regularNetHours: 8,
      regularNDHours: 2,
      regularOTHours: 3,
      regularNDOTHours: 1,
    });
    expect(r.regularNetHours).toBe(10);
    expect(r.regularNDHours).toBe(3);
    expect(r.regularOTHours).toBe(4);
  });

  it("leaves a day with no night hours as it is", () => {
    const r = toDisplayHours({
      regularNetHours: 8,
      regularNDHours: 0,
      regularOTHours: 2,
      regularNDOTHours: 0,
    });
    expect(r.regularNetHours).toBe(8);
    expect(r.regularNDHours).toBe(0);
    expect(r.regularOTHours).toBe(2);
  });

  it("applies to every day type", () => {
    const r = toDisplayHours({
      legalHolHours: 8,
      legalHolNightDiffHours: 2,
      legalHolOTHours: 3,
      legalHolNightDiffOTHours: 1,
    });
    expect(r.legalHolHours).toBe(10);
    expect(r.legalHolNightDiffHours).toBe(3);
    expect(r.legalHolOTHours).toBe(4);
  });

  it("treats missing hours as 0", () => {
    const r = toDisplayHours({ restDayHours: 8, restDayNDOTHours: null });
    expect(r.restDayHours).toBe(8);
    expect(r.restDayNDHours).toBe(0);
    expect(r.restDayOTHours).toBe(0);
  });

  it("never changes the original row", () => {
    const raw = { regularNetHours: 8, regularNDHours: 2 };
    toDisplayHours(raw);
    expect(raw.regularNetHours).toBe(8);
  });

  it("converts a row once for per-cell callers", () => {
    const raw = { regularNetHours: 8, regularNDHours: 2 };
    expect(displayHoursOf(raw)).toBe(displayHoursOf(raw));
    expect(displayHoursOf(raw).regularNetHours).toBe(10);
  });
});

describe("DTR exports", () => {
  it.each([
    ["detail", DETAIL_COLS],
    ["summary", SUMMARY_COLS],
  ])("have no ND-OT column (%s)", (_, groups) => {
    const labels = groups.flatMap((g) =>
      g.subGroups.flatMap((s) => s.cols.map((c) => c.label)),
    );
    expect(labels).not.toContain("ND-OT");
  });
});
