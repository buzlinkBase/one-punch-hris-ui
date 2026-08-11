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
import dayjs from "dayjs";

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
};

interface Props {
  data: OvertimeApplicationResponse[];
  employees: EmployeeFilterResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (record: OvertimeApplicationResponse) => void;
  onDecline?: (record: OvertimeApplicationResponse) => void;
}

export default function OvertimeApplicationTable({
  data,
  employees,
  loading,
  onDelete,
  onApprove,
  onDecline,
}: Props) {
  const navigate = useNavigate();

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
      render: (val: string) => (val ? dayjs(val).format("hh:mm A") : ""),
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
            <Popconfirm
              title="Approve this overtime request?"
              onConfirm={() => onApprove(record)}
              okText="Approve"
              cancelText="Cancel"
            >
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
              />
            </Popconfirm>
          )}
          {onDecline && record.approvalStatus === "ForApproval" && (
            <Popconfirm
              title="Decline this overtime request?"
              onConfirm={() => onDecline(record)}
              okText="Decline"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button type="text" danger icon={<CloseOutlined />} />
            </Popconfirm>
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              navigate({ to: `/applications/overtime/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this overtime application?"
              onConfirm={() => onDelete(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
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
  );
}
