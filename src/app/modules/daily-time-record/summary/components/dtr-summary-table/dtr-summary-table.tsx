import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrSummaryResponse } from "../../models/api/response/dtr-summary-response.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: DtrSummaryResponse[];
  loading?: boolean;
}

const R = "right" as const;

const GC = {
  attendance: { group: "#8896a8", sub: "#f8fafc" },
  regular: { group: "#5b8fc9", sub: "#eff6ff" },
  restDay: { group: "#c49a5a", sub: "#fffbeb" },
  legalHol: { group: "#c47070", sub: "#fef2f2" },
  specialHol: { group: "#9b7ec8", sub: "#faf5ff" },
  restLegal: { group: "#4aab98", sub: "#f0fdfa" },
  restSpecial: { group: "#5aaa5a", sub: "#f0fdf4" },
};

const groupHeader = (bg: string) => (): object => ({
  style: { backgroundColor: bg, color: "#fff", fontWeight: 600 },
});

export default function DtrSummaryTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    fullName: 260,
    lateHours: 70,
    utHours: 70,
    overHours: 70,
    absentCount: 60,
    regularNetHours: 80,
    regularOTHours: 75,
    regularNDHours: 75,
    regularNDOTHours: 75,
    restDayHours: 80,
    restDayOTHours: 75,
    restDayNDHours: 75,
    restDayNDOTHours: 90,
    legalHolHours: 75,
    legalHolOTHours: 75,
    legalHolNightDiffHours: 75,
    legalHolNightDiffOTHours: 90,
    specialHolHours: 75,
    specialHolOTHours: 75,
    specialHolNightDiffHours: 80,
    specialHolNightDiffOTHours: 95,
    restLegalDayHours: 75,
    restLegalDayOTHours: 75,
    restLegalDayNDHours: 75,
    restLegalDayNDOTHours: 80,
    restSpecialDayHours: 75,
    restSpecialDayOTHours: 75,
    restSpecialDayNDHours: 75,
    restSpecialDayNDOTHours: 80,
  });

  const col = (
    title: string,
    dataIndex: keyof DtrSummaryResponse,
    width = 75,
    subBg?: string,
  ) => ({
    title,
    dataIndex,
    key: dataIndex as string,
    align: R,
    width: widths[dataIndex as string] ?? width,
    onHeaderCell: () =>
      ({
        width: widths[dataIndex as string] ?? width,
        onResize: (w: number) => handleResize(dataIndex as string, w),
        style: subBg ? { backgroundColor: subBg } : undefined,
      }) as object,
    render: (v: number | null | undefined) => {
      const n = v ?? 0;
      if (n === 0)
        return <span style={{ color: "#d9d9d9", userSelect: "none" }}>—</span>;
      return <span style={{ fontWeight: 500 }}>{n.toFixed(1)}</span>;
    },
  });

  const columns: ColumnsType<DtrSummaryResponse> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left" as const,
      width: widths.fullName ?? 260,
      onHeaderCell: () =>
        ({
          width: widths.fullName ?? 260,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    // ── ATTENDANCE ────────────────────────────────────────────────────────────────
    {
      title: "Attendance",
      onHeaderCell: groupHeader(GC.attendance.group),
      children: [
        col("Late", "lateHours", 70, GC.attendance.sub),
        col("UT", "utHours", 70, GC.attendance.sub),
        col("Over", "overHours", 70, GC.attendance.sub),
        col("Absent", "absentCount", 60, GC.attendance.sub),
      ],
    },
    // ── HOURS ─────────────────────────────────────────────────────────────────────
    {
      title: "Hours",
      children: [
        {
          title: "Regular",
          onHeaderCell: groupHeader(GC.regular.group),
          children: [
            col("Hrs", "regularNetHours", 80, GC.regular.sub),
            col("OT", "regularOTHours", 75, GC.regular.sub),
            col("ND", "regularNDHours", 75, GC.regular.sub),
            col("ND-OT", "regularNDOTHours", 75, GC.regular.sub),
          ],
        },
        {
          title: "Rest Day",
          onHeaderCell: groupHeader(GC.restDay.group),
          children: [
            col("Hrs", "restDayHours", 80, GC.restDay.sub),
            col("OT", "restDayOTHours", 75, GC.restDay.sub),
            col("ND", "restDayNDHours", 75, GC.restDay.sub),
            col("ND-OT", "restDayNDOTHours", 90, GC.restDay.sub),
          ],
        },
        {
          title: "Legal Holiday",
          onHeaderCell: groupHeader(GC.legalHol.group),
          children: [
            col("Hrs", "legalHolHours", 75, GC.legalHol.sub),
            col("OT", "legalHolOTHours", 75, GC.legalHol.sub),
            col("ND", "legalHolNightDiffHours", 75, GC.legalHol.sub),
            col("ND-OT", "legalHolNightDiffOTHours", 90, GC.legalHol.sub),
          ],
        },
        {
          title: "Special Holiday",
          onHeaderCell: groupHeader(GC.specialHol.group),
          children: [
            col("Hrs", "specialHolHours", 75, GC.specialHol.sub),
            col("OT", "specialHolOTHours", 75, GC.specialHol.sub),
            col("ND", "specialHolNightDiffHours", 80, GC.specialHol.sub),
            col("ND-OT", "specialHolNightDiffOTHours", 95, GC.specialHol.sub),
          ],
        },
        {
          title: "Rest + Legal Day",
          onHeaderCell: groupHeader(GC.restLegal.group),
          children: [
            col("Hrs", "restLegalDayHours", 75, GC.restLegal.sub),
            col("OT", "restLegalDayOTHours", 75, GC.restLegal.sub),
            col("ND", "restLegalDayNDHours", 75, GC.restLegal.sub),
            col("ND-OT", "restLegalDayNDOTHours", 80, GC.restLegal.sub),
          ],
        },
        {
          title: "Rest + Special Day",
          onHeaderCell: groupHeader(GC.restSpecial.group),
          children: [
            col("Hrs", "restSpecialDayHours", 75, GC.restSpecial.sub),
            col("OT", "restSpecialDayOTHours", 75, GC.restSpecial.sub),
            col("ND", "restSpecialDayNDHours", 75, GC.restSpecial.sub),
            col("ND-OT", "restSpecialDayNDOTHours", 80, GC.restSpecial.sub),
          ],
        },
      ],
    },
  ];

  return (
    <Table
      rowKey="employeeId"
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 20 }}
      scroll={{ x: "max-content" }}
      bordered
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}
