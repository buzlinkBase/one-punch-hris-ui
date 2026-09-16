import { useState } from "react";
import { Table, Button, Space, Popconfirm, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { OvertimeApplicationResponse } from "../../models/api/response/overtime-application-response.model";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import { OVERTIME_APPLICATION_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import dayjs from "dayjs";

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Withdrawn: "default",
  Declined: "error",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
  Withdrawn: "Withdrawn",
};

interface Props {
  data: OvertimeApplicationResponse[];
  employees: EmployeeFilterResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (record: OvertimeApplicationResponse, note?: string) => void;
  onDecline?: (record: OvertimeApplicationResponse, note?: string) => void;
  actionLoading?: boolean;
}

export default function OvertimeApplicationTable({
  data,
  employees,
  loading,
  onDelete,
  onApprove,
  onDecline,
  actionLoading,
}: Props) {
  const navigate = useNavigate();
  const [actionTarget, setActionTarget] = useState<{
    record: OvertimeApplicationResponse;
    action: "Approved" | "Declined";
  } | null>(null);
  const { data: instance } = useApprovalInstance(
    "Overtime",
    actionTarget?.record.id,
  );

  const empMap = new Map(employees.map((e) => [e.id, e.name ?? e.id]));

  const { widths, handleResize } = useResizableColumns({
    employee: 200,
    otDate: 110,
    startTime: 120,
    endTime: 120,
    otHours: 100,
    status: 120,
  });

  const columns: ColumnsType<OvertimeApplicationResponse> = [
    {
      title: OVERTIME_APPLICATION_LABEL.EMPLOYEE,
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
      title: OVERTIME_APPLICATION_LABEL.OT_DATE,
      dataIndex: "otDate",
      key: "otDate",
      width: widths.otDate,
      onHeaderCell: () =>
        ({
          width: widths.otDate,
          onResize: (w: number) => handleResize("otDate", w),
        }) as object,
    },
    {
      title: OVERTIME_APPLICATION_LABEL.START_TIME,
      dataIndex: "startTime",
      key: "startTime",
      width: widths.startTime,
      onHeaderCell: () =>
        ({
          width: widths.startTime,
          onResize: (w: number) => handleResize("startTime", w),
        }) as object,
      render: (val: string) => (val ? dayjs(val).format("hh:mm A") : ""),
    },
    {
      title: OVERTIME_APPLICATION_LABEL.END_TIME,
      dataIndex: "endTime",
      key: "endTime",
      width: widths.endTime,
      onHeaderCell: () =>
        ({
          width: widths.endTime,
          onResize: (w: number) => handleResize("endTime", w),
        }) as object,
      render: (val: string, r) => {
        if (!val) return "";
        const crossDay =
          r.startTime &&
          dayjs(val).format("YYYY-MM-DD") !==
            dayjs(r.startTime).format("YYYY-MM-DD");
        return (
          <Space size={4}>
            {dayjs(val).format("hh:mm A")}
            {crossDay && (
              <Tag color="orange" className="text-[10px]! m-0!">
                +1
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: OVERTIME_APPLICATION_LABEL.OT_MINUTES,
      dataIndex: "manualOTMinutes",
      key: "manualOTMinutes",
      width: widths.manualOTMinutes,
      onHeaderCell: () =>
        ({
          width: widths.manualOTMinutes,
          onResize: (w: number) => handleResize("manualOTMinutes", w),
        }) as object,
      render: (val: number) =>
        val != null ? `${(val / 60).toFixed(2)} hrs` : "-",
    },
    {
      title: OVERTIME_APPLICATION_LABEL.STATUS,
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
            <PermissionGate permission={["Overtime:Edit", "Overtime:Approve"]}>
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => setActionTarget({ record, action: "Approved" })}
              />
            </PermissionGate>
          )}
          {onDecline && record.approvalStatus === "ForApproval" && (
            <PermissionGate permission={["Overtime:Edit", "Overtime:Approve"]}>
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={() => setActionTarget({ record, action: "Declined" })}
              />
            </PermissionGate>
          )}
          <PermissionGate permission={["Overtime:Edit", "Overtime:Approve"]}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() =>
                navigate({ to: `/applications/overtime/${record.id}` })
              }
            />
          </PermissionGate>
          {onDelete && (
            <PermissionGate permission="Overtime:Delete">
              <Popconfirm
                title="Delete this overtime application?"
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
