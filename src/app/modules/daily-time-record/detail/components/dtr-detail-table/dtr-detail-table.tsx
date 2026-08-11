import dayjs from "dayjs";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";
import { DTR_DETAIL_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: DtrDetailResponse[];
  loading?: boolean;
}

const R = "right" as const;
const L = "left" as const;

const GC = {
  minutes: { group: "#e4e9ee", sub: "#f8fafc" },
  regular: { group: "#dae8f5", sub: "#f4f9fe" },
  restDay: { group: "#f3e9d4", sub: "#fdfaf3" },
  legalHol: { group: "#f3dcdc", sub: "#fdf5f5" },
  specialHol: { group: "#ebe6f5", sub: "#f8f5fd" },
  restLegal: { group: "#d3ece8", sub: "#f0faf8" },
  restSpecial: { group: "#d4edd4", sub: "#f0faf0" },
  ob: { group: "#ccece6", sub: "#f0faf8" },
};

const groupHeader = (bg: string) => (): object => ({
  style: { backgroundColor: bg, color: "#374151", fontWeight: 600 },
});

export default function DtrDetailTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    fullName: 260,
    workType: 120,
    workDate: 110,
    shiftName: 150,
    startTime: 75,
    endTime: 75,
    lateMinutes: 75,
    utMinutes: 75,
    overMinutes: 75,
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
    obHours: 75,
  });

  const col = (
    title: string,
    dataIndex: keyof DtrDetailResponse,
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

  const columns: ColumnsType<DtrDetailResponse> = [
    {
      title: DTR_DETAIL_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    {
      title: DTR_DETAIL_LABEL.WORK_TYPE,
      dataIndex: "workType",
      key: "workType",
      width: widths.workType,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.workType,
          onResize: (w: number) => handleResize("workType", w),
        }) as object,
    },
    {
      title: DTR_DETAIL_LABEL.DTR_DATE,
      dataIndex: "workDate",
      key: "workDate",
      width: widths.workDate,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.workDate,
          onResize: (w: number) => handleResize("workDate", w),
        }) as object,
    },
    {
      title: DTR_DETAIL_LABEL.TIME_SHIFT,
      dataIndex: "shiftName",
      key: "shiftName",
      width: widths.shiftName,
      align: L,
      onHeaderCell: () =>
        ({
          width: widths.shiftName,
          onResize: (w: number) => handleResize("shiftName", w),
        }) as object,
      render: (name: string | null, record: DtrDetailResponse) => {
        const start = record.shiftStartTime
          ? dayjs(record.shiftStartTime).format("HH:mm")
          : null;
        const end = record.shiftEndTime
          ? dayjs(record.shiftEndTime).format("HH:mm")
          : null;
        return (
          <div style={{ lineHeight: 1.3 }}>
            <div>{name}</div>
            {(start || end) && (
              <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                {start ?? "—"} – {end ?? "—"}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: DTR_DETAIL_LABEL.START,
      dataIndex: "startTime",
      key: "startTime",
      width: widths.startTime,
      align: "center",
      onHeaderCell: () =>
        ({
          width: widths.startTime,
          onResize: (w: number) => handleResize("startTime", w),
        }) as object,
      render: (v: string | null) => (v ? dayjs(v).format("HH:mm") : null),
    },
    {
      title: DTR_DETAIL_LABEL.END,
      dataIndex: "endTime",
      key: "endTime",
      width: widths.endTime,
      align: "center",
      onHeaderCell: () =>
        ({
          width: widths.endTime,
          onResize: (w: number) => handleResize("endTime", w),
        }) as object,
      render: (v: string | null) => (v ? dayjs(v).format("HH:mm") : null),
    },
    // ── MINUTES ──────────────────────────────────────────────────────────────────
    {
      title: "Minutes",
      onHeaderCell: groupHeader(GC.minutes.group),
      children: [
        {
          title: "Late / Over Break",
          onHeaderCell: groupHeader(GC.minutes.group),
          children: [
            col(
              DTR_DETAIL_LABEL.MINUTES_LATE,
              "lateMinutes",
              75,
              GC.minutes.sub,
            ),
            col(DTR_DETAIL_LABEL.MINUTES_UT, "utMinutes", 75, GC.minutes.sub),
            col(
              DTR_DETAIL_LABEL.MINUTES_OVER,
              "overMinutes",
              75,
              GC.minutes.sub,
            ),
          ],
        },
      ],
    },
    // ── HOURS ────────────────────────────────────────────────────────────────────
    {
      title: "Hours",
      onHeaderCell: groupHeader(GC.minutes.group),
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
        {
          title: "Official Business",
          onHeaderCell: groupHeader(GC.ob.group),
          children: [col("OB Hrs", "obHours", 75, GC.ob.sub)],
        },
      ],
    },
  ];

  return (
    <Table
      rowKey={(r, i) => `${r.employeeId}-${r.workDate}-${i ?? 0}`}
      dataSource={data}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      bordered
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}
