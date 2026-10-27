import { useState } from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { DeductionApplicationResponse } from "../../models/api/response/deduction-application-response.model";
import { FREQUENCY_LABEL, PAY_MODE_LABEL } from "../../constants/label.const";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { RecordOpenAction } from "@/shared/components/record-open-action";
import { ApprovalListStatus } from "@/shared/components/approval-status-cell/approval-list-status";
import { formatMoney } from "@/shared/utils/money.util";

interface Props {
  data: DeductionApplicationResponse[];
  loading?: boolean;
  employeeMap?: Record<string, string>;
  deductionMap?: Record<string, string>;
  onEdit: (record: DeductionApplicationResponse) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string, note?: string) => void;
  onDecline: (id: string, note?: string) => void;
  actionLoading?: boolean;
  /** Offer Approve/Decline on pending rows (off on the view-only In Progress tab). Default true. */
  canApprove?: boolean;
  /** Show the step and who a pending row waits on in the status column. */
  showApprovalProgress?: boolean;
}

export default function DeductionApplicationTable({
  data,
  loading,
  employeeMap = {},
  deductionMap = {},
  onEdit,
  onDelete,
  onApprove,
  onDecline,
  actionLoading,
  canApprove = true,
  showApprovalProgress,
}: Props) {
  const canEdit = useHasPermission("Loan/Deduction:Edit");
  const [actionTarget, setActionTarget] = useState<{
    record: DeductionApplicationResponse;
    action: "Approved" | "Declined";
  } | null>(null);
  const { data: instance } = useApprovalInstance(
    "Loan",
    actionTarget?.record.id,
  );
  const columns: ColumnsType<DeductionApplicationResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (v) => employeeMap[v] ?? v,
    },
    {
      title: "Deduction",
      dataIndex: "deductionId",
      key: "deductionId",
      render: (v) => deductionMap[v] ?? v,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (v) =>
        v ? dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY") : "—",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (v) =>
        v ? dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY") : "—",
    },
    {
      title: "How Taken",
      dataIndex: "payMode",
      key: "payMode",
      render: (v?: string) =>
        PAY_MODE_LABEL[v ?? "FixedSchedule"] ?? PAY_MODE_LABEL.FixedSchedule,
    },
    {
      title: "Frequency",
      dataIndex: "frequencyOfPayment",
      key: "frequencyOfPayment",
      render: (v) => <Tag>{FREQUENCY_LABEL[v] ?? v}</Tag>,
    },
    {
      title: "Terms",
      dataIndex: "terms",
      key: "terms",
      align: "right",
    },
    {
      title: "Principal",
      dataIndex: "totalPrincipal",
      key: "totalPrincipal",
      align: "right",
      render: (v: number) => (v == null ? "" : formatMoney(v)),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (v: number) => (v == null ? "" : formatMoney(v)),
    },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      render: (v: string | undefined, r) => (
        <ApprovalListStatus
          applicationType="Loan"
          applicationId={r.id}
          approvalStatus={v}
          showProgress={showApprovalProgress}
        >
          <Tag color={APPROVAL_STATUS_COLOR[v ?? ""] ?? "default"}>
            {APPROVAL_STATUS_LABEL[v ?? ""] ?? v ?? "—"}
          </Tag>
        </ApprovalListStatus>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          {canApprove && record.approvalStatus === "ForApproval" && (
            <>
              <PermissionGate permission="Loan/Deduction:Approve">
                <Button
                  size="small"
                  type="text"
                  icon={<CheckOutlined />}
                  title="Approve"
                  onClick={() =>
                    setActionTarget({ record, action: "Approved" })
                  }
                />
              </PermissionGate>
              <PermissionGate permission="Loan/Deduction:Approve">
                <Button
                  size="small"
                  type="text"
                  icon={<CloseOutlined />}
                  danger
                  title="Decline"
                  onClick={() =>
                    setActionTarget({ record, action: "Declined" })
                  }
                />
              </PermissionGate>
            </>
          )}
          <RecordOpenAction
            size="small"
            canEdit={canEdit}
            onOpen={() => onEdit(record)}
          />
          <PermissionGate permission="Loan/Deduction:Delete">
            <Popconfirm
              title="Delete this loan/deduction record?"
              onConfirm={() => onDelete(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button
                aria-label="Delete"
                size="small"
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        scroll={{ x: "max-content" }}
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: false }}
      />
      <ApprovalActionModal
        open={!!actionTarget}
        action={actionTarget?.action ?? "Approved"}
        noteRequirement={instance?.currentStepNoteRequirement}
        loading={actionLoading}
        onCancel={() => setActionTarget(null)}
        onConfirm={(note) => {
          if (!actionTarget) return;
          if (actionTarget.action === "Approved")
            onApprove(actionTarget.record.id, note);
          else onDecline(actionTarget.record.id, note);
          setActionTarget(null);
        }}
      />
    </>
  );
}
