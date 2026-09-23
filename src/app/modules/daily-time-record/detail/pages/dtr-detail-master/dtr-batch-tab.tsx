import { useState } from "react";
import {
  Button,
  Dropdown,
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
import type { MenuProps } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDtrDetailBatchCodes,
  useDtrDetailMaster,
  useDeleteDtrBatch,
  useApproveDtrBatch,
  useDeclineDtrBatch,
  useRequestDtrBatchDeletion,
  useApproveDtrBatchDeletion,
  useDeclineDtrBatchDeletion,
} from "../../hooks/use-dtr-detail-queries";
import DtrDetailTable from "../../components/dtr-detail-table";
import {
  buildDtrCsv,
  fmtCell,
  GROUPED_COLS,
  LEFT_COLS,
} from "../../utils/dtr-export.utils";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "../../constants/label.const";
import type { BatchesModel } from "../../../summary/models/api/response/batches.model";
import {
  downloadGroupedHeaderExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

const { Text } = Typography;

const defaultRange = (): [string, string] => {
  const { fromDate, toDate } = getSemiMonthlyCutoff();
  return [fromDate, toDate];
};

export default function DtrBatchTab() {
  const [viewingBatchCode, setViewingBatchCode] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>(defaultRange);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useDtrDetailBatchCodes(dateRange[0], dateRange[1]);

  const { data: records = [], isLoading: isLoadingDetail } = useDtrDetailMaster(
    viewingBatchCode ?? "",
  );

  const { data: payrollGroups = [] } = usePayrollGroups();
  const payrollGroupLabel = (id?: string | null) =>
    payrollGroups.find((p) => p.id === id)?.code ??
    payrollGroups.find((p) => p.id === id)?.name;

  const { data: employees = [] } = useEmployees();
  const employeeName = (id?: string | null) =>
    employees.find((e) => e.id === id)?.fullName ?? undefined;

  const { mutateAsync: deleteBatch, isPending: isDeleting } =
    useDeleteDtrBatch();
  const { mutateAsync: approveBatch, isPending: isApproving } =
    useApproveDtrBatch();
  const { mutateAsync: declineBatch, isPending: isDeclining } =
    useDeclineDtrBatch();
  const { mutateAsync: requestDeletion, isPending: isRequestingDeletion } =
    useRequestDtrBatchDeletion();
  const { mutateAsync: approveDeletion, isPending: isApprovingDeletion } =
    useApproveDtrBatchDeletion();
  const { mutateAsync: declineDeletion, isPending: isDecliningDeletion } =
    useDeclineDtrBatchDeletion();

  // kind distinguishes the batch's own posting approval from a separate deletion-request
  // approval on an already-posted batch — they're two different ApprovalInstance rows (see
  // backend ApprovalApplicationType.Dtr vs DtrDeletion), so the modal/timeline needs to know
  // which one it's acting on.
  const [actionTarget, setActionTarget] = useState<{
    batch: BatchesModel;
    kind: "posting" | "deletion";
    action: "Approved" | "Declined";
  } | null>(null);
  const { data: instance } = useApprovalInstance(
    actionTarget?.kind === "deletion" ? "DtrDeletion" : "Dtr",
    actionTarget?.batch.id ?? undefined,
  );
  const [historyTarget, setHistoryTarget] = useState<{
    id: string;
    kind: "posting" | "deletion";
  } | null>(null);

  const handleDelete = async (batchCode?: string) => {
    if (!batchCode) return;
    await deleteBatch(batchCode);
    messageApi.success(`Batch "${batchCode}" deleted.`);
    if (viewingBatchCode === batchCode) setViewingBatchCode(null);
    queryClient.invalidateQueries({
      queryKey: ["daily-time-record", "detail", "batch-codes"],
    });
  };

  const handleRequestDeletion = async (batchId?: string | null) => {
    if (!batchId) return;
    try {
      await requestDeletion(batchId);
      messageApi.success(
        "Deletion requested. This batch will be removed once approved.",
      );
    } catch {
      messageApi.error(
        "Failed to request deletion for this batch. Please try again.",
      );
    }
  };

  const handleApprove = async (batchId: string, note?: string) => {
    try {
      await approveBatch({ batchId, note });
      messageApi.success(
        "Approval recorded. This batch is posted once fully approved.",
      );
    } catch {
      messageApi.error("Failed to approve this batch. Please try again.");
    }
  };

  const handleDecline = async (batchId: string, note?: string) => {
    try {
      await declineBatch({ batchId, note });
      messageApi.success("DTR batch declined.");
    } catch {
      messageApi.error("Failed to decline this batch. Please try again.");
    }
  };

  const handleApproveDeletion = async (batchId: string, note?: string) => {
    try {
      await approveDeletion({ batchId, note });
      messageApi.success(
        "Deletion approved. This batch is removed once fully approved.",
      );
      if (viewingBatchCode) setViewingBatchCode(null);
    } catch {
      messageApi.error(
        "Failed to approve this deletion request. Please try again.",
      );
    }
  };

  const handleDeclineDeletion = async (batchId: string, note?: string) => {
    try {
      await declineDeletion({ batchId, note });
      messageApi.success("Deletion request declined. The batch is kept.");
    } catch {
      messageApi.error(
        "Failed to decline this deletion request. Please try again.",
      );
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    if (!records.length) {
      messageApi.info("No data to export. Click View on a batch first.");
      return;
    }
    const suffix = viewingBatchCode
      ? viewingBatchCode.replace(/[^a-zA-Z0-9_-]/g, "_")
      : dayjs().format("YYYYMMDD");
    if (format === "csv") {
      triggerDownload(buildDtrCsv(records), `dtr-detail-${suffix}.csv`);
    } else {
      downloadGroupedHeaderExcel(
        LEFT_COLS,
        GROUPED_COLS,
        records,
        fmtCell,
        `dtr-detail-${suffix}.xlsx`,
      );
    }
  };

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  const columns: ColumnsType<BatchesModel> = [
    {
      title: "Batch Code",
      dataIndex: "code",
      key: "code",
      render: (v) => (
        <Text code className="whitespace-nowrap">
          {v}
        </Text>
      ),
    },
    {
      title: "Period",
      key: "period",
      render: (_, r) =>
        r.fromDate && r.toDate
          ? `${dayjs(r.fromDate).format("MMM DD")} – ${dayjs(r.toDate).format("MMM DD, YYYY")}`
          : "—",
    },
    {
      title: "Payroll Group",
      key: "payrollGroup",
      render: (_, r) => payrollGroupLabel(r.payrollGroupId) ?? "—",
    },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      key: "employeeCount",
      align: "right",
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) =>
        r.pendingDeletion ? (
          <Tag color="volcano">Pending Deletion</Tag>
        ) : (
          <Tag
            color={APPROVAL_STATUS_COLOR[r.approvalStatus ?? ""] ?? "default"}
          >
            {APPROVAL_STATUS_LABEL[r.approvalStatus ?? ""] ?? "Approved"}
          </Tag>
        ),
    },
    {
      title: "Generated By",
      key: "generatedBy",
      render: (_, r) => employeeName(r.generatedByEmployeeId) ?? "—",
    },
    {
      title: "Generated At",
      key: "generatedAt",
      render: (_, r) =>
        r.generatedAt ? dayjs(r.generatedAt).format("MMM DD, YYYY HH:mm") : "—",
    },
    {
      title: "Posting Description",
      dataIndex: "postingDescription",
      key: "postingDescription",
      ellipsis: { showTitle: false },
      render: (v?: string | null) =>
        v ? (
          <Tooltip title={v}>
            <Text type="secondary">{v}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 220,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setViewingBatchCode(r.code ?? null)}
            />
          </Tooltip>
          <Tooltip title="History">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              disabled={!r.id}
              onClick={() =>
                r.id &&
                setHistoryTarget({
                  id: r.id,
                  kind: r.pendingDeletion ? "deletion" : "posting",
                })
              }
            />
          </Tooltip>
          {r.approvalStatus === "ForApproval" && (
            <PermissionGate permission="DTR Master:Approve">
              <Tooltip title="Approve">
                <Button
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() =>
                    setActionTarget({
                      batch: r,
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
                      batch: r,
                      kind: "posting",
                      action: "Declined",
                    })
                  }
                />
              </Tooltip>
            </PermissionGate>
          )}
          {r.pendingDeletion && (
            <PermissionGate permission="DTR Master:Approve">
              <Tooltip title="Approve Deletion">
                <Button
                  danger
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() =>
                    setActionTarget({
                      batch: r,
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
                      batch: r,
                      kind: "deletion",
                      action: "Declined",
                    })
                  }
                />
              </Tooltip>
            </PermissionGate>
          )}
          <PermissionGate permission="DTR Master:Manage">
            <Popconfirm
              title={r.isPosted ? "Request deletion approval?" : "Delete batch"}
              description={
                r.isPosted
                  ? `This batch is already posted — deleting it needs approval. Delete all records in "${r.code}" once approved?`
                  : `Delete all records in "${r.code}"?`
              }
              okText={r.isPosted ? "Request Deletion" : "Delete"}
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              disabled={r.isPayrollGenerated || r.pendingDeletion}
              onConfirm={() =>
                r.isPosted ? handleRequestDeletion(r.id) : handleDelete(r.code)
              }
            >
              <Tooltip
                title={
                  r.isPayrollGenerated
                    ? "Payroll has already been generated and saved from this batch — it can no longer be deleted."
                    : r.pendingDeletion
                      ? "A deletion request is already pending approval for this batch."
                      : r.isPosted
                        ? "Request deletion approval"
                        : "Delete"
                }
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  disabled={r.isPayrollGenerated || r.pendingDeletion}
                  loading={isDeleting || isRequestingDeletion}
                />
              </Tooltip>
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
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
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        rowKey="code"
        size="small"
        dataSource={batches}
        columns={columns}
        loading={isLoadingBatches}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />

      {viewingBatchCode && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Text strong>
              DTR Detail — <Text code>{viewingBatchCode}</Text>
            </Text>
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!records.length}
            >
              <Button
                size="small"
                icon={<DownloadOutlined />}
                disabled={!records.length}
              >
                Export
              </Button>
            </Dropdown>
          </div>
          <DtrDetailTable data={records} loading={isLoadingDetail} readOnly />
        </div>
      )}

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
            historyTarget?.kind === "deletion" ? "DtrDeletion" : "Dtr"
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
          if (!actionTarget?.batch.id) return;
          const { batch, kind, action } = actionTarget;
          if (kind === "deletion") {
            if (action === "Approved") {
              handleApproveDeletion(batch.id!, note);
            } else {
              handleDeclineDeletion(batch.id!, note);
            }
          } else {
            if (action === "Approved") {
              handleApprove(batch.id!, note);
            } else {
              handleDecline(batch.id!, note);
            }
          }
          setActionTarget(null);
        }}
      />
    </div>
  );
}
