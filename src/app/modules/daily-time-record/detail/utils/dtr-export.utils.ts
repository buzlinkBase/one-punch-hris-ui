import dayjs from "dayjs";
import { formatDecimal } from "@/shared/utils/number.util";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";

export type LeafCol = { key: keyof DtrDetailResponse; label: string };
export type SubGroup = { label: string; cols: LeafCol[] };
export type TopGroup = { label: string; subGroups: SubGroup[] };

export const LEFT_COLS: LeafCol[] = [
  { key: "fullName", label: "Employee" },
  { key: "workType", label: "Work Type" },
  { key: "workDate", label: "Date" },
  { key: "shiftName", label: "Shift" },
  { key: "startTime", label: "Start" },
  { key: "endTime", label: "End" },
];

export const GROUPED_COLS: TopGroup[] = [
  {
    label: "Minutes",
    subGroups: [
      {
        label: "Late / Over Break",
        cols: [
          { key: "lateMinutes", label: "Late" },
          { key: "utMinutes", label: "UT" },
          { key: "overMinutes", label: "Over Break" },
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
        ],
      },
      {
        label: "Rest Day",
        cols: [
          { key: "restDayHours", label: "Hrs" },
          { key: "restDayOTHours", label: "OT" },
          { key: "restDayNDHours", label: "ND" },
        ],
      },
      {
        label: "Regular Holiday",
        cols: [
          { key: "legalHolHours", label: "Hrs" },
          { key: "legalHolOTHours", label: "OT" },
          { key: "legalHolNightDiffHours", label: "ND" },
        ],
      },
      {
        label: "Special Holiday",
        cols: [
          { key: "specialHolHours", label: "Hrs" },
          { key: "specialHolOTHours", label: "OT" },
          { key: "specialHolNightDiffHours", label: "ND" },
        ],
      },
      {
        label: "Rest + Regular Holiday",
        cols: [
          { key: "restLegalDayHours", label: "Hrs" },
          { key: "restLegalDayOTHours", label: "OT" },
          { key: "restLegalDayNDHours", label: "ND" },
        ],
      },
      {
        label: "Rest + Special Day",
        cols: [
          { key: "restSpecialDayHours", label: "Hrs" },
          { key: "restSpecialDayOTHours", label: "OT" },
          { key: "restSpecialDayNDHours", label: "ND" },
        ],
      },
      {
        label: "Double Reg Hol",
        cols: [
          { key: "doubleLegalHours", label: "Hrs" },
          { key: "doubleLegalOTHours", label: "OT" },
          { key: "doubleLegalNDHours", label: "ND" },
        ],
      },
      {
        label: "Rest + Double Reg Hol",
        cols: [
          { key: "restDoubleLegalHours", label: "Hrs" },
          { key: "restDoubleLegalOTHours", label: "OT" },
          { key: "restDoubleLegalNDHours", label: "ND" },
        ],
      },
      {
        label: "Official Business",
        cols: [{ key: "obHours", label: "OB Hrs" }],
      },
      {
        label: "Leave",
        cols: [
          { key: "paidLeaveHours", label: "Paid Leave Hrs" },
          { key: "unpaidLeaveHours", label: "Unpaid Leave Hrs" },
        ],
      },
    ],
  },
];

export const ALL_LEAF_COLS: LeafCol[] = GROUPED_COLS.flatMap((g) =>
  g.subGroups.flatMap((s) => s.cols),
);
export const ALL_COLS: LeafCol[] = [...LEFT_COLS, ...ALL_LEAF_COLS];

export function fmtCell(
  r: DtrDetailResponse,
  key: keyof DtrDetailResponse,
): string {
  const v = r[key];
  if (key === "startTime" || key === "endTime")
    return v ? dayjs(v as string).format("HH:mm:ss") : "";
  if (typeof v === "number") return v === 0 ? "" : formatDecimal(v);
  return String(v ?? "");
}

/** A DTR Detail row enriched with display names, for the Reports > DTR Detail export. */
export type DtrReportRow = DtrDetailResponse & {
  clientName: string;
  departmentName: string;
  branchName: string;
  areaName: string;
};

export type ReportCol = { key: keyof DtrReportRow; label: string };

export const REPORT_LEFT_COLS: ReportCol[] = [
  { key: "clientName", label: "Client" },
  { key: "departmentName", label: "Department" },
  { key: "branchName", label: "Branch" },
  { key: "areaName", label: "Project Site" },
  ...LEFT_COLS,
];

const REPORT_NAME_KEYS: (keyof DtrReportRow)[] = [
  "clientName",
  "departmentName",
  "branchName",
  "areaName",
];

export function fmtReportCell(
  r: DtrReportRow,
  key: keyof DtrReportRow,
): string {
  if (REPORT_NAME_KEYS.includes(key)) return String(r[key] ?? "");
  return fmtCell(r, key as keyof DtrDetailResponse);
}

function buildGroupedCsv<T>(
  records: T[],
  leftCols: { key: keyof T; label: string }[],
  cell: (r: T, key: keyof T) => string,
): string {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const leafCols = ALL_LEAF_COLS as unknown as {
    key: keyof T;
    label: string;
  }[];
  const allCols = [...leftCols, ...leafCols];

  const row1 = [
    ...leftCols.map(() => esc("")),
    ...GROUPED_COLS.flatMap((g) =>
      g.subGroups.flatMap((s) =>
        s.cols.map((_, i) =>
          esc(i === 0 && s === g.subGroups[0] ? g.label : ""),
        ),
      ),
    ),
  ].join(",");

  const row2 = [
    ...leftCols.map((c) => esc(c.label)),
    ...GROUPED_COLS.flatMap((g) =>
      g.subGroups.flatMap((s) =>
        s.cols.map((_, i) => esc(i === 0 ? s.label : "")),
      ),
    ),
  ].join(",");

  const row3 = allCols.map((c) => esc(c.label)).join(",");

  const dataRows = records.map((r) =>
    allCols.map((c) => esc(cell(r, c.key))).join(","),
  );

  return [row1, row2, row3, ...dataRows].join("\n");
}

export function buildDtrCsv(records: DtrDetailResponse[]): string {
  return buildGroupedCsv(records, LEFT_COLS, fmtCell);
}

export function buildDtrReportCsv(records: DtrReportRow[]): string {
  return buildGroupedCsv(records, REPORT_LEFT_COLS, fmtReportCell);
}
