import type { DtrSummaryResponse } from "../models/api/response/dtr-summary-response.model";

type SumLeafCol = { key: keyof DtrSummaryResponse; label: string };
type SumSubGroup = { label: string; cols: SumLeafCol[] };
type SumTopGroup = { label: string; subGroups: SumSubGroup[] };

export const LEFT_COLS: SumLeafCol[] = [
  { key: "batchCode", label: "Batch Code" },
  { key: "fullName", label: "Employee" },
];

export const GROUPED_COLS: SumTopGroup[] = [
  {
    label: "Attendance",
    subGroups: [
      {
        label: "Late / Over Break",
        cols: [
          { key: "lateHours", label: "Late Hrs" },
          { key: "utHours", label: "UT Hrs" },
          { key: "overHours", label: "Over Hrs" },
          { key: "absentCount", label: "Absent" },
        ],
      },
    ],
  },
  {
    label: "Hours",
    subGroups: [
      {
        label: "Regular",
        cols: [
          { key: "regularNetHours", label: "Hrs" },
          { key: "regularOTHours", label: "OT" },
          { key: "regularNDHours", label: "ND" },
          { key: "regularNDOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Rest Day",
        cols: [
          { key: "restDayHours", label: "Hrs" },
          { key: "restDayOTHours", label: "OT" },
          { key: "restDayNDHours", label: "ND" },
          { key: "restDayNDOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Legal Holiday",
        cols: [
          { key: "legalHolHours", label: "Hrs" },
          { key: "legalHolOTHours", label: "OT" },
          { key: "legalHolNightDiffHours", label: "ND" },
          { key: "legalHolNightDiffOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Special Holiday",
        cols: [
          { key: "specialHolHours", label: "Hrs" },
          { key: "specialHolOTHours", label: "OT" },
          { key: "specialHolNightDiffHours", label: "ND" },
          { key: "specialHolNightDiffOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Rest + Legal Day",
        cols: [
          { key: "restLegalDayHours", label: "Hrs" },
          { key: "restLegalDayOTHours", label: "OT" },
          { key: "restLegalDayNDHours", label: "ND" },
          { key: "restLegalDayNDOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Rest + Special Day",
        cols: [
          { key: "restSpecialDayHours", label: "Hrs" },
          { key: "restSpecialDayOTHours", label: "OT" },
          { key: "restSpecialDayNDHours", label: "ND" },
          { key: "restSpecialDayNDOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Double Legal Hol",
        cols: [
          { key: "doubleLegalHours", label: "Hrs" },
          { key: "doubleLegalOTHours", label: "OT" },
          { key: "doubleLegalNDHours", label: "ND" },
          { key: "doubleLegalNDOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Rest + Double Legal",
        cols: [
          { key: "restDoubleLegalHours", label: "Hrs" },
          { key: "restDoubleLegalOTHours", label: "OT" },
          { key: "restDoubleLegalNDHours", label: "ND" },
          { key: "restDoubleLegalNDOTHours", label: "ND-OT" },
        ],
      },
      {
        label: "Official Business",
        cols: [{ key: "obHours", label: "OB Hrs" }],
      },
      {
        label: "Leave",
        cols: [
          { key: "leaveHours", label: "Paid Leave Hours" },
          { key: "unpaidLeaveHours", label: "Unpaid Leave Hours" },
        ],
      },
    ],
  },
];

const ALL_LEAF_COLS: SumLeafCol[] = GROUPED_COLS.flatMap((g) =>
  g.subGroups.flatMap((s) => s.cols),
);
const ALL_COLS: SumLeafCol[] = [...LEFT_COLS, ...ALL_LEAF_COLS];

export function fmtCell(
  r: DtrSummaryResponse,
  key: keyof DtrSummaryResponse,
): string {
  const v = r[key];
  if (typeof v === "number") return v === 0 ? "" : v.toFixed(1);
  return String(v ?? "");
}

export function buildDtrSummaryCsv(records: DtrSummaryResponse[]): string {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;

  const row1 = [
    ...LEFT_COLS.map(() => esc("")),
    ...GROUPED_COLS.flatMap((g) =>
      g.subGroups.flatMap((s) =>
        s.cols.map((_, i) =>
          esc(i === 0 && s === g.subGroups[0] ? g.label : ""),
        ),
      ),
    ),
  ].join(",");

  const row2 = [
    ...LEFT_COLS.map((c) => esc(c.label)),
    ...GROUPED_COLS.flatMap((g) =>
      g.subGroups.flatMap((s) =>
        s.cols.map((_, i) => esc(i === 0 ? s.label : "")),
      ),
    ),
  ].join(",");

  const row3 = ALL_COLS.map((c) => esc(c.label)).join(",");

  const dataRows = records.map((r) =>
    ALL_COLS.map((c) => esc(fmtCell(r, c.key))).join(","),
  );

  return [row1, row2, row3, ...dataRows].join("\n");
}
