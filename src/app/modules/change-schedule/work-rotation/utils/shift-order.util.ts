// Fixed shifts first, then split, then flexi.
const TYPE_ORDER: Record<string, number> = { FIXED: 0, SPLIT: 1, FLEXI: 2 };

// The heading a shift type is listed under.
const TYPE_LABEL: Record<string, string> = {
  FIXED: "Fixed shifts",
  SPLIT: "Split shifts",
  FLEXI: "Flexi shifts",
};

export const shiftGroupLabel = (type?: string) =>
  TYPE_LABEL[type ?? ""] ?? "Other shifts";

interface Orderable {
  shiftName: string;
  shiftType?: string;
  startTime?: string | null;
}

const typeRank = (type?: string) => TYPE_ORDER[type ?? ""] ?? 3;

/** The order shifts appear in the Quick Schedule palette: by type (fixed, split, flexi), then by
 * name A-Z (numbers read as numbers, case ignored), then by start time. */
export function sortShiftsForPalette<T extends Orderable>(shifts: T[]): T[] {
  return [...shifts].sort(
    (a, b) =>
      typeRank(a.shiftType) - typeRank(b.shiftType) ||
      a.shiftName.localeCompare(b.shiftName, undefined, {
        numeric: true,
        sensitivity: "base",
      }) ||
      (a.startTime ?? "").localeCompare(b.startTime ?? ""),
  );
}
