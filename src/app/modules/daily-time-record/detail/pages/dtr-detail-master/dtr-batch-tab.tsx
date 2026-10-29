import { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
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
import type { MenuProps } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDtrDetailBatchCodes,
  useDtrDetailMaster,
  useDeleteDtrBatch,
  useDeleteDtrBatchEmployee,
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
import {
  countActiveDtrBatchFilters,
  DEFAULT_DTR_BATCH_FILTERS,
  DTR_BATCH_STAGE_OPTIONS,
  filterDtrBatches,
  type DtrBatchFilters,
} from "../../utils/dtr-batch-filter.util";
import { BatchListFilters } from "@/shared/components/batch-list-filters/batch-list-filters";
import {
  filterPayrollGroupOption,
  payrollGroupOptionRender,
  toPayrollGroupOptions,
} from "@/shared/utils/payroll-group-options.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { apiErrorMessage } from "@/core/http/api-error";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

const { Text } = Typography;

// Opens on the current cutoff; the quick ranges and date picker reach older batches.
const defaultRange = (): [string, string] => {
  const { fromDate, toDate } = getSemiMonthlyCutoff();
  return [fromDate, toDate];
};

// Newest period first; code breaks ties between batches covering the same period.
const byLatestFirst = (a: BatchesModel, b: BatchesModel) =>
  (b.toDate ?? "").localeCompare(a.toDate ?? "") ||
  (b.fromDate ?? "").localeCompare(a.fromDate ?? "") ||
  (b.code ?? "").localeCompare(a.code ?? "");

export default function DtrBatchTab() {
  const [viewingBatchCode, setViewingBatchCode] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>(defaultRange);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {
    data: batchData,
    isLoading: isLoadingBatches,
    refetch: refetchBatches,
  } = useDtrDetailBatchCodes(dateRange[0], dateRange[1]);
  const batches = useMemo(
    () => [...(batchData ?? [])].sort(byLatestFirst),
    [batchData],
  );

  const { data: records = [], isLoading: isLoadingDetail } = useDtrDetailMaster(
    viewingBatchCode ?? "",
  );

  const viewingBatch = batches.find((b) => b.code === viewingBatchCode);
  // One employee can be taken out of a batch that hasn't been posted or paid by a payroll run
  // (the server enforces the same rules).
  const canRemoveEmployees =
    useHasPermission("DTR Master:Manage") &&
    !!viewingBatch &&
    !viewingBatch.isPosted &&
    !viewingBatch.isPayrollGenerated &&
    !viewingBatch.pendingDeletion;

  const { data: payrollGroups = [] } = usePayrollGroups();
  const payrollGroupLabel = (id?: string | null) =>
    payrollGroups.find((p) => p.id === id)?.code ??
    payrollGroups.find((p) => p.id === id)?.name;

  const { data: employees = [] } = useEmployees();
  const employeeName = (id?: string | null) =>
    employees.find((e) => e.id === id)?.fullName ?? undefined;

  const [filters, setFilters] = useState<DtrBatchFilters>(
    DEFAULT_DTR_BATCH_FILTERS,
  );
  const filteredBatches = filterDtrBatches(batches, filters, employeeName);

  const { mutateAsync: deleteBatch, isPending: isDeleting } =
    useDeleteDtrBatch();
  const { mutateAsync: removeEmployee } = useDeleteDtrBatchEmployee();
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

  const handleRemoveEmployee = async (employeeId: string, name?: string) => {
    if (!viewingBatchCode) return;
    try {
      await removeEmployee({ batchCode: viewingBatchCode, employeeId });
      messageApi.success(`${name ?? "Employee"} was removed from the batch.`);
    } catch (err) {
      messageApi.error(
        apiErrorMessage(
          err,
          "Failed to remove this employee. Please try again.",
        ),
      );
    }
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
      void downloadGroupedHeaderExcel(
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
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        (a.toDate ?? "").localeCompare(b.toDate ?? "") ||
        (a.fromDate ?? "").localeCompare(b.fromDate ?? ""),
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
      render: (_, r) =>
        r.generatedByName ?? employeeName(r.generatedByEmployeeId) ?? "—",
    },
    {
      title: "Generated At",
      key: "generatedAt",
      sorter: (a, b) =>
        (a.generatedAt ?? "").localeCompare(b.generatedAt ?? ""),
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
              aria-label="View"
              size="small"
              type={r.code === viewingBatchCode ? "primary" : "default"}
              icon={<EyeOutlined />}
              onClick={() => setViewingBatchCode(r.code ?? null)}
            />
          </Tooltip>
          <Tooltip title="History">
            <Button
              aria-label="History"
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
                  aria-label="Approve"
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
                  aria-label="Decline"
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
                  aria-label="Approve Deletion"
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
                  aria-label="Decline Deletion"
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
                  aria-label="Delete"
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
      <BatchListFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
        searchPlaceholder="Search batch code, description, generated by..."
        status={filters.status}
        onStatusChange={(status) => setFilters((f) => ({ ...f, status }))}
        extra={
          <>
            <Select
              allowClear
              showSearch
              placeholder="All payroll groups"
              value={filters.payrollGroupId}
              onChange={(payrollGroupId) =>
                setFilters((f) => ({ ...f, payrollGroupId }))
              }
              options={toPayrollGroupOptions(payrollGroups)}
              filterOption={filterPayrollGroupOption}
              optionRender={payrollGroupOptionRender}
              className="w-full sm:w-52"
            />
            <Select
              value={filters.stage}
              onChange={(stage) => setFilters((f) => ({ ...f, stage }))}
              options={DTR_BATCH_STAGE_OPTIONS}
              className="w-full sm:w-44"
            />
          </>
        }
        activeFilterCount={countActiveDtrBatchFilters(filters)}
        onReset={() => setFilters(DEFAULT_DTR_BATCH_FILTERS)}
        onRefresh={() => refetchBatches()}
        isRefreshing={isLoadingBatches}
        shownCount={filteredBatches.length}
        totalCount={batches.length}
        noun="DTR batch"
      />

      <Table
        rowKey="code"
        size="small"
        dataSource={filteredBatches}
        columns={columns}
        loading={isLoadingBatches}
        locale={{
          emptyText: (
            <Empty
              description={
                batches.length > 0
                  ? "No DTR batches match your filters."
                  : "No DTR batches in this date range."
              }
            >
              {batches.length > 0 && (
                <Button onClick={() => setFilters(DEFAULT_DTR_BATCH_FILTERS)}>
                  Clear filters
                </Button>
              )}
            </Empty>
          ),
        }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />

      {/* Opens in a popup instead of below the list, so it's seen without scrolling. */}
      <Modal
        open={!!viewingBatchCode}
        onCancel={() => setViewingBatchCode(null)}
        footer={null}
        destroyOnHidden
        className="modal-fullscreen"
        title={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-8">
            <span>DTR Detail</span>
            <Text code className="font-normal!">
              {viewingBatchCode}
            </Text>
            {viewingBatch && (
              <Space size={8} wrap className="font-normal">
                {viewingBatch.fromDate && viewingBatch.toDate && (
                  <Text type="secondary">
                    {`${dayjs(viewingBatch.fromDate).format("MMM DD")} – ${dayjs(viewingBatch.toDate).format("MMM DD, YYYY")}`}
                  </Text>
                )}
                {payrollGroupLabel(viewingBatch.payrollGroupId) && (
                  <Text type="secondary">
                    {payrollGroupLabel(viewingBatch.payrollGroupId)}
                  </Text>
                )}
                {viewingBatch.employeeCount !== undefined && (
                  <Text type="secondary">
                    {viewingBatch.employeeCount} employee
                    {viewingBatch.employeeCount !== 1 ? "s" : ""}
                  </Text>
                )}
                <Tag
                  className="m-0!"
                  color={
                    APPROVAL_STATUS_COLOR[viewingBatch.approvalStatus ?? ""] ??
                    "default"
                  }
                >
                  {APPROVAL_STATUS_LABEL[viewingBatch.approvalStatus ?? ""] ??
                    "Approved"}
                </Tag>
              </Space>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
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
          <DtrDetailTable
            data={records}
            loading={isLoadingDetail}
            readOnly
            onRemoveEmployee={
              canRemoveEmployees ? handleRemoveEmployee : undefined
            }
          />
        </div>
      </Modal>

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
