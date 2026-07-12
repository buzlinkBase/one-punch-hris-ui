import dayjs from "dayjs";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";
import { DTR_DETAIL_LABEL } from "../../constants/label.const";

interface Props {
  data: DtrDetailResponse[];
  loading?: boolean;
}

const R = "right" as const;
const L = "left" as const;

const col = (
  title: string,
  dataIndex: keyof DtrDetailResponse,
  width = 75,
) => ({
  title,
  dataIndex,
  key: dataIndex as string,
  align: R,
  width,
  render: (v: number | null | undefined) => {
    const n = v ?? 0;
    if (n === 0)
      return <span style={{ color: "#d9d9d9", userSelect: "none" }}>—</span>;
    return <span style={{ fontWeight: 500 }}>{n}</span>;
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
  width,
  render: (v: string | null) => (v ? dayjs(v).format("HH:mm") : "—"),
});

const columns: ColumnsType<DtrDetailResponse> = [
  // ── Identity (fixed left) ────────────────────────────────────────────────────
  {
    title: DTR_DETAIL_LABEL.EMPLOYEE,
    dataIndex: "fullName",
    key: "fullName",
    fixed: "left",
    width: 180,
    align: L,
  },
  {
    title: DTR_DETAIL_LABEL.WORK_TYPE,
    dataIndex: "workType",
    key: "workType",
    fixed: "left",
    width: 120,
    align: L,
  },
  {
    title: DTR_DETAIL_LABEL.DTR_DATE,
    dataIndex: "workDate",
    key: "workDate",
    width: 110,
    align: L,
  },
  {
    title: DTR_DETAIL_LABEL.TIME_SHIFT,
    dataIndex: "shiftName",
    key: "shiftName",
    width: 160,
    align: L,
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
          col(DTR_DETAIL_LABEL.HOURS_LH_ND_OT, "legalHolNightDiffOTHours", 90),
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

export default function DtrDetailTable({ data, loading }: Props) {
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
    />
  );
}
