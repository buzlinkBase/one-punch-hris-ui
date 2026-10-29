import dayjs from "dayjs";
import type { ApplyScheduleGridEntry } from "../models/api/request/apply-schedule-grid.model";
import type { WorkRotationResponse } from "../models/api/response/work-rotation-response.model";

// What one grid cell holds. shiftId null means "clear" -- the day goes back to the employee's
// regular schedule (fixed schedule or permanent shift); it is not a rest day.
export interface CellPaint {
  shiftId: string | null;
  areaId: string | null;
  clientId: string | null;
}

export const MAX_GRID_DAYS = 62;

export const cellKey = (employeeId: string, date: string) =>
  `${employeeId}|${date}`;

export function splitCellKey(key: string): {
  employeeId: string;
  date: string;
} {
  const [employeeId, date] = key.split("|");
  return { employeeId, date };
}

/** Every date from..to inclusive as YYYY-MM-DD, capped at MAX_GRID_DAYS. */
export function buildDates(from: string, to: string): string[] {
  const start = dayjs(from);
  const end = dayjs(to);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return [];
  const dates: string[] = [];
  for (
    let d = start;
    !d.isAfter(end) && dates.length < MAX_GRID_DAYS;
    d = d.add(1, "day")
  ) {
    dates.push(d.format("YYYY-MM-DD"));
  }
  return dates;
}

/** The server's plans as a lookup by employee + day. */
export function indexPlans(
  plans: WorkRotationResponse[],
): Map<string, CellPaint> {
  const map = new Map<string, CellPaint>();
  for (const p of plans) {
    map.set(cellKey(p.employeeId, p.payrollDate), {
      shiftId: p.timeShiftId,
      areaId: p.operationAreaId ?? null,
      clientId: p.clientId ?? null,
    });
  }
  return map;
}

const samePaint = (a: CellPaint, b: CellPaint) =>
  a.shiftId === b.shiftId && a.areaId === b.areaId && a.clientId === b.clientId;

/** Whether painting `edit` over `current` (what is saved) would actually change the day. */
export function isChange(edit: CellPaint, current: CellPaint | undefined) {
  return edit.shiftId === null
    ? !!current
    : !current || !samePaint(current, edit);
}

/** The pattern's slot for a given day; the pattern repeats and `offset` shifts where it starts. */
export function patternAt<T>(
  pattern: T[],
  dayIndex: number,
  offset: number,
): T {
  const n = pattern.length;
  return pattern[(((dayIndex + offset) % n) + n) % n];
}

/** Only the edits that really change something become entries -- an edit that matches what the
 * server already has, or clears a day that has nothing, is dropped. */
export function buildEntries(
  edits: Map<string, CellPaint>,
  server: Map<string, CellPaint>,
): ApplyScheduleGridEntry[] {
  const entries: ApplyScheduleGridEntry[] = [];
  for (const [key, edit] of edits) {
    if (!isChange(edit, server.get(key))) continue;

    const { employeeId, date } = splitCellKey(key);
    entries.push({
      employeeId,
      payrollDate: date,
      timeShiftId: edit.shiftId,
      operationAreaId: edit.shiftId ? edit.areaId : null,
      clientId: edit.shiftId ? edit.clientId : null,
    });
  }
  return entries;
}

export type PasteCell =
  { kind: "shift"; shiftId: string } | { kind: "clear" } | { kind: "skip" };

const CLEAR_TOKENS = new Set(["-", "clear", "off", "x"]);

/** Reads copied spreadsheet cells (tab/newline separated). A cell is a shift name, "-" /
 * "clear" / "off" to clear, or empty to leave alone. Names that match no shift are returned in
 * `invalid` and left unchanged. */
export function parsePasteGrid(
  text: string,
  shiftIdByName: Map<string, string>,
): { rows: PasteCell[][]; invalid: string[] } {
  const invalid = new Set<string>();
  const lines = text.replace(/\r/g, "").split("\n");
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();

  const rows = lines.map((line) =>
    line.split("\t").map((raw): PasteCell => {
      const token = raw.trim();
      if (token === "") return { kind: "skip" };
      const lower = token.toLowerCase();
      if (CLEAR_TOKENS.has(lower)) return { kind: "clear" };
      const shiftId = shiftIdByName.get(lower);
      if (shiftId) return { kind: "shift", shiftId };
      invalid.add(token);
      return { kind: "skip" };
    }),
  );
  return { rows, invalid: [...invalid] };
}

// The server takes at most this many cells per save; a bigger grid is saved in parts.
export const SAVE_CHUNK_SIZE = 2000;

export function chunk<T>(items: T[], size: number): T[][] {
  const parts: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    parts.push(items.slice(i, i + size));
  }
  return parts;
}
