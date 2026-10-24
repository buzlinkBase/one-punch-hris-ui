import { Button, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { FundLedgerSummaryResponse } from "../../models/api/response/payroll-reports.model";
import type { ReportTotals } from "../payroll-report-shell/payroll-report-shell";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

interface Labels {
  /** e.g. "Accrued" */
  added: string;
  /** e.g. "Paid Out" */
  deducted: string;
}

// Main-list columns shared by the Retirement and Uniform Allowance ledgers: one row per employee,
// with a "View ledger" action that opens the employee's entries.
export function buildFundSummaryColumns(
  labels: Labels,
  onView: (row: FundLedgerSummaryResponse) => void,
): ColumnsType<FundLedgerSummaryResponse> {
  return [
    {
      title: "Employee No",
      dataIndex: "employeeNo",
      key: "no",
      width: 120,
      fixed: "left",
    },
    { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
    {
      title: labels.added,
      dataIndex: "totalAdded",
      key: "added",
      align: "right",
      render: fmt,
    },
    {
      title: labels.deducted,
      dataIndex: "totalDeducted",
      key: "deducted",
      align: "right",
      render: (v: number) => (v !== 0 ? fmt(v) : ""),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      render: (v: number) => <strong>{fmt(v)}</strong>,
    },
    {
      title: "Last Entry",
      dataIndex: "lastEntryDate",
      key: "last",
      width: 130,
      render: (v: string | null) => (v ? dayjs(v).format("MMM DD, YYYY") : ""),
    },
    {
      title: "",
      key: "view",
      width: 48,
      fixed: "right",
      render: (_, r) => (
        <Tooltip title="View ledger">
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            aria-label="View ledger"
            onClick={() => onView(r)}
          />
        </Tooltip>
      ),
    },
  ];
}

export function fundSummaryExport(labels: Labels) {
  return {
    headers: [
      "Employee No",
      "Full Name",
      labels.added,
      labels.deducted,
      "Balance",
      "Last Entry",
    ],
    totals: {
      fields: ["totalAdded", "totalDeducted", "balance"],
      exportHeaders: [labels.added, labels.deducted, "Balance"],
    } satisfies ReportTotals<FundLedgerSummaryResponse>,
    rows: (records: FundLedgerSummaryResponse[]) =>
      records.map((r) => [
        r.employeeNo,
        r.fullName,
        r.totalAdded,
        r.totalDeducted,
        r.balance,
        r.lastEntryDate ?? "",
      ]),
  };
}
