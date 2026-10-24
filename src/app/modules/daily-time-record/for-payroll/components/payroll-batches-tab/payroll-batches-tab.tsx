import { useMemo, useState } from "react";
import {
  Button,
  Empty,
  Modal,
  Popconfirm,
  Select,
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
import { sortBatchesLatestFirst } from "../../pages/payroll-summary/utils/payroll-batch-option.util";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
  RUN_TYPE_FEATURE,
  PAYROLL_TYPE_LABEL,
} from "../../constants/label.const";
import {
  countActivePayrollBatchFilters,
  DEFAULT_PAYROLL_BATCH_FILTERS,
  filterPayrollBatches,
  type PayrollBatchFilters,
} from "../../utils/payroll-batch-filter.util";
import { BatchListFilters } from "@/shared/components/batch-list-filters/batch-list-filters";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

const { Text } = Typography;

// Opens on the current cutoff; the quick ranges and date picker reach older runs.
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
    data: batchData,
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = usePayrollBatches(dateRange[0], dateRange[1]);
  const batches = useMemo(
    () => sortBatchesLatestFirst(batchData ?? []),
    [batchData],
  );

  const { data: employees = [] } = useEmployees();
  const employeeName = (id?: string | null) =>
    employees.find((e) => e.id === id)?.fullName ?? undefined;

  const [filters, setFilters] = useState<PayrollBatchFilters>(
    DEFAULT_PAYROLL_BATCH_FILTERS,
  );
  const filteredBatches = filterPayrollBatches(batches, filters, employeeName);

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
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        a.payPeriodEnd.localeCompare(b.payPeriodEnd) ||
        a.payPeriodStart.localeCompare(b.payPeriodStart),
      render: (_, g) =>
        `${dayjs(g.payPeriodStart).format("MMM DD")} – ${dayjs(g.payPeriodEnd).format("MMM DD, YYYY")}`,
    },
    {
      title: "Payout Date",
      key: "payDate",
      sorter: (a, b) => (a.payDate ?? "").localeCompare(b.payDate ?? ""),
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
      <BatchListFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
        searchPlaceholder="Search remarks, generated by, period..."
        status={filters.status}
        onStatusChange={(status) => setFilters((f) => ({ ...f, status }))}
        extra={
          <Select
            value={filters.payrollType}
            onChange={(payrollType) =>
              setFilters((f) => ({ ...f, payrollType }))
            }
            options={[
              { value: "all", label: "All run types" },
              ...Object.entries(PAYROLL_TYPE_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            className="w-full sm:w-48"
          />
        }
        activeFilterCount={countActivePayrollBatchFilters(filters)}
        onReset={() => setFilters(DEFAULT_PAYROLL_BATCH_FILTERS)}
        onRefresh={() => refetchBatches()}
        isRefreshing={isLoadingBatches}
        shownCount={filteredBatches.length}
        totalCount={batches.length}
        noun="payroll run"
      />

      <Table
        rowKey="id"
        size="small"
        dataSource={filteredBatches}
        columns={columns}
        loading={isLoadingBatches}
        locale={{
          emptyText: (
            <Empty
              description={
                batches.length > 0
                  ? "No payroll runs match your filters."
                  : "No payroll runs in this date range."
              }
            >
              {batches.length > 0 && (
                <Button
                  onClick={() => setFilters(DEFAULT_PAYROLL_BATCH_FILTERS)}
                >
                  Clear filters
                </Button>
              )}
            </Empty>
          ),
        }}
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
