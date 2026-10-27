import type { ReactNode } from "react";
import { Button, Drawer, Table, Tabs, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { SignedAmount } from "../signed-amount/signed-amount";
import type { LedgerEntryResponse } from "../../models/api/response/payroll-reports.model";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { withRowKeys } from "@/shared/utils/row-key.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

const ENTRY_TYPE_COLOR: Record<string, string> = {
  Payroll: "blue",
  Accrual: "blue",
  Grant: "blue",
  CarryOver: "blue",
  Adjustment: "orange",
  DtrCorrection: "orange",
  Payout: "green",
  Release: "green",
  Refund: "green",
  Deduction: "red",
  Expiry: "red",
  Forfeiture: "red",
  Reserved: "gold",
  Released: "cyan",
  Reversal: "cyan",
};

const buildColumns = (
  amountLabel: string,
): ColumnsType<LedgerEntryResponse> => [
  {
    title: "Date",
    dataIndex: "entryDate",
    key: "date",
    width: 120,
    render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
  },
  {
    title: "Type",
    dataIndex: "entryType",
    key: "type",
    width: 120,
    render: (v: string) => <Tag color={ENTRY_TYPE_COLOR[v]}>{v}</Tag>,
  },
  {
    title: amountLabel,
    dataIndex: "amount",
    key: "amount",
    align: "right",
    width: 120,
    render: (v: number) => <SignedAmount value={v} />,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    width: 120,
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  { title: "Remarks", dataIndex: "remarks", key: "remarks" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Employee name, plus e.g. the leave type for Leave. */
  title: ReactNode;
  balanceLabel?: string;
  balance: number;
  /** What entries are counted in, e.g. "Days" for leave. Defaults to "Amount". */
  amountLabel?: string;
  entries: LedgerEntryResponse[];
  loading: boolean;
  /** Opens the +/− adjust modal for this employee; hidden without Payroll Reports:Edit. */
  onAdjust: () => void;
  /** A second tab beside the entries, e.g. Uniform Allowance's credit schedule. */
  extraTab?: { key: string; label: string; content: ReactNode };
}

// "View ledger" details for one employee: every signed movement, oldest first, with the balance
// after each. Adjusting appends a new +/− entry; past entries are never edited.
export function LedgerDrawer({
  open,
  onClose,
  title,
  balanceLabel = "Balance",
  balance,
  amountLabel = "Amount",
  entries,
  loading,
  onAdjust,
  extraTab,
}: Props) {
  const entriesTable = (
    <Table
      size="small"
      columns={buildColumns(amountLabel)}
      dataSource={withRowKeys(entries, (r) => `${r.entryDate}-${r.entryType}`)}
      loading={loading}
      pagination={false}
      scroll={{ x: 600 }}
      locale={{ emptyText: "No entries yet" }}
    />
  );

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size="large"
      rootClassName="[&_.ant-drawer-content-wrapper]:max-w-full"
      destroyOnHidden
      extra={
        <PermissionGate permission="Payroll Reports:Edit">
          <Button type="primary" icon={<EditOutlined />} onClick={onAdjust}>
            Adjust
          </Button>
        </PermissionGate>
      }
    >
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-sm text-gray-500">{balanceLabel}</span>
        <span className="text-xl font-semibold">{fmt(balance)}</span>
      </div>
      {extraTab ? (
        <Tabs
          items={[
            { key: "entries", label: "Entries", children: entriesTable },
            {
              key: extraTab.key,
              label: extraTab.label,
              children: extraTab.content,
            },
          ]}
        />
      ) : (
        entriesTable
      )}
    </Drawer>
  );
}
