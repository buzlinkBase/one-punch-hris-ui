import { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  useApplyDtrReconcile,
  usePreviewDtrReconcile,
} from "../../hooks/use-leave-balance-queries";
import type { DtrReconcileLine } from "../../models/api/response/leave-balance-response.model";

const { Text } = Typography;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = CURRENT_YEAR - 2 + i;
  return { value: y, label: String(y) };
});

const formatDays = (days: number) => days.toFixed(2);

const COLUMNS: ColumnsType<DtrReconcileLine> = [
  {
    title: "Employee",
    key: "employee",
    render: (_, row) => (
      <div className="flex flex-col">
        <Text>{row.fullName || row.employeeId}</Text>
        {row.employeeNo && (
          <Text type="secondary" className="text-xs">
            {row.employeeNo}
          </Text>
        )}
      </div>
    ),
  },
  {
    title: "Leave Type",
    key: "leave",
    render: (_, row) => `${row.leaveCode} - ${row.leaveDescription}`,
  },
  {
    title: "Charged Now",
    dataIndex: "currentDays",
    align: "right",
    render: formatDays,
  },
  {
    title: "Per Posted DTR",
    dataIndex: "correctDays",
    align: "right",
    render: formatDays,
  },
  {
    title: "Balance Change",
    dataIndex: "delta",
    align: "right",
    // delta is the change in days charged, so the balance moves the opposite way.
    render: (delta: number) =>
      delta < 0 ? (
        <Tag color="green">+{formatDays(-delta)}</Tag>
      ) : (
        <Tag color="red">-{formatDays(delta)}</Tag>
      ),
  },
];

interface DtrReconcileModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Recompute from DTR": previews, per employee and leave type, what posted DTRs should have
 * charged against leave credits for a year versus what the ledger charges now, then applies
 * the differences as ledger corrections. Fixes deductions posted before leave hours were
 * converted to days, and charges left behind by DTR batches deleted before deletion rolled
 * the ledger back. Safe to run again: a second run finds nothing to change.
 */
export function DtrReconcileModal({ open, onClose }: DtrReconcileModalProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [messageApi, contextHolder] = message.useMessage();
  const preview = usePreviewDtrReconcile();
  const apply = useApplyDtrReconcile();

  const lines = preview.data ?? [];
  const hasPreview = preview.isSuccess;

  const handleClose = () => {
    preview.reset();
    apply.reset();
    onClose();
  };

  const handleYearChange = (value: number) => {
    setYear(value);
    preview.reset();
  };

  const handleApply = async () => {
    try {
      await apply.mutateAsync(year);
      messageApi.success(
        `Leave balances corrected for ${lines.length} employee leave type(s).`,
      );
      handleClose();
    } catch {
      // The error interceptor already shows the server's message.
    }
  };

  return (
    <Modal
      open={open}
      title="Recompute Leave Credits from DTR"
      width={900}
      onCancel={handleClose}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Close
        </Button>,
        <Button
          key="apply"
          type="primary"
          danger
          disabled={!hasPreview || lines.length === 0}
          loading={apply.isPending}
          onClick={handleApply}
        >
          Apply Corrections
        </Button>,
      ]}
    >
      {contextHolder}
      <div className="flex flex-col gap-4">
        <Text type="secondary">
          Compares what each posted DTR should charge against leave credits
          (leave hours converted to days) with what the ledger charges now.
          Nothing changes until you apply, and every change is recorded in the
          leave ledger as a DTR correction.
        </Text>

        <div className="flex flex-wrap items-center gap-3">
          <Text>Credits year</Text>
          <Select
            className="w-32"
            value={year}
            options={YEAR_OPTIONS}
            onChange={handleYearChange}
          />
          <Button
            loading={preview.isPending}
            onClick={() => preview.mutate(year)}
          >
            Preview
          </Button>
        </div>

        {hasPreview && lines.length === 0 && (
          <Alert
            type="success"
            showIcon
            message={`Leave credits for ${year} already match the posted DTRs. Nothing to correct.`}
          />
        )}

        {hasPreview && lines.length > 0 && (
          <Table<DtrReconcileLine>
            rowKey={(row) => `${row.employeeId}-${row.leaveId}`}
            columns={COLUMNS}
            dataSource={lines}
            size="small"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
          />
        )}
      </div>
    </Modal>
  );
}
