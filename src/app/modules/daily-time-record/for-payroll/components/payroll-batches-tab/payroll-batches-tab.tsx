import { useState } from "react";
import {
  Button,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import {
  usePayrollBatches,
  useApproveBatch,
  useDeclineBatch,
  useDeletePayrollBatch,
  useRequestPayrollBatchDeletion,
  useApprovePayrollBatchDeletion,
  useDeclinePayrollBatchDeletion,
} from "../../hooks/use-for-payroll-queries";
import type { PayrollBatchListModel } from "../../models/api/response/payroll-batch-list.model";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
  RUN_TYPE_FEATURE,
  PAYROLL_TYPE_LABEL,
} from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

const { Text } = Typography;

const defaultRange = (): [string, string] => {
  const { fromDate, toDate } = getSemiMonthlyCutoff();
  return [fromDate, toDate];
};

// Persistent batch-list tab for Payroll Run approval — Approve/Decline/Delete a whole Generate
// run from here, mirroring dtr-batch-tab.tsx's structure exactly. Independent of the other
// Payroll Summary tabs' own (typically narrower) date range, so approving/reviewing older or
// backlogged runs isn't limited by whatever range the report tabs happen to be showing.
export default function PayrollBatchesTab() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string]>(defaultRange);
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = usePayrollBatches(dateRange[0], dateRange[1]);

  const { data: employees = [] } = useEmployees();
  const employeeName = (id?: string | null) =>
    employees.find((e) => e.id === id)?.fullName ?? undefined;

  const { mutateAsync: deleteBatch, isPending: isDeleting } =
    useDeletePayrollBatch();
  const { mutateAsync: approveBatch, isPending: isApproving } =
    useApproveBatch();
  const { mutateAsync: declineBatch, isPending: isDeclining } =
    useDeclineBatch();
  const { mutateAsync: requestDeletion, isPending: isRequestingDeletion } =
    useRequestPayrollBatchDeletion();
  const { mutateAsync: approveDeletion, isPending: isApprovingDeletion } =
    useApprovePayrollBatchDeletion();
  const { mutateAsync: declineDeletion, isPending: isDecliningDeletion } =
    useDeclinePayrollBatchDeletion();

  // kind distinguishes the batch's own posting approval from a separate deletion-request
  // approval on an already-posted batch — they're two different ApprovalInstance rows (see
  // backend ApprovalApplicationType.PayrollPosting vs PayrollPostingDeletion), so the
  // modal/timeline needs to know which one it's acting on.
  const [actionTarget, setActionTarget] = useState<{
    batch: PayrollBatchListModel;
    kind: "posting" | "deletion";
    action: "Approved" | "Declined";
  } | null>(null);
  const { data: instance } = useApprovalInstance(
    actionTarget?.kind === "deletion"
      ? "PayrollPostingDeletion"
      : "PayrollPosting",
    actionTarget?.batch.id,
  );
  const [historyTarget, setHistoryTarget] = useState<{
    id: string;
    kind: "posting" | "deletion";
  } | null>(null);

  const handleDelete = async (batchId?: string) => {
    if (!batchId) return;
    try {
      await deleteBatch(batchId);
      messageApi.success("Payroll run deleted.");
    } catch {
      messageApi.error("Failed to delete this payroll run. Please try again.");
    }
  };

  const handleRequestDeletion = async (batchId?: string) => {
    if (!batchId) return;
    try {
      await requestDeletion(batchId);
      messageApi.success(
        "Deletion requested. This payroll run will be removed once approved.",
      );
    } catch {
      messageApi.error(
        "Failed to request deletion for this payroll run. Please try again.",
      );
    }
  };

  const handleApprove = async (batchId: string, note?: string) => {
    try {
      await approveBatch({ batchId, note });
      messageApi.success(
        "Approval recorded. This run is posted as final once fully approved.",
      );
    } catch {
      messageApi.error("Failed to approve this payroll run. Please try again.");
    }
  };

  const handleDecline = async (batchId: string, note?: string) => {
    try {
      await declineBatch({ batchId, note });
      messageApi.success("Payroll run declined.");
    } catch {
      messageApi.error("Failed to decline this payroll run. Please try again.");
    }
  };

  const handleApproveDeletion = async (batchId: string, note?: string) => {
    try {
      await approveDeletion({ batchId, note });
      messageApi.success(
        "Deletion approved. This run is removed once fully approved.",
      );
    } catch {
      messageApi.error(
        "Failed to approve this deletion request. Please try again.",
      );
    }
  };

  const handleDeclineDeletion = async (batchId: string, note?: string) => {
    try {
      await declineDeletion({ batchId, note });
      messageApi.success("Deletion request declined. The run is kept.");
    } catch {
      messageApi.error(
        "Failed to decline this deletion request. Please try again.",
      );
    }
  };

  const columns: ColumnsType<PayrollBatchListModel> = [
    {
      title: "Period",
      key: "period",
      render: (_, g) =>
        `${dayjs(g.payPeriodStart).format("MMM DD")} – ${dayjs(g.payPeriodEnd).format("MMM DD, YYYY")}`,
    },
    {
      title: "Payout Date",
      key: "payDate",
      render: (_, g) =>
        g.payDate ? dayjs(g.payDate).format("MMM DD, YYYY") : "—",
    },
    {
      title: "Run Type",
      key: "payrollType",
      render: (_, g) => PAYROLL_TYPE_LABEL[g.payrollType] ?? g.payrollType,
    },
    {
      title: "Employees",
      key: "employeeCount",
      dataIndex: "employeeCount",
      align: "right",
    },
    {
      title: "Status",
      key: "status",
      render: (_, g) =>
        g.pendingDeletion ? (
          <Tag color="volcano">Pending Deletion</Tag>
        ) : (
          <Tag color={APPROVAL_STATUS_COLOR[g.approvalStatus] ?? "default"}>
            {APPROVAL_STATUS_LABEL[g.approvalStatus] ?? g.approvalStatus}
          </Tag>
        ),
    },
    {
      title: "Generated By",
      key: "generatedBy",
      render: (_, g) => employeeName(g.generatedByEmployeeId) ?? "—",
    },
    {
      title: "Remarks",
      key: "remarks",
      ellipsis: { showTitle: false },
      render: (_, g) =>
        g.remarks ? (
          <Tooltip title={g.remarks}>
            <Text type="secondary">{g.remarks}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 220,
      render: (_, g) => {
        const runTypeFeature = RUN_TYPE_FEATURE[g.payrollType] ?? "Payroll Run";
        return (
          <Space size={4}>
            <Tooltip title="View in Payroll Summary">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate({
                    to: "/payroll/summary",
                    search: { batchId: g.id },
                  })
                }
              />
            </Tooltip>
            <Tooltip title="History">
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() =>
                  setHistoryTarget({
                    id: g.id,
                    kind: g.pendingDeletion ? "deletion" : "posting",
                  })
                }
              />
            </Tooltip>
            {g.approvalStatus === "ForApproval" && (
              <PermissionGate permission={`${runTypeFeature}:Approve`}>
                <Tooltip title="Approve">
                  <Button
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() =>
                      setActionTarget({
                        batch: g,
                        kind: "posting",
                        action: "Approved",
                      })
                    }
                  />
                </Tooltip>
                <Tooltip title="Decline">
                  <Button
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() =>
                      setActionTarget({
                        batch: g,
                        kind: "posting",
                        action: "Declined",
                      })
                    }
                  />
                </Tooltip>
              </PermissionGate>
            )}
            {g.pendingDeletion && (
              <PermissionGate permission={`${runTypeFeature}:Approve`}>
                <Tooltip title="Approve Deletion">
                  <Button
                    danger
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() =>
                      setActionTarget({
                        batch: g,
                        kind: "deletion",
                        action: "Approved",
                      })
                    }
                  />
                </Tooltip>
                <Tooltip title="Decline Deletion">
                  <Button
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() =>
                      setActionTarget({
                        batch: g,
                        kind: "deletion",
                        action: "Declined",
                      })
                    }
                  />
                </Tooltip>
              </PermissionGate>
            )}
            <PermissionGate permission={`${runTypeFeature}:Create`}>
              <Popconfirm
                title={
                  g.isPosted
                    ? "Request deletion approval?"
                    : "Delete this payroll run?"
                }
                description={
                  g.isPosted
                    ? `This run is already posted — deleting it needs approval. Delete all ${g.employeeCount} record${g.employeeCount !== 1 ? "s" : ""} once approved?`
                    : `This removes all ${g.employeeCount} record${g.employeeCount !== 1 ? "s" : ""} in this run.`
                }
                okText={g.isPosted ? "Request Deletion" : "Delete"}
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                disabled={g.pendingDeletion}
                onConfirm={() =>
                  g.isPosted ? handleRequestDeletion(g.id) : handleDelete(g.id)
                }
              >
                <Tooltip
                  title={
                    g.pendingDeletion
                      ? "A deletion request is already pending approval for this run."
                      : g.isPosted
                        ? "Request deletion approval"
                        : "Delete"
                  }
                >
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    disabled={g.pendingDeletion}
                    loading={isDeleting || isRequestingDeletion}
                  />
                </Tooltip>
              </Popconfirm>
            </PermissionGate>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {contextHolder}
      <div className="flex justify-end">
        <Space wrap>
          <MobileRangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={(dates) => {
              if (dates)
                setDateRange([
                  dates[0]?.format("YYYY-MM-DD") ?? "",
                  dates[1]?.format("YYYY-MM-DD") ?? "",
                ]);
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchBatches()}
            loading={isLoadingBatches}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        size="small"
        dataSource={batches}
        columns={columns}
        loading={isLoadingBatches}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />

      <Modal
        open={!!historyTarget}
        onCancel={() => setHistoryTarget(null)}
        footer={null}
        title={
          historyTarget?.kind === "deletion"
            ? "Deletion Approval History"
            : "Approval History"
        }
      >
        <ApprovalTimeline
          applicationType={
            historyTarget?.kind === "deletion"
              ? "PayrollPostingDeletion"
              : "PayrollPosting"
          }
          applicationId={historyTarget?.id}
          resolveEmployeeName={employeeName}
        />
      </Modal>

      <ApprovalActionModal
        open={!!actionTarget}
        action={actionTarget?.action ?? "Approved"}
        noteRequirement={instance?.currentStepNoteRequirement}
        loading={
          isApproving ||
          isDeclining ||
          isApprovingDeletion ||
          isDecliningDeletion
        }
        onCancel={() => setActionTarget(null)}
        onConfirm={(note) => {
          if (!actionTarget) return;
          const { batch, kind, action } = actionTarget;
          if (kind === "deletion") {
            if (action === "Approved") {
              handleApproveDeletion(batch.id, note);
            } else {
              handleDeclineDeletion(batch.id, note);
            }
          } else {
            if (action === "Approved") {
              handleApprove(batch.id, note);
            } else {
              handleDecline(batch.id, note);
            }
          }
          setActionTarget(null);
        }}
      />
    </div>
  );
}
