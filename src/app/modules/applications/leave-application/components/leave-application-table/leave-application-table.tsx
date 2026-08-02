import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { LeaveApplicationResponse } from "../../models/api/response/leave-application-response.model";
import type { LeaveTypeResponse } from "@/app/modules/setup/leave-type/models/api/response/leave-type-response.model";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import { LEAVE_APPLICATION_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Declined: "error",
  Cancelled: "default",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Declined: "Declined",
  Cancelled: "Cancelled",
};

interface Props {
  data: LeaveApplicationResponse[];
  employees: EmployeeFilterResponse[];
  leaveTypes: LeaveTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function LeaveApplicationTable({
  data,
  employees,
  leaveTypes,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();

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
      dataIndex: "dayType",
      key: "dayType",
      width: widths.dayType,
      onHeaderCell: () =>
        ({
          width: widths.dayType,
          onResize: (w: number) => handleResize("dayType", w),
        }) as object,
      render: (val: string) => (val === "HalfDay" ? "Half Day" : "Whole Day"),
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
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate({ to: `/applications/leave/${record.id}` })}
          />
          {onDelete && record.approvalStatus === "ForApproval" && (
            <Popconfirm
              title="Cancel this leave application?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
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
