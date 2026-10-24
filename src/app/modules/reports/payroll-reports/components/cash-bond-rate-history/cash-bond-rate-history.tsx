import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCashBondRateHistory } from "../../hooks/use-payroll-reports-queries";
import type { CashBondRateChangeResponse } from "../../models/api/response/payroll-reports.model";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const columns: ColumnsType<CashBondRateChangeResponse> = [
  {
    title: "Changed",
    dataIndex: "changedAt",
    key: "changedAt",
    width: 150,
    render: (v: string) => dayjs(v).format("MMM DD, YYYY h:mm A"),
  },
  {
    title: "From",
    dataIndex: "oldRate",
    key: "oldRate",
    align: "right",
    width: 110,
    render: fmt,
  },
  {
    title: "To",
    dataIndex: "newRate",
    key: "newRate",
    align: "right",
    width: 110,
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  { title: "Reason", dataIndex: "reason", key: "reason" },
];

interface Props {
  employeeId: string | undefined;
}

// Every change to an employee's per-run cash bond, newest first. History only: a rate change
// never moves the collected total, and who made it is in the audit log.
export function CashBondRateHistory({ employeeId }: Props) {
  const { data = [], isFetching } = useCashBondRateHistory(employeeId);

  return (
    <Table
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={isFetching}
      pagination={false}
      scroll={{ x: 560 }}
      locale={{ emptyText: "The rate has not been changed yet" }}
    />
  );
}
