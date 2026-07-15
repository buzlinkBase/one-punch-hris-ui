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

export default function DtrDetailTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    fullName: 180,
    workType: 120,
    workDate: 110,
    shiftName: 160,
    startTime: 75,
    endTime: 75,
    lateMinutes: 75,
    utMinutes: 75,
    overBreakMinutes: 75,
    otMinutes: 75,
    nd: 75,
    ndot: 80,
    lh: 75,
    sp: 75,
    regularNetHours: 80,
    regularOTHours: 75,
    regularNDOTHours: 75,
    regularNDHours: 75,
    restDayHours: 80,
    restDayOTHours: 75,
    restDayNDHours: 75,
    restDayNDOTHours: 90,
    legalHolHours: 75,
    legalHolOTHours: 75,
    legalHolNightDiffHours: 75,
    legalHolNightDiffOTHours: 90,
    specialHolHours: 75,
    specialHolNightDiffHours: 80,
    specialHolNightDiffOTHours: 95,
    specialHolOTHours: 75,
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
    dataIndex: keyof DtrDetailResponse,
    width = 75,
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
      }) as object,
    render: (v: number | null | undefined) => {
      const n = v ?? 0;
      if (n === 0)
        return <span style={{ color: "#d9d9d9", userSelect: "none" }}>—</span>;
      return <span style={{ fontWeight: 500 }}>{n.toFixed(1)}</span>;
    },
  });

  const timeCol = (
    title: string,
    dataIndex: keyof DtrDetailResponse,
    width = 75,
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
      }) as object,
    render: (v: string | null) => (v ? dayjs(v).format("HH:mm") : null),
  });

  const columns: ColumnsType<DtrDetailResponse> = [
    // ── Identity (fixed left) ────────────────────────────────────────────────────
    {
      title: DTR_DETAIL_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
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
      fixed: "left",
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
    },
    timeCol(DTR_DETAIL_LABEL.START, "startTime"),
    timeCol(DTR_DETAIL_LABEL.END, "endTime"),
    // ── MINUTES group ────────────────────────────────────────────────────────────
    {
      title: "Minutes",
      children: [
        {
          title: "Late / Over Break",
          children: [
            col(DTR_DETAIL_LABEL.MINUTES_LATE, "lateMinutes"),
            col(DTR_DETAIL_LABEL.MINUTES_UT, "utMinutes"),
            col(DTR_DETAIL_LABEL.MINUTES_OVER, "overBreakMinutes"),
            col(DTR_DETAIL_LABEL.MINUTES_OT, "otMinutes"),
            col(DTR_DETAIL_LABEL.MINUTES_ND, "nd"),
            col(DTR_DETAIL_LABEL.MINUTES_ND_OT, "ndot", 80),
          ],
        },
        {
          title: "Holiday",
          children: [
            col(DTR_DETAIL_LABEL.MINUTES_LH, "lh"),
            col(DTR_DETAIL_LABEL.MINUTES_SP, "sp"),
          ],
        },
      ],
    },
    // ── HOURS group ──────────────────────────────────────────────────────────────
    {
      title: "Hours",
      children: [
        {
          title: "Regular",
          children: [
            col(DTR_DETAIL_LABEL.HOURS_REG_NET, "regularNetHours", 80),
            col(DTR_DETAIL_LABEL.HOURS_NET_OT, "regularOTHours", 75),
            col(DTR_DETAIL_LABEL.HOURS_ND_OT, "regularNDOTHours", 75),
            col("ND", "regularNDHours", 75),
          ],
        },
        {
          title: "Rest Day",
          children: [
            col(DTR_DETAIL_LABEL.HOURS_RD_NET, "restDayHours", 80),
            col(DTR_DETAIL_LABEL.HOURS_RD_OT, "restDayOTHours", 75),
            col(DTR_DETAIL_LABEL.HOURS_RD_ND, "restDayNDHours", 75),
            col(DTR_DETAIL_LABEL.HOURS_RD_ND_OT, "restDayNDOTHours", 90),
          ],
        },
        {
          title: "Legal Holiday",
          children: [
            col(DTR_DETAIL_LABEL.HOURS_LH, "legalHolHours"),
            col(DTR_DETAIL_LABEL.HOURS_LH_OT, "legalHolOTHours", 75),
            col(DTR_DETAIL_LABEL.HOURS_LH_ND, "legalHolNightDiffHours", 75),
            col(
              DTR_DETAIL_LABEL.HOURS_LH_ND_OT,
              "legalHolNightDiffOTHours",
              90,
            ),
          ],
        },
        {
          title: "Special Holiday",
          children: [
            col(DTR_DETAIL_LABEL.HOURS_SPH, "specialHolHours"),
            col(DTR_DETAIL_LABEL.HOURS_SPH_ND, "specialHolNightDiffHours", 80),
            col(
              DTR_DETAIL_LABEL.HOURS_SPH_ND_OT,
              "specialHolNightDiffOTHours",
              95,
            ),
            col("OT", "specialHolOTHours", 75),
          ],
        },
        {
          title: "Rest + Legal Day",
          children: [
            col("Hrs", "restLegalDayHours", 75),
            col("OT", "restLegalDayOTHours", 75),
            col("ND", "restLegalDayNDHours", 75),
            col("ND-OT", "restLegalDayNDOTHours", 80),
          ],
        },
        {
          title: "Rest + Special Day",
          children: [
            col("Hrs", "restSpecialDayHours", 75),
            col("OT", "restSpecialDayOTHours", 75),
            col("ND", "restSpecialDayNDHours", 75),
            col("ND-OT", "restSpecialDayNDOTHours", 80),
          ],
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
