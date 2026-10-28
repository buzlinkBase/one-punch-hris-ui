import { Modal, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PayrollSourceItem } from "../../models/api/response/payroll-run-result.model";
import { formatMoney } from "@/shared/utils/money.util";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  employeeName?: string;
  // The column the amount belongs to, e.g. "Basic".
  title: string;
  // The amount as shown in the table; any part the sources don't explain is listed as "Other".
  amount: number;
  items: PayrollSourceItem[];
}

const EPSILON = 0.005;

export default function PayrollSourceModal({
  open,
  onClose,
  employeeName,
  title,
  amount,
  items,
}: Props) {
  const itemsTotal = items.reduce((s, i) => s + i.amount, 0);
  const rest = amount - itemsTotal;
  const rows =
    Math.abs(rest) >= EPSILON
      ? [
          ...items,
          {
            label: "Other (not itemized)",
            amount: rest,
            note: "Part of this amount has no separate source record.",
          },
        ]
      : items;

  const columns: ColumnsType<PayrollSourceItem> = [
    { title: "Source", dataIndex: "label", key: "label" },
    {
      title: "Details",
      dataIndex: "note",
      key: "note",
      render: (v?: string | null) => v || "—",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (v: number) => (
        <Text type={v < 0 ? "danger" : undefined}>{formatMoney(v)}</Text>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={640}
      title={`${employeeName ? `${employeeName} — ` : ""}${title} breakdown`}
    >
      <Table
        rowKey={(r) => `${r.label}-${r.note ?? ""}-${r.amount}`}
        dataSource={rows}
        columns={columns}
        size="small"
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              <strong>Total</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
              <Text strong>{formatMoney(amount)}</Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Modal>
  );
}
