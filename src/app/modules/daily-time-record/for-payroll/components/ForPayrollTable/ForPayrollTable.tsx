import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ForPayrollResponse } from "../../models/api/response/for-payroll-response.model";
import { FOR_PAYROLL_LABEL } from "../../constants/label.const";

interface Props {
  data: ForPayrollResponse[];
  loading?: boolean;
}

const R = "right" as const;

const col = (
  title: string,
  dataIndex: keyof ForPayrollResponse,
  width = 75,
) => ({ title, dataIndex, key: dataIndex as string, align: R, width });

const columns: ColumnsType<ForPayrollResponse> = [
  // ── Identity (fixed left) ────────────────────────────────────────────────────
  {
    title: FOR_PAYROLL_LABEL.BIO_ID,
    dataIndex: "bioId",
    key: "bioId",
    fixed: "left",
    width: 100,
  },
  {
    title: FOR_PAYROLL_LABEL.EMPLOYEE,
    dataIndex: "employeeName",
    key: "employeeName",
    fixed: "left",
    width: 180,
  },
  // ── Late/UT ──────────────────────────────────────────────────────────────────
  {
    title: "Late/UT",
    children: [
      col(FOR_PAYROLL_LABEL.LATE, "late", 80),
      col(FOR_PAYROLL_LABEL.UNDER_TIME, "underTime", 80),
    ],
  },
  // ── Hours ────────────────────────────────────────────────────────────────────
  {
    title: "Hours",
    children: [
      {
        title: "Regular",
        children: [
          col(FOR_PAYROLL_LABEL.REG_NET, "regNet", 90),
          col(FOR_PAYROLL_LABEL.NET_OVERTIME, "netOvertime", 90),
          col(FOR_PAYROLL_LABEL.ND, "nd", 70),
          col(FOR_PAYROLL_LABEL.ND_OT, "ndOt", 80),
        ],
      },
      {
        title: "Rest Day",
        children: [
          col(FOR_PAYROLL_LABEL.REST_DAY_NET, "restDayNet", 90),
          col(FOR_PAYROLL_LABEL.REST_DAY_OT, "restDayOt", 90),
          col(FOR_PAYROLL_LABEL.RD_ND, "rdNd", 80),
          col(FOR_PAYROLL_LABEL.RD_ND_OT, "rdNdOt", 90),
        ],
      },
      {
        title: "Holiday",
        children: [
          {
            title: "Legal",
            children: [
              col(FOR_PAYROLL_LABEL.LH, "lh", 70),
              col(FOR_PAYROLL_LABEL.LH_OT, "lhOt", 80),
              col(FOR_PAYROLL_LABEL.LH_ND, "lhNd", 80),
            ],
          },
          {
            title: "Special",
            children: [
              col(FOR_PAYROLL_LABEL.SPH, "sph", 70),
              col(FOR_PAYROLL_LABEL.SPH_OT, "sphOt", 80),
              col(FOR_PAYROLL_LABEL.SPH_ND, "sphNd", 80),
              col(FOR_PAYROLL_LABEL.SPH_ND_OT, "sphNdOt", 90),
            ],
          },
        ],
      },
    ],
  },
];

export default function ForPayrollTable({ data, loading }: Props) {
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
