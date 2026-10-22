import { Card, Statistic, Table, Tabs, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMyUniformAllowance } from "../../../shared/hooks/use-my-employee-queries";
import { UniformScheduleView } from "@/app/modules/reports/payroll-reports/components/uniform-schedule-view/uniform-schedule-view";
import type { LedgerEntryResponse } from "@/app/modules/reports/payroll-reports/models/api/response/payroll-reports.model";

const { Title } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const ENTRY_TYPE: Record<string, { color: string; label: string }> = {
  Accrual: { color: "blue", label: "Credited" },
  Adjustment: { color: "orange", label: "Adjustment" },
  Release: { color: "green", label: "Released" },
  Forfeiture: { color: "red", label: "Forfeited" },
  Expiry: { color: "red", label: "Expired" },
};

const columns: ColumnsType<LedgerEntryResponse> = [
  {
    title: "Date",
    dataIndex: "entryDate",
    key: "date",
    width: 130,
    render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
  },
  {
    title: "Type",
    dataIndex: "entryType",
    key: "type",
    width: 120,
    render: (v: string) => (
      <Tag color={ENTRY_TYPE[v]?.color}>{ENTRY_TYPE[v]?.label ?? v}</Tag>
    ),
  },
  { title: "Details", dataIndex: "remarks", key: "remarks" },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    width: 120,
    render: fmt,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    width: 120,
    render: fmt,
  },
];

/**
 * "My Uniform Allowance": the employee's balance, when and how it's credited (the rules, the next
 * credit dates, and why a month was skipped), and every movement on it.
 */
export default function PortalUniformAllowance() {
  const { data, isLoading } = useMyUniformAllowance();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Uniform Allowance
            </Title>
            <p className="page-toolbar-subtitle">
              Your balance, when the next credit lands, and how each one is
              decided.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Card size="small" className="mb-4 w-fit">
            <Statistic
              title="Current balance"
              value={data?.balance ?? 0}
              precision={2}
              prefix="₱"
              loading={isLoading}
            />
          </Card>
          <Tabs
            items={[
              {
                key: "schedule",
                label: "How it's credited",
                children: (
                  <UniformScheduleView
                    schedule={data}
                    loading={isLoading}
                    selfView
                  />
                ),
              },
              {
                key: "history",
                label: "Balance history",
                children: (
                  <Table<LedgerEntryResponse>
                    size="small"
                    rowKey={(r, i) => `${r.entryDate}-${r.entryType}-${i}`}
                    loading={isLoading}
                    dataSource={[...(data?.entries ?? [])].reverse()}
                    columns={columns}
                    scroll={{ x: 640 }}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                    locale={{ emptyText: "No uniform allowance yet" }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
