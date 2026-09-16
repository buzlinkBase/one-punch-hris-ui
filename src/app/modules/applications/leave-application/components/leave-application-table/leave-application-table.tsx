import { useState } from "react";
import { Table, Button, Space, Popconfirm, Tag, Tooltip } from "antd";
import {
  EditOutlined,
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

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
  Withdrawn: "default",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
  Withdrawn: "Withdrawn",
};

interface Props {
  data: LeaveApplicationResponse[];
  employees: EmployeeFilterResponse[];
  leaveTypes: LeaveTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (record: LeaveApplicationResponse, note?: string) => void;
  onDecline?: (record: LeaveApplicationResponse, note?: string) => void;
  actionLoading?: boolean;
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
}: Props) {
  const navigate = useNavigate();
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
    status: 120,
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
      render: (val: string) => (
        <Tag color={STATUS_COLOR[val] ?? "default"}>
          {STATUS_LABEL[val] ?? val}
        </Tag>
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
            <PermissionGate permission={["Leave:Edit", "Leave:Approve"]}>
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => setActionTarget({ record, action: "Approved" })}
              />
            </PermissionGate>
          )}
          {onDecline && record.approvalStatus === "ForApproval" && (
            <PermissionGate permission={["Leave:Edit", "Leave:Approve"]}>
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={() => setActionTarget({ record, action: "Declined" })}
              />
            </PermissionGate>
          )}
          <PermissionGate permission={["Leave:Edit", "Leave:Approve"]}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() =>
                navigate({ to: `/applications/leave/${record.id}` })
              }
            />
          </PermissionGate>
          {onDelete && (
            <PermissionGate permission="Leave:Delete">
              <Popconfirm
                title="Delete this leave application?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </PermissionGate>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
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
