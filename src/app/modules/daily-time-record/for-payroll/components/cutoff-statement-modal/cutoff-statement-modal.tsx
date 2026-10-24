import { Button, Empty, Modal, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCutoffStatement } from "../../hooks/use-for-payroll-queries";
import type { CutoffStatementRun } from "../../models/api/response/cutoff-statement.model";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "../../constants/label.const";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string | null;
  from: string;
  to: string;
  clientName: (id?: string | null) => string;
}

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (d?: string | null) =>
  d ? dayjs(d.replace(/Z$/, "")).format("MMM DD, YYYY") : "—";

// One employee's pay for a cutoff across every per-client run: what each client's run paid, which
// run took the deductions, and one total -- the answer to "how much did I get this cutoff?" for a
// reliever paid on several dates.
export default function CutoffStatementModal({
  open,
  onClose,
  employeeId,
  employeeName,
  from,
  to,
  clientName,
}: Props) {
  const { data, isLoading } = useCutoffStatement(
    open ? employeeId : undefined,
    from,
    to,
  );

  const columns: ColumnsType<CutoffStatementRun> = [
    {
      title: "Client run",
      key: "client",
      width: 190,
      render: (_, r) => (
        <div className="flex flex-col">
          <Text strong>{clientName(r.clientId)}</Text>
          <Text type="secondary" className="text-xs">
            {fmtDate(r.payPeriodStart)} — {fmtDate(r.payPeriodEnd)}
          </Text>
        </div>
      ),
    },
    {
      title: "Pay date",
      dataIndex: "payDate",
      key: "payDate",
      width: 120,
      render: (v?: string | null) => fmtDate(v),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => (
        <Tag color={APPROVAL_STATUS_COLOR[r.approvalStatus] ?? "default"}>
          {APPROVAL_STATUS_LABEL[r.approvalStatus] ?? r.approvalStatus}
        </Tag>
      ),
    },
    {
      title: "Deductions",
      key: "carrier",
      width: 130,
      render: (_, r) =>
        r.isDeductionCarrier ? (
          <Tag color="green">Taken here</Tag>
        ) : (
          <Tag>Earnings only</Tag>
        ),
    },
    {
      title: "Gross",
      dataIndex: "grossIncome",
      key: "gross",
      align: "right",
      render: fmt,
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
      title: "Loans & other",
      key: "other",
      align: "right",
      render: (_, r) =>
        fmt(r.totalLoans + r.otherDeductions + r.cashBondDeduction),
    },
    {
      title: "Net pay",
      dataIndex: "netPay",
      key: "net",
      align: "right",
      fixed: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
  ];

  return (
    <Modal
      title={`Cutoff statement — ${employeeName ?? ""}`}
      open={open}
      onCancel={onClose}
      width={1100}
      footer={
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Text type="secondary">
          Every regular payroll run that paid this employee for {fmtDate(from)}{" "}
          — {fmtDate(to)}.
        </Text>
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <Statistic
            title="Total gross"
            value={data?.totals.grossIncome ?? 0}
            precision={2}
            prefix="₱"
          />
          <Statistic
            title="Total deductions"
            value={data?.totals.totalDeductions ?? 0}
            precision={2}
            prefix="₱"
          />
          <Statistic
            title="Total net pay"
            value={data?.totals.netPay ?? 0}
            precision={2}
            prefix="₱"
          />
        </div>
        <Table
          rowKey="payrollBatchId"
          size="small"
          loading={isLoading}
          dataSource={data?.runs ?? []}
          columns={columns}
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty description="No payroll run has paid this employee for this cutoff." />
            ),
          }}
        />
      </div>
    </Modal>
  );
}
