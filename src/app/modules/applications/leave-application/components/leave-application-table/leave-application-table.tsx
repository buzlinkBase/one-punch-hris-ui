import { useState } from "react";
import { Button, Space, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { LeaveApplicationResponse } from "../../models/api/response/leave-application-response.model";
import type { LeaveTypeResponse } from "@/app/modules/setup/leave-type/models/api/response/leave-type-response.model";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import { LEAVE_APPLICATION_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { RecordOpenAction } from "@/shared/components/record-open-action";
import { ApprovalListStatus } from "@/shared/components/approval-status-cell/approval-list-status";
import { ConfirmAction } from "@/shared/components/confirm-action/confirm-action";
import { ResponsiveTable } from "@/shared/components/responsive-table/responsive-table";
import { tableEmptyLocale } from "@/shared/components/app-empty/table-empty-locale";
import { useTablePagination } from "@/shared/hooks/use-table-pagination";

interface Props {
  data: LeaveApplicationResponse[];
  employees: EmployeeFilterResponse[];
  leaveTypes: LeaveTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (record: LeaveApplicationResponse, note?: string) => void;
  onDecline?: (record: LeaveApplicationResponse, note?: string) => void;
  actionLoading?: boolean;
  /** Show the step and who a pending row waits on in the status column. */
  showApprovalProgress?: boolean;
}

export default function LeaveApplicationTable({
  data,
  employees,
  leaveTypes,
  loading,
  onDelete,
  onApprove,
  onDecline,
  actionLoading,
  showApprovalProgress,
}: Props) {
  const navigate = useNavigate();
  const { pagination } = useTablePagination();
  const canEdit = useHasPermission("Leave:Edit");
  const [actionTarget, setActionTarget] = useState<{
    record: LeaveApplicationResponse;
    action: "Approved" | "Declined";
  } | null>(null);
  const { data: instance } = useApprovalInstance(
    "Leave",
    actionTarget?.record.id,
  );

  const empMap = new Map(employees.map((e) => [e.id, e.name ?? e.id]));
  const leaveMap = new Map(
    leaveTypes.map((l) => [l.id, `${l.code} - ${l.description}`]),
  );

  const { widths, handleResize } = useResizableColumns({
    employee: 180,
    leaveType: 200,
    dateFrom: 120,
    dateTo: 120,
    dayType: 110,
    payType: 120,
    payoutMode: 130,
    status: 180,
  });

  const columns: ColumnsType<LeaveApplicationResponse> = [
    {
      title: LEAVE_APPLICATION_LABEL.EMPLOYEE,
      key: "employee",
      width: widths.employee,
      onHeaderCell: () =>
        ({
          width: widths.employee,
          onResize: (w: number) => handleResize("employee", w),
        }) as object,
      render: (_, r) => empMap.get(r.employeeId) ?? r.employeeId,
    },
    {
      title: LEAVE_APPLICATION_LABEL.LEAVE_TYPE,
      key: "leaveType",
      width: widths.leaveType,
      onHeaderCell: () =>
        ({
          width: widths.leaveType,
          onResize: (w: number) => handleResize("leaveType", w),
        }) as object,
      render: (_, r) => leaveMap.get(r.leaveId) ?? r.leaveId,
    },
    {
      title: LEAVE_APPLICATION_LABEL.DATE_FROM,
      dataIndex: "leaveDateFrom",
      key: "dateFrom",
      width: widths.dateFrom,
      onHeaderCell: () =>
        ({
          width: widths.dateFrom,
          onResize: (w: number) => handleResize("dateFrom", w),
        }) as object,
    },
    {
      title: LEAVE_APPLICATION_LABEL.DATE_TO,
      dataIndex: "leaveDateTo",
      key: "dateTo",
      width: widths.dateTo,
      onHeaderCell: () =>
        ({
          width: widths.dateTo,
          onResize: (w: number) => handleResize("dateTo", w),
        }) as object,
    },
    {
      title: LEAVE_APPLICATION_LABEL.DAY_TYPE,
      key: "dayType",
      width: widths.dayType,
      onHeaderCell: () =>
        ({
          width: widths.dayType,
          onResize: (w: number) => handleResize("dayType", w),
        }) as object,
      render: (_: unknown, r: LeaveApplicationResponse) => {
        if (r.durationType === "MultiDay") return <Tag>Multi-Day</Tag>;
        if (r.durationType === "Partial")
          return <Tag color="blue">Partial</Tag>;
        if (r.dayFraction === "AM") return "AM Half";
        if (r.dayFraction === "PM") return "PM Half";
        return "Full Day";
      },
    },
    {
      title: LEAVE_APPLICATION_LABEL.PAY_TYPE,
      dataIndex: "payType",
      key: "payType",
      width: widths.payType,
      onHeaderCell: () =>
        ({
          width: widths.payType,
          onResize: (w: number) => handleResize("payType", w),
        }) as object,
      render: (val: string) => (
        <Tag color={val === "WithoutPay" ? "red" : "green"}>
          {val === "WithoutPay" ? "Without Pay" : "With Pay"}
        </Tag>
      ),
    },
    {
      title: LEAVE_APPLICATION_LABEL.PAYOUT_MODE,
      key: "payoutMode",
      width: widths.payoutMode,
      onHeaderCell: () =>
        ({
          width: widths.payoutMode,
          onResize: (w: number) => handleResize("payoutMode", w),
        }) as object,
      render: (_: unknown, r: LeaveApplicationResponse) => {
        if (r.payType === "WithoutPay" || r.payoutMode !== "OneTime")
          return null;
        return (
          <Tooltip
            title={
              r.releasePayrollDate
                ? `Releases with the ${r.releasePayrollDate} payroll run`
                : "Release payroll date not set"
            }
          >
            <Tag color="purple">One Time</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: LEAVE_APPLICATION_LABEL.STATUS,
      dataIndex: "approvalStatus",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (val: string, r) => (
        <ApprovalListStatus
          applicationType="Leave"
          applicationId={r.id}
          approvalStatus={val}
          showProgress={showApprovalProgress}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          {onApprove && record.approvalStatus === "ForApproval" && (
            <PermissionGate permission="Leave:Approve">
              <Tooltip title="Approve">
                <Button
                  type="text"
                  aria-label="Approve"
                  className="text-green-600!"
                  icon={<CheckOutlined />}
                  onClick={() =>
                    setActionTarget({ record, action: "Approved" })
                  }
                />
              </Tooltip>
            </PermissionGate>
          )}
          {onDecline && record.approvalStatus === "ForApproval" && (
            <PermissionGate permission="Leave:Approve">
              <Tooltip title="Decline">
                <Button
                  type="text"
                  danger
                  aria-label="Decline"
                  icon={<CloseOutlined />}
                  onClick={() =>
                    setActionTarget({ record, action: "Declined" })
                  }
                />
              </Tooltip>
            </PermissionGate>
          )}
          <RecordOpenAction
            canEdit={canEdit}
            onOpen={() => navigate({ to: `/applications/leave/${record.id}` })}
          />
          {onDelete && (
            <PermissionGate permission="Leave:Delete">
              <ConfirmAction
                subject="leave application"
                name={empMap.get(record.employeeId)}
                consequence="Its approval history is removed too."
                onConfirm={() => onDelete(record.id)}
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    aria-label="Delete"
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </ConfirmAction>
            </PermissionGate>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ResponsiveTable
        rowKey="id"
        dataSource={data}
        columns={columns}
        size="small"
        loading={loading}
        pagination={pagination}
        locale={tableEmptyLocale("No leave applications found")}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
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
            onApprove?.(actionTarget.record, note);
          else onDecline?.(actionTarget.record, note);
          setActionTarget(null);
        }}
      />
    </>
  );
}
