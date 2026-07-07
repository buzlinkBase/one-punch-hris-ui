import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrDetailResponse } from "../../models/api/response/dtr-detail-response.model";
import { DTR_DETAIL_LABEL } from "../../constants/label.const";

interface Props {
  data: DtrDetailResponse[];
  loading?: boolean;
}

const R = "right" as const;

const col = (
  title: string,
  dataIndex: keyof DtrDetailResponse,
  width = 75,
) => ({ title, dataIndex, key: dataIndex as string, align: R, width });

const columns: ColumnsType<DtrDetailResponse> = [
  // ── Identity (fixed left) ────────────────────────────────────────────────────
  {
    title: DTR_DETAIL_LABEL.EMPLOYEE,
    dataIndex: "employeeName",
    key: "employeeName",
    fixed: "left",
    width: 180,
    align: "left",
  },
  {
    title: DTR_DETAIL_LABEL.WORK_TYPE,
    dataIndex: "workType",
    key: "workType",
    fixed: "left",
    width: 120,
    align: "left",
  },
  {
    title: DTR_DETAIL_LABEL.DTR_DATE,
    dataIndex: "dtrDate",
    key: "dtrDate",
    width: 110,
    align: "left",
  },
  {
    title: DTR_DETAIL_LABEL.TIME_SHIFT,
    dataIndex: "timeShift",
    key: "timeShift",
    width: 160,
    align: "left",
  },
  {
    title: DTR_DETAIL_LABEL.START,
    dataIndex: "start",
    key: "start",
    width: 75,
    align: R,
  },
  {
    title: DTR_DETAIL_LABEL.END,
    dataIndex: "end",
    key: "end",
    width: 75,
    align: R,
  },
  // ── MINUTES group ────────────────────────────────────────────────────────────
  {
    title: "Minutes",
    children: [
      {
        title: "Late / Over Break",
        children: [
          col(DTR_DETAIL_LABEL.MINUTES_LATE, "minutesLate"),
          col(DTR_DETAIL_LABEL.MINUTES_UT, "minutesUt"),
          col(DTR_DETAIL_LABEL.MINUTES_OVER, "minutesOver"),
          col(DTR_DETAIL_LABEL.MINUTES_OT, "minutesOt"),
          col(DTR_DETAIL_LABEL.MINUTES_ND, "minutesNd"),
          col(DTR_DETAIL_LABEL.MINUTES_ND_OT, "minutesNdOt", 80),
        ],
      },
      {
        title: "Holiday",
        children: [
          col(DTR_DETAIL_LABEL.MINUTES_LH, "minutesLh"),
          col(DTR_DETAIL_LABEL.MINUTES_SP, "minutesSp"),
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
          col(DTR_DETAIL_LABEL.HOURS_REG_NET, "hoursRegNet", 80),
          col(DTR_DETAIL_LABEL.HOURS_NET_OT, "hoursNetOt", 75),
          col(DTR_DETAIL_LABEL.HOURS_ND_OT, "hoursNdOt", 75),
        ],
      },
      {
        title: "Rest Day",
        children: [
          col(DTR_DETAIL_LABEL.HOURS_RD_NET, "hoursRdNet", 80),
          col(DTR_DETAIL_LABEL.HOURS_RD_OT, "hoursRdOt", 75),
          col(DTR_DETAIL_LABEL.HOURS_RD_ND, "hoursRdNd", 75),
          col(DTR_DETAIL_LABEL.HOURS_RD_ND_OT, "hoursRdNdOt", 90),
        ],
      },
      {
        title: "Legal Holiday",
        children: [
          col(DTR_DETAIL_LABEL.HOURS_LH, "hoursLh"),
          col(DTR_DETAIL_LABEL.HOURS_LH_OT, "hoursLhOt", 75),
          col(DTR_DETAIL_LABEL.HOURS_LH_ND, "hoursLhNd", 75),
          col(DTR_DETAIL_LABEL.HOURS_LH_ND_OT, "hoursLhNdOt", 90),
        ],
      },
      {
        title: "Special Holiday",
        children: [
          col(DTR_DETAIL_LABEL.HOURS_SPH, "hoursSph"),
          col(DTR_DETAIL_LABEL.HOURS_SPH_ND, "hoursSphNd", 80),
          col(DTR_DETAIL_LABEL.HOURS_SPH_ND_OT, "hoursSphNdOt", 95),
        ],
      },
    ],
  },
  // ── Total ────────────────────────────────────────────────────────────────────
  col(DTR_DETAIL_LABEL.TOTAL, "total", 80),
];

export default function DtrDetailTable({ data, loading }: Props) {
  return (
    <Table
      rowKey="id"
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
