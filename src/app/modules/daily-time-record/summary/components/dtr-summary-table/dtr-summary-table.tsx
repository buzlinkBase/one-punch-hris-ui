import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DtrSummaryResponse } from "../../models/api/response/dtr-summary-response.model";
import { DTR_SUMMARY_LABEL } from "../../constants/label.const";

interface Props {
  data: DtrSummaryResponse[];
  loading?: boolean;
}

const R = "right" as const;

const col = (
  title: string,
  dataIndex: keyof DtrSummaryResponse,
  width = 75,
) => ({ title, dataIndex, key: dataIndex as string, align: R, width });

const columns: ColumnsType<DtrSummaryResponse> = [
  // ── Identity (fixed left) ────────────────────────────────────────────────────
  {
    title: DTR_SUMMARY_LABEL.BIO_ID,
    dataIndex: "bioId",
    key: "bioId",
    fixed: "left",
    width: 90,
  },
  {
    title: DTR_SUMMARY_LABEL.EMPLOYEE,
    dataIndex: "employeeName",
    key: "employeeName",
    fixed: "left",
    width: 180,
  },
  // ── Minutes group ────────────────────────────────────────────────────────────
  {
    title: "Minutes",
    children: [
      {
        title: "Late / Over Break",
        children: [
          col(DTR_SUMMARY_LABEL.LATE, "late", 70),
          col(DTR_SUMMARY_LABEL.UNDER_TIME, "underTime", 70),
          col(DTR_SUMMARY_LABEL.OVER, "over", 70),
          col(DTR_SUMMARY_LABEL.OT, "ot", 70),
          col(DTR_SUMMARY_LABEL.ND, "nd", 70),
          col(DTR_SUMMARY_LABEL.ND_OT, "ndOt", 75),
        ],
      },
      {
        title: "Holiday",
        children: [
          col(DTR_SUMMARY_LABEL.LH_HOURS, "lhHours", 70),
          col(DTR_SUMMARY_LABEL.SP_HOURS, "spHours", 70),
        ],
      },
    ],
  },
  // ── Days group ───────────────────────────────────────────────────────────────
  {
    title: "Days",
    children: [
      {
        title: "Regular Days",
        children: [
          col(DTR_SUMMARY_LABEL.DAYS, "days", 60),
          col(DTR_SUMMARY_LABEL.RND, "rnd", 70),
          col(DTR_SUMMARY_LABEL.ROT, "rot", 70),
          col(DTR_SUMMARY_LABEL.RNDO, "rndo", 70),
        ],
      },
      {
        title: "Rest Day",
        children: [
          col(DTR_SUMMARY_LABEL.REST_DAY, "restDay", 80),
          {
            title: DTR_SUMMARY_LABEL.RD_ND,
            dataIndex: "rdNd",
            key: "rdNd_days",
            align: R,
            width: 75,
          },
          col(DTR_SUMMARY_LABEL.RD_OT, "rdOt", 70),
          col(DTR_SUMMARY_LABEL.RD_NDO, "rdNdo", 80),
        ],
      },
      {
        title: "Holiday",
        children: [
          col(DTR_SUMMARY_LABEL.LH_USED, "lhUsed", 70),
          col(DTR_SUMMARY_LABEL.SP_USED, "spUsed", 70),
        ],
      },
    ],
  },
  // ── Hours group ──────────────────────────────────────────────────────────────
  {
    title: "Hours",
    children: [
      {
        title: "Regular",
        children: [
          col(DTR_SUMMARY_LABEL.REG_NET, "regNet", 80),
          col(DTR_SUMMARY_LABEL.NET_OT, "netOt", 80),
          col(DTR_SUMMARY_LABEL.ND_NET, "ndNet", 70),
          col(DTR_SUMMARY_LABEL.ND_OT_NET, "ndOtNet", 75),
        ],
      },
      {
        title: "Rest Day",
        children: [
          col(DTR_SUMMARY_LABEL.RD_NET, "rdNet", 80),
          col(DTR_SUMMARY_LABEL.RD_OT_NET, "rdOtNet", 75),
          col(DTR_SUMMARY_LABEL.RD_ND, "rdNd", 75),
          col(DTR_SUMMARY_LABEL.RD_ND_OT, "rdNdOt", 85),
        ],
      },
      {
        title: "Holiday",
        children: [
          {
            title: "Legal",
            children: [
              col(DTR_SUMMARY_LABEL.LH, "lh", 70),
              col(DTR_SUMMARY_LABEL.LH_OT, "lhOt", 75),
              col(DTR_SUMMARY_LABEL.LH_ND, "lhNd", 75),
              col(DTR_SUMMARY_LABEL.LH_ND_OT, "lhNdOt", 85),
            ],
          },
          {
            title: "Special",
            children: [
              col(DTR_SUMMARY_LABEL.SPH, "sph", 70),
              col(DTR_SUMMARY_LABEL.SPH_OT, "sphOt", 75),
              col(DTR_SUMMARY_LABEL.SPH_ND, "sphNd", 80),
              col(DTR_SUMMARY_LABEL.SPH_ND_OT, "sphNdOt", 90),
            ],
          },
        ],
      },
    ],
  },
  // ── Trailing flat columns ─────────────────────────────────────────────────────
  col(DTR_SUMMARY_LABEL.RAW_OT, "rawOt", 80),
  col(DTR_SUMMARY_LABEL.APPLIED_OT, "appliedOt", 90),
  col(DTR_SUMMARY_LABEL.ABS, "abs", 60),
  col(DTR_SUMMARY_LABEL.TOTAL, "total", 80),
];

export default function DtrSummaryTable({ data, loading }: Props) {
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
