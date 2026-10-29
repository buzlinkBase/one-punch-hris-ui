import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ApprovalDelegationResponse } from "../../models/approval-delegation.model";
import {
  describeDelegationDates,
  describeDelegationType,
} from "../../services/delegation-describe.util";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

interface Props {
  rows: ApprovalDelegationResponse[];
  loading?: boolean;
  /** Admin list: show both who is delegating and who approves instead. */
  showDelegator?: boolean;
  /** Which person the single column names: who approves for me (default), or whom I cover for. */
  counterpart?: "delegate" | "delegator";
  /** Omit for a read-only list (e.g. "delegated to me"). */
  onDeactivate?: (id: string) => void;
  deactivatingId?: string | null;
}

function statusTag(d: ApprovalDelegationResponse) {
  if (!d.isActive) return <Tag>Switched off</Tag>;
  if (!d.isInWindow) return <Tag color="warning">Not in effect (dates)</Tag>;
  return d.onlyWhileOnLeave ? (
    <Tag color="processing">On while on leave</Tag>
  ) : (
    <Tag color="success">In effect</Tag>
  );
}

export function DelegationTable({
  rows,
  loading,
  showDelegator,
  counterpart = "delegate",
  onDeactivate,
  deactivatingId,
}: Props) {
  const closed = useCompanyClosed();
  const columns: ColumnsType<ApprovalDelegationResponse> = [
    ...(showDelegator
      ? [
          {
            title: "Delegating",
            key: "delegator",
            render: (_: unknown, d: ApprovalDelegationResponse) =>
              d.delegatorName ?? d.delegatorEmployeeId,
          },
        ]
      : []),
    counterpart === "delegator" && !showDelegator
      ? {
          title: "Covering for",
          key: "delegator-only",
          render: (_, d) => d.delegatorName ?? d.delegatorEmployeeId,
        }
      : {
          title: showDelegator ? "Approves instead" : "Approves for me",
          key: "delegate",
          render: (_, d) => d.delegateName ?? d.delegateEmployeeId,
        },
    {
      title: "Requests",
      key: "type",
      render: (_, d) => describeDelegationType(d),
    },
    {
      title: "When",
      key: "when",
      render: (_, d) => (
        <Space direction="vertical" size={0}>
          <span>{describeDelegationDates(d)}</span>
          {d.reason && <span className="text-xs opacity-60">{d.reason}</span>}
        </Space>
      ),
    },
    { title: "Status", key: "status", render: (_, d) => statusTag(d) },
    // A closed company (read-only, suspended, on hold) switches nothing off.
    ...(onDeactivate && !closed
      ? [
          {
            title: "",
            key: "actions",
            width: 120,
            render: (_: unknown, d: ApprovalDelegationResponse) =>
              d.isActive ? (
                <Popconfirm
                  title="Switch this delegation off?"
                  description="They can no longer approve in your place."
                  okText="Switch off"
                  onConfirm={() => onDeactivate(d.id)}
                >
                  <Button size="small" loading={deactivatingId === d.id}>
                    Switch off
                  </Button>
                </Popconfirm>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <Table
      rowKey="id"
      size="small"
      loading={loading}
      dataSource={rows}
      columns={columns}
      pagination={rows.length > 10 ? { pageSize: 10 } : false}
      scroll={{ x: true }}
      locale={{ emptyText: "No delegations" }}
    />
  );
}
