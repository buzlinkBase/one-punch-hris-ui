import { describe, expect, it } from "vitest";
import {
  buildDates,
  buildEntries,
  chunk,
  cellKey,
  indexPlans,
  MAX_GRID_DAYS,
  parsePasteGrid,
  patternAt,
  type CellPaint,
} from "./schedule-grid.util";

const paint = (shiftId: string | null, areaId: string | null = null) =>
  ({ shiftId, areaId, clientId: null }) as CellPaint;

describe("buildDates", () => {
  it("lists every day inclusive", () => {
    expect(buildDates("2026-11-01", "2026-11-03")).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
    ]);
  });

  it("is empty when the range is backwards", () => {
    expect(buildDates("2026-11-05", "2026-11-01")).toEqual([]);
  });

  it("caps the range", () => {
    expect(buildDates("2026-01-01", "2026-12-31")).toHaveLength(MAX_GRID_DAYS);
  });
});

describe("patternAt", () => {
  const pattern = ["D", "D", null, null];

  it("repeats the pattern across days", () => {
    expect([0, 1, 2, 3, 4, 5].map((i) => patternAt(pattern, i, 0))).toEqual([
      "D",
      "D",
      null,
      null,
      "D",
      "D",
    ]);
  });

  it("starts from the offset, including a negative one", () => {
    expect(patternAt(pattern, 0, 2)).toBeNull();
    expect(patternAt(pattern, 0, -1)).toBeNull();
    expect(patternAt(pattern, 0, -4)).toBe("D");
  });
});

describe("buildEntries", () => {
  const server = indexPlans([
    {
      id: "1",
      employeeId: "e1",
      payrollDate: "2026-11-01",
      timeShiftId: "day",
    },
  ]);

  it("keeps a changed shift and a new shift", () => {
    const edits = new Map([
      [cellKey("e1", "2026-11-01"), paint("night")],
      [cellKey("e2", "2026-11-01"), paint("day")],
    ]);
    expect(buildEntries(edits, server).map((e) => e.timeShiftId)).toEqual([
      "night",
      "day",
    ]);
  });

  it("drops an edit that matches what is saved", () => {
    const edits = new Map([[cellKey("e1", "2026-11-01"), paint("day")]]);
    expect(buildEntries(edits, server)).toEqual([]);
  });

  it("keeps a clear only when there is something to clear", () => {
    const edits = new Map([
      [cellKey("e1", "2026-11-01"), paint(null)],
      [cellKey("e1", "2026-11-02"), paint(null)],
    ]);
    const entries = buildEntries(edits, server);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      employeeId: "e1",
      payrollDate: "2026-11-01",
      timeShiftId: null,
    });
  });

  it("treats a different site as a change", () => {
    const edits = new Map([
      [cellKey("e1", "2026-11-01"), paint("day", "site-1")],
    ]);
    expect(buildEntries(edits, server)).toHaveLength(1);
  });
});

describe("parsePasteGrid", () => {
  const names = new Map([
    ["day", "d1"],
    ["night", "n1"],
  ]);

  it("reads shifts, clears and blanks by row and column", () => {
    const { rows, invalid } = parsePasteGrid("Day\tNight\t-\n\tDAY\t", names);
    expect(invalid).toEqual([]);
    expect(rows).toEqual([
      [
        { kind: "shift", shiftId: "d1" },
        { kind: "shift", shiftId: "n1" },
        { kind: "clear" },
      ],
      [{ kind: "skip" }, { kind: "shift", shiftId: "d1" }, { kind: "skip" }],
    ]);
  });

  it("reports unknown names once and skips them", () => {
    const { rows, invalid } = parsePasteGrid("Swing\tSwing", names);
    expect(invalid).toEqual(["Swing"]);
    expect(rows[0]).toEqual([{ kind: "skip" }, { kind: "skip" }]);
  });
});

describe("chunk", () => {
  it("splits into parts of at most the size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns no parts for nothing", () => {
    expect(chunk([], 3)).toEqual([]);
  });
});
