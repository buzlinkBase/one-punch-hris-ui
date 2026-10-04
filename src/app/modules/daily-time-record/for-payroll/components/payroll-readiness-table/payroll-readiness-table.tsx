import { useMemo, useState } from "react";
import {
  Button,
  Input,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import {
  READINESS_STATUS_COLOR,
  READINESS_STATUS_HINT,
  READINESS_STATUS_LABEL,
  READINESS_STATUS_ORDER,
  countByStatus,
  isPayable,
  type ReadinessRow,
  type ReadinessRowStatus,
} from "../../utils/payroll-readiness.util";

const { Text } = Typography;

type Filter = "all" | "payable" | ReadinessRowStatus;

interface Props {
  rows: ReadinessRow[];
  loading?: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

// The selected payroll group's employees for the cutoff with their readiness, so the payroll
// master picks who to pay straight from here. Only Ready / Partly ready rows can be checked --
// nobody else has an approved, unpaid day for a run to pay.
export default function PayrollReadinessTable({
  rows,
  loading,
  selectedIds,
  onSelectionChange,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => countByStatus(rows), [rows]);
  const payableIds = useMemo(
    () => rows.filter((r) => r.status === "Ready").map((r) => r.employeeId),
    [rows],
  );
  const partialIds = useMemo(
    () => rows.filter((r) => r.status === "Partial").map((r) => r.employeeId),
    [rows],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) =>
        filter === "all"
          ? true
          : filter === "payable"
            ? isPayable(r.status)
            : r.status === filter,
      )
      .filter(
        (r) =>
          !q ||
          (r.fullName ?? "").toLowerCase().includes(q) ||
          (r.employeeNo ?? "").toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          READINESS_STATUS_ORDER.indexOf(a.status) -
            READINESS_STATUS_ORDER.indexOf(b.status) ||
          (a.fullName ?? "").localeCompare(b.fullName ?? ""),
      );
  }, [rows, filter, search]);

  const filterOptions = [
    { value: "all", label: `All (${rows.length})` },
    {
      value: "payable",
      label: `Can be paid (${counts.Ready + counts.Partial})`,
    },
    ...READINESS_STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => ({
      value: s,
      label: `${READINESS_STATUS_LABEL[s]} (${counts[s]})`,
    })),
  ];

  const columns: ColumnsType<ReadinessRow> = [
    {
      title: "Employee",
      key: "employee",
      render: (_, r) => (
        <div className="flex flex-col">
          <Text>{r.fullName || r.employeeId}</Text>
          {r.employeeNo && (
            <Text type="secondary" className="text-xs">
              {r.employeeNo}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 190,
      render: (_, r) => (
        <Tooltip title={READINESS_STATUS_HINT[r.status]}>
          <Tag color={READINESS_STATUS_COLOR[r.status]}>
            {READINESS_STATUS_LABEL[r.status]}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: (
        <Tooltip title="Approved DTR days not yet in any payroll run — what a run pays now">
          Approved days
        </Tooltip>
      ),
      dataIndex: "approvedDays",
      key: "approvedDays",
      width: 130,
      align: "right",
      render: (v: number) =>
        v ? <Text strong>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: (
        <Tooltip title="DTR days still awaiting approval">Pending days</Tooltip>
      ),
      dataIndex: "pendingDays",
      key: "pendingDays",
      width: 200,
      align: "right",
      render: (v: number, r) =>
        v ? (
          <Tooltip
            title={
              r.pendingBatchCodes.length
                ? `DTR batch: ${r.pendingBatchCodes.join(", ")}`
                : undefined
            }
          >
            <Text type="warning">{v}</Text>
            {r.pendingBatchCodes.length > 0 && (
              <Text type="secondary" className="text-xs ml-2">
                {r.pendingBatchCodes.length === 1
                  ? r.pendingBatchCodes[0]
                  : `${r.pendingBatchCodes.length} batches`}
              </Text>
            )}
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: (
        <Tooltip title="DTR days already included in a saved payroll run">
          Already paid
        </Tooltip>
      ),
      dataIndex: "paidDays",
      key: "paidDays",
      width: 120,
      align: "right",
      render: (v: number) => (v ? v : <Text type="secondary">—</Text>),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="overflow-x-auto">
          <Segmented
            size="small"
            options={filterOptions}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
          />
        </div>
        <Space wrap>
          <Button
            size="small"
            disabled={!payableIds.length}
            onClick={() => onSelectionChange(payableIds)}
          >
            Select ready ({payableIds.length})
          </Button>
          {partialIds.length > 0 && (
            <Button
              size="small"
              onClick={() =>
                onSelectionChange([...new Set([...selectedIds, ...partialIds])])
              }
            >
              Add partly ready ({partialIds.length})
            </Button>
          )}
          <Button
            size="small"
            disabled={!selectedIds.length}
            onClick={() => onSelectionChange([])}
          >
            Clear
          </Button>
          <Input
            size="small"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search employee"
            style={{ width: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Space>
      </div>

      <Table
        rowKey="employeeId"
        size="small"
        loading={loading}
        dataSource={visible}
        columns={columns}
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          hideOnSinglePage: true,
        }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          preserveSelectedRowKeys: true,
          onChange: (keys) => onSelectionChange(keys as string[]),
          getCheckboxProps: (r) => ({ disabled: !isPayable(r.status) }),
        }}
      />
    </div>
  );
}
