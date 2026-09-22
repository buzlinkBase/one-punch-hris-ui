import { Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { fmt } from "../utils/payroll-summary.util";

const { Text } = Typography;

export const deductionsColumns = (
  colorPrimary: string,
): ColumnsType<PayrollRunResult> => [
  {
    title: "Employee",
    dataIndex: "fullName",
    key: "name",
    width: 160,
    fixed: "left",
  },
  {
    title: "SSS",
    dataIndex: "sssContribution",
    key: "sss",
    align: "right",
    render: fmt,
  },
  {
    title: "PhilHealth",
    dataIndex: "philHealthContribution",
    key: "phic",
    align: "right",
    render: fmt,
  },
  {
    title: "Pag-IBIG",
    dataIndex: "pagIbigContribution",
    key: "hdmf",
    align: "right",
    render: fmt,
  },
  {
    title: "W-Tax",
    dataIndex: "withholdingTax",
    key: "tax",
    align: "right",
    render: fmt,
  },
  {
    title: "Loans",
    dataIndex: "totalLoans",
    key: "loans",
    align: "right",
    render: fmt,
  },
  {
    title: "Other Deductions",
    key: "otherDed",
    align: "right",
    render: (_, r) => fmt(r.otherDeductions - r.totalLoans),
  },
  {
    title: "Late/UT",
    key: "late",
    align: "right",
    render: (_, r) => fmt(r.lateAmount + r.underTimeAmount),
  },
  {
    title: "Absent",
    dataIndex: "absences",
    key: "abs",
    align: "right",
    render: fmt,
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "net",
    align: "right",
    fixed: "right",
    render: (v: number) => (
      <Text strong style={{ color: colorPrimary }}>
        {fmt(v)}
      </Text>
    ),
  },
];
