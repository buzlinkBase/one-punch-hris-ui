import { describe, expect, it } from "vitest";
import { shiftGroupLabel, sortShiftsForPalette } from "./shift-order.util";

const shift = (
  shiftName: string,
  shiftType: string,
  startTime = "06:00:00",
) => ({
  shiftName,
  shiftType,
  startTime,
});

describe("shiftGroupLabel", () => {
  it("names each shift type", () => {
    expect(shiftGroupLabel("FIXED")).toBe("Fixed shifts");
    expect(shiftGroupLabel("SPLIT")).toBe("Split shifts");
    expect(shiftGroupLabel("FLEXI")).toBe("Flexi shifts");
  });

  it("falls back for an unknown type", () => {
    expect(shiftGroupLabel("???")).toBe("Other shifts");
    expect(shiftGroupLabel(undefined)).toBe("Other shifts");
  });
});

describe("sortShiftsForPalette", () => {
  it("lists fixed shifts, then split, then flexi", () => {
    const sorted = sortShiftsForPalette([
      shift("Alpha", "FLEXI"),
      shift("Zulu", "FIXED"),
      shift("Mid", "SPLIT"),
    ]);
    expect(sorted.map((s) => s.shiftType)).toEqual(["FIXED", "SPLIT", "FLEXI"]);
  });

  it("sorts names A-Z within a type, ignoring case", () => {
    const sorted = sortShiftsForPalette([
      shift("nightshift", "FIXED"),
      shift("Dayshift", "FIXED"),
      shift("Straight", "FIXED"),
    ]);
    expect(sorted.map((s) => s.shiftName)).toEqual([
      "Dayshift",
      "nightshift",
      "Straight",
    ]);
  });

  it("reads numbers as numbers", () => {
    const sorted = sortShiftsForPalette([
      shift("Shift 10", "FIXED"),
      shift("Shift 2", "FIXED"),
    ]);
    expect(sorted.map((s) => s.shiftName)).toEqual(["Shift 2", "Shift 10"]);
  });

  it("orders the same name by start time", () => {
    const sorted = sortShiftsForPalette([
      shift("Dayshift", "FIXED", "09:00:00"),
      shift("Dayshift", "FIXED", "06:00:00"),
      shift("Dayshift", "FIXED", "07:30:00"),
    ]);
    expect(sorted.map((s) => s.startTime)).toEqual([
      "06:00:00",
      "07:30:00",
      "09:00:00",
    ]);
  });

  it("does not change the list it was given", () => {
    const input = [shift("B", "FIXED"), shift("A", "FIXED")];
    sortShiftsForPalette(input);
    expect(input.map((s) => s.shiftName)).toEqual(["B", "A"]);
  });
});
